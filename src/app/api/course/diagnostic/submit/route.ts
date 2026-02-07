import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";
import { gradeAnswer } from "@/lib/course/questions.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SubmitSchema = z.object({
  courseId: z.string().default("hs_ia"),
  sessionId: z.string().uuid(),
  answers: z.record(z.string().min(1)),
});

function scoreToGoal(score: number): number {
  if (score <= 4) return 55;
  if (score <= 7) return 65;
  return 80;
}

function levelLabel(correct: number, total: number): "low" | "mid" | "high" {
  const r = total === 0 ? 0 : correct / total;
  if (r < 0.4) return "low";
  if (r < 0.75) return "mid";
  return "high";
}

export async function POST(req: Request) {
  const supabase = await await supabaseServerAction();
  const sbr = await await supabaseServerReadOnly();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { courseId, sessionId, answers } = parsed.data;

  // 1) session取得
  const { data: session, error: sesErr } = await sbr
    .from("course_diagnostic_sessions")
    .select("id, user_id, course_id, questions_json, expires_at, created_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (sesErr || !session) {
    return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
  }
  if (session.user_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (new Date(session.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "Session expired" }, { status: 400 });
  }

  const qs: any[] = session.questions_json ?? [];

  // 2) 採点（テンプレgradeAnswerで判定）
  let total = 0;
  let correct = 0;

  const perArea: Record<string, { total: number; correct: number }> = {};
  const gradedAnswers: Record<string, any> = {};

  for (const q of qs) {
    total += 1;
    perArea[q.area] = perArea[q.area] ?? { total: 0, correct: 0 };
    perArea[q.area].total += 1;

    const userAnswer = (answers[q.id] ?? "").trim();
    const g = gradeAnswer(q.templateId, q.params, userAnswer);
    const ok = g.isCorrect;

    if (ok) {
      correct += 1;
      perArea[q.area].correct += 1;
    }

    gradedAnswers[q.id] = {
      area: q.area,
      topicId: q.topicId,
      templateId: q.templateId,
      params: q.params,
      userAnswer,
      isCorrect: ok,
      correctAnswer: g.correctAnswer,
    };
  }

  const recommendedGoal = scoreToGoal(correct);

  const areaLevels: Record<string, "low" | "mid" | "high"> = {};
  Object.keys(perArea).forEach((a) => {
    areaLevels[a] = levelLabel(perArea[a].correct, perArea[a].total);
  });

  // 3) おすすめトピック（弱い分野優先の簡易ロジック）
  // ここは後でplanと統合して賢くできる
  const areaRank = (v: string) => (v === "low" ? 0 : v === "mid" ? 1 : 2);
  const orderedAreas = Object.entries(areaLevels).sort((a, b) => areaRank(a[1]) - areaRank(b[1])).map(([k]) => k);

  const recommendedTopics = qs
    .filter((q) => orderedAreas.indexOf(q.area) === 0) // 最弱分野
    .map((q) => q.topicId)
    .filter((x, i, arr) => arr.indexOf(x) === i); // unique

  // 4) goalをDB更新
  const { error: upErr } = await supabase
    .from("course_user_settings")
    .upsert(
      {
        user_id: user.id,
        course_id: courseId,
        goal: recommendedGoal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  // 5) 診断結果をDB保存
  const { error: insResErr } = await supabase
    .from("course_diagnostic_results")
    .insert({
      user_id: user.id,
      course_id: courseId,
      session_id: sessionId,
      total,
      correct,
      area_levels: areaLevels,
      recommended_goal: recommendedGoal,
      recommended_topics: recommendedTopics,
      answers_json: gradedAnswers,
    });

  if (insResErr) {
    return NextResponse.json({ ok: false, error: insResErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    result: {
      total,
      correct,
      courseId,
      recommendedGoal,
      areaLevels,
      recommendedTopics,
    },
  });
}
