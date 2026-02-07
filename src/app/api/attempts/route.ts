import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";
import { gradeAnswerWithProblem } from "@/server/learning/grader";
import * as hints from "@/server/learning/hints";

// ★ course用の採点（テンプレ採点）
import { gradeAnswer as gradeCourseAnswer } from "@/lib/course/questions.service";
import type { QuestionParams } from "@/lib/course/types";

// -------------------- 既存 learn 用 --------------------
const AttemptLearnReq = z.object({
  mode: z.literal("learn").optional(), // ★ 既存互換：modeなしはlearnとして扱う
  skillId: z.string(),
  problemId: z.string().uuid().optional(),
  answerLatex: z.string().min(1),
  steps: z
    .array(
      z.object({
        src: z.string(),
        dst: z.string(),
        kind: z.string().optional(),
        var: z.string().optional(),
        factor: z.string().optional(),
        let: z.array(z.string()).optional(),
        subs: z.record(z.string()).optional(),
        note: z.string().optional(),
      })
    )
    .optional(),
  meta: z.record(z.any()).optional(),
});

// -------------------- ★追加 course 用 --------------------
const AttemptCourseReq = z.object({
  mode: z.literal("course"),
  // attemptsテーブルの skill_id は既存流用する（course用は擬似IDでOK）
  // 例: "course:quad_maxmin_basic"
  skillId: z.string(),

  // courseの識別情報
  courseTopicId: z.string(), // 例: quad_maxmin_basic
  templateId: z.string(), // QuestionTemplateId を文字列で受ける（zodで厳密化も可）
  params: z.record(z.number()), // QuestionParams

  // ユーザー入力
  userAnswer: z.string().min(1),

  // UIメタ
  hintStepUsed: z.number().int().min(0).max(3).optional(),
  elapsedMs: z.number().int().min(0).optional(),

  // すでにUI側でヒント生成しているなら保存しても良い（任意）
  hintMd: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

// -------------------- ★追加：courseイベント用（採点なしでSRSだけ更新） --------------------
const AttemptCourseEventReq = z.object({
  mode: z.literal("course"),
  eventType: z.literal("practice_finalize"),

  // 既存互換のため skillId/courseTopicId は保持
  skillId: z.string(),
  courseTopicId: z.string(),

  // UIメタ
  hintStepUsed: z.number().int().min(0).max(3).optional(),
  elapsedMs: z.number().int().min(0).optional(),
  meta: z.record(z.any()).optional(),
});

// ★ modeで分岐（既存のmodeなしlearn互換も維持）
const AttemptReq = z.union([AttemptCourseEventReq, AttemptCourseReq, AttemptLearnReq]);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = AttemptReq.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "supabase_disabled" }, { status: 503 });
  }

  const supabase = await await supabaseServerAction();
  const sbr = await await supabaseServerReadOnly();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const payload = parsed.data;

  // ============================================================
  // course 分岐（MVP course の attempts 保存 + SRS更新）
  // ============================================================
  if ("mode" in payload && payload.mode === "course") {

    // ============================================================
    // ★ courseイベント：practice_finalize（採点なしでSRSだけ更新）
    // ============================================================
    if ("eventType" in payload && payload.eventType === "practice_finalize") {
      // attemptsは「イベントログ」として軽く残す（ダミー回答なし）
      const { data: attempt, error: insErr } = await supabase
        .from("attempts")
        .insert({
          user_id: user.id,
          skill_id: payload.skillId,
          problem_id: null,
          answer_tex: "",       // ダミー回答を入れない
          steps_json: null,
          grading_json: { kind: "course_event", eventType: "practice_finalize" },
          hint_md: null,
          correct: false,
          score: 0,
          meta: {
            ...(payload.meta ?? {}),
            mode: "course",
            eventType: "practice_finalize",
            courseTopicId: payload.courseTopicId,
          },
        })
        .select()
        .single();

      if (insErr) {
        console.error("attempt insert failed (course event):", insErr);
        return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
      }

      // SRS更新（イベント発火）
      // ※このイベントは「学習終了」なので quality は固定で 4 が無難（十分理解した前提）
      //   もっと厳密にしたいなら meta に「直近正答率」等を入れてqualityに反映してもOK
      // 既に今日SRS更新していたら、二重更新を避ける（interval暴走防止）
      const { data: existingSrs } = await sbr
        .from("course_topic_srs")
        .select("updated_at")
        .eq("user_id", user.id)
        .eq("topic_id", payload.courseTopicId)
        .maybeSingle();

      const alreadyUpdatedToday =
        !!existingSrs?.updated_at &&
        new Date(existingSrs.updated_at).toDateString() === new Date().toDateString();

      let srs: any = null;

      if (!alreadyUpdatedToday) {
        try {
          const { data: srsData, error: srsErr } = await supabase.rpc("course_srs_update", {
            p_user_id: user.id,
            p_topic_id: payload.courseTopicId,
            p_quality: 3, // ★ 4→3 に変更（practice終了は伸びすぎ防止）
            p_attempt_id: attempt.id,
          });

          if (srsErr) {
            console.error("course_srs_update failed (course event):", srsErr);
          } else {
            srs = srsData ?? null;
          }
        } catch (e) {
          console.error("course_srs_update exception (course event):", e);
        }
      } else {
        // 今日は既に更新済み。intervalの暴走を防ぐためスキップ
        srs = null;
      }

      return NextResponse.json({
        ok: true,
        attempt,
        grading: { kind: "course_event", eventType: "practice_finalize" },
        hint: null,
        srs,
        next: null,
      });
    }

    if (!("templateId" in payload)) {
      return NextResponse.json({ ok: false, error: "Invalid course payload" }, { status: 400 });
    }

    const coursePayload = payload;

    // 1) テンプレ採点
    let grading: any = null;
    let correct = false;
    let correctAnswer: string | null = null;

    try {
      const g = gradeCourseAnswer(
        coursePayload.templateId as string,
        coursePayload.params as QuestionParams,
        coursePayload.userAnswer
      );

      grading = {
        kind: "course",
        ok: g.isCorrect,
        correctAnswer: g.correctAnswer,
      };
      correct = g.isCorrect;
      correctAnswer = g.correctAnswer;
    } catch (e: any) {
      console.error("Course grading failed:", e);
      return NextResponse.json(
        { ok: false, error: e?.message ?? "Course grading failed" },
        { status: 500 }
      );
    }

    // 2) attempts に保存
    const { data: attempt, error: insErr } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        skill_id: payload.skillId,         // 例: "course:quad_maxmin_basic"
        problem_id: null,                  // courseはproblems未使用
        answer_tex: coursePayload.userAnswer,    // 既存カラム流用（数値でもOK）
        steps_json: null,
        grading_json: grading,
        hint_md: coursePayload.hintMd ?? null,
        correct,
        score: correct ? 1 : 0,
        meta: {
          ...(coursePayload.meta ?? {}),
          mode: "course",
          courseTopicId: coursePayload.courseTopicId,
          templateId: coursePayload.templateId,
          params: coursePayload.params,
          hintStepUsed: coursePayload.hintStepUsed ?? 0,
          elapsedMs: coursePayload.elapsedMs ?? null,
          correctAnswer,
        },
      })
      .select()
      .single();

    if (insErr) {
      console.error("attempt insert failed:", insErr);
      return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
    }

    // 3) ★SRS更新（イベント時だけ実行）
    let srs: any = null;
    
    // meta.srsEvent === true のときだけ間隔更新する
    const doSrsUpdate = payload.meta?.srsEvent === true;
    
    if (doSrsUpdate) {
      // 既に今日SRS更新していたら、二重更新を避ける（interval暴走防止）
      const { data: existingSrs } = await sbr
        .from("course_topic_srs")
        .select("updated_at")
        .eq("user_id", user.id)
        .eq("topic_id", payload.courseTopicId)
        .maybeSingle();

      const alreadyUpdatedToday =
        !!existingSrs?.updated_at &&
        new Date(existingSrs.updated_at).toDateString() === new Date().toDateString();

      if (!alreadyUpdatedToday) {
        const hintStepUsed = payload.hintStepUsed ?? 0;
        const quality = correct ? (hintStepUsed > 0 ? 4 : 5) : 2;

        try {
          const { data: srsData, error: srsErr } = await supabase.rpc("course_srs_update", {
            p_user_id: user.id,
            p_topic_id: payload.courseTopicId,
            p_quality: quality,
            p_attempt_id: attempt.id,
          });

          if (srsErr) {
            console.error("course_srs_update failed:", srsErr);
          } else {
            srs = srsData ?? null;
          }
        } catch (e) {
          console.error("course_srs_update exception:", e);
        }
      } else {
        // 今日は既に更新済み。intervalの暴走を防ぐためスキップ
        srs = null;
      }
    }

    // 4) レスポンス（learn側の形を崩さず返す）
    return NextResponse.json({
      ok: true,
      attempt,
      grading,
      hint: payload.hintMd ? { message: payload.hintMd } : null,
      srs,
      next: null,
    });
  }

  // ============================================================
  // 既存 learn 処理（ほぼそのまま）
  // ============================================================

  // 既存互換：modeがない場合もここに来る
  const learnPayload = payload as z.infer<typeof AttemptLearnReq>;

  // 問題文を取得（あれば）
  let problem: any = null;
  if (learnPayload.problemId) {
    const { data: p } = await sbr
      .from("problems")
      .select("id, skill_id, kind, payload")
      .eq("id", learnPayload.problemId)
      .maybeSingle();
    problem = p ?? null;
  }

  // 1) 採点（数式検証サービス）
  const grade = await gradeAnswerWithProblem({
    problem,
    answerLatex: learnPayload.answerLatex,
    steps: learnPayload.steps ?? [],
  });

  // 2) ヒント（誤答タイプ→1行ヒント、解答は出さない）
  const hint = await hints.fromGrading({
    skillId: learnPayload.skillId,
    grading: grade,
    userLocale: "ja",
  });

  // 3) 保存（attempts）
  const { data: attempt, error: insErr } = await supabase
    .from("attempts")
    .insert({
      user_id: user.id,
      skill_id: learnPayload.skillId,
      problem_id: learnPayload.problemId ?? null,
      answer_tex: learnPayload.answerLatex,
      steps_json: learnPayload.steps ?? null,
      grading_json: grade,
      hint_md: hint?.message ?? null,
      correct: grade?.ok ?? false,
      score: "score" in (grade ?? {}) ? (grade as any).score ?? null : null,
      meta: learnPayload.meta ?? null,
    })
    .select()
    .single();

  if (insErr) {
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  // 4) マスタリ更新（簡易：正解なら間隔伸長、不正解ならリセット）
  // 簡易品質マッピング：正解=5 / 一部正解=3 / 不正解=1
  const items = "items" in (grade ?? {}) ? (grade as any).items : null;
  const quality =
    grade?.ok ? 5 :
    (Array.isArray(items) && items.some((it: any) => it.ok)) ? 3 : 1;

  await supabase.rpc("fsrs_update", {
    p_user_id: user.id,
    p_skill_id: learnPayload.skillId,
    p_quality: quality,
  });

  // 次アクション：同スキルの次の問題を1件
  let nextProblem = null;
  try {
    const { data: np } = await sbr
      .from("problems")
      .select("id, skill_id, kind, body_md, created_at")
      .eq("skill_id", learnPayload.skillId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    nextProblem = np || null;
  } catch {}

  return NextResponse.json({ ok: true, attempt, hint, grading: grade, next: nextProblem });
}
