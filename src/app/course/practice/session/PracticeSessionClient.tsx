'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from "next/navigation";
import type { HintStep } from '@/lib/course/tutor';
import MathMarkdown from '@/components/MathMarkdown';
import Link from 'next/link';
import { explainProblem } from '@/lib/course/questions.service';
import type { AnswerKind, SubQuestion } from "@/lib/course/types";
import AnswerInput from "@/components/course/AnswerInput";
import { getAnswerDisplay } from "@/lib/course/answerDisplay";
import KaTeXBlock from "@/components/math/KaTeXBlock";
import { getTopicById } from "@/lib/course/topics";

type Question = {
  templateId: string;
  topicId: string;
  statement: string;
  answerKind: AnswerKind;
  params: Record<string, number>;
  choices?: string[];
  subQuestions?: SubQuestion[];
  signature?: string;
};

type GradeResult = {
  isCorrect: boolean;
  correctAnswer: string;
  partResults?: Record<string, { isCorrect: boolean; correctAnswer: string }>;
};

type Mode = 'practice' | 'review' | 'final';

export default function PracticeSessionClient({
  topicId,
  mode = 'practice',
  maxQuestions,
  topicPool,
  onFinalComplete,
  finalPassRate = 0.7,
}: {
  topicId: string;
  mode?: Mode;
  maxQuestions?: number;
  topicPool?: string[];
  onFinalComplete?: (result: { correct: number; total: number; passed: boolean }) => void;
  finalPassRate?: number;
}) {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const isReview = mode === 'review';
  const isFinal = mode === 'final';
  const isPooled = !!topicPool?.length;
  const poolKey = useMemo(() => (topicPool?.length ? topicPool.join("|") : topicId), [topicPool, topicId]);
  const storageKey = useMemo(
    () => `course_recent_${poolKey}_${mode}`,
    [poolKey, mode]
  );

  // ===== review設定（ここをいじるだけで体験調整できる） =====
  const REVIEW_TARGET_STREAK = 3;  // 3問連続正解で完了
  const REVIEW_MAX_QUESTIONS =
    Number.isFinite(maxQuestions) && (maxQuestions as number) > 0 ? (maxQuestions as number) : 10; // 念のため上限
  const isQuickMode = Number.isFinite(maxQuestions) && (maxQuestions as number) > 0;
  const FINAL_TOTAL =
    Number.isFinite(maxQuestions) && (maxQuestions as number) > 0 ? (maxQuestions as number) : 10;

  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string>>({});
  const [multiErrors, setMultiErrors] = useState<Record<string, string | null>>({});
  const [toast, setToast] = useState<string | null>(null);

  const [hintLoading, setHintLoading] = useState(false);
  const [hintStep, setHintStep] = useState<HintStep>(1);
  const [hintText, setHintText] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ===== reviewセッション状態 =====
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [reviewDone, setReviewDone] = useState(false);
  const [finalDone, setFinalDone] = useState(false);
  const [finalCorrect, setFinalCorrect] = useState(0);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const [mood, setMood] = useState<"focus" | "review" | "light">("focus");
  const [focusMode, setFocusMode] = useState(false);
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  const [recentSignatures, setRecentSignatures] = useState<string[]>([]);
  const [recentTopicIds, setRecentTopicIds] = useState<string[]>([]);
  const [courseId, setCourseId] = useState<string | null>(courseParam);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  // 「次の問題へ」押下可否（採点前に次へ行けないように）
  const sessionDone = isReview ? reviewDone : isFinal ? finalDone : false;
  const canGoNext = useMemo(() => {
    if (!question) return false;
    if (loading) return false;
    if (isReview || isFinal) return !!grade && !sessionDone; // review/final中は採点後のみ次へ
    return true; // practiceは今まで通り
  }, [question, loading, isReview, isFinal, grade, sessionDone]);

  const showQuickComplete = isQuickMode && reviewDone;
  const fetchQuestion = async () => {
    if (sessionDone) return;

    setLoading(true);
    setGrade(null);
    setHintText(null);
    setAnswer('');
    setAnswerError(null);
    setMultiAnswers({});
    setMultiErrors({});
    setFetchError(null);
    try {
      const res = await fetch('/api/course/questions/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          topicIds: topicPool && topicPool.length ? topicPool : undefined,
          recentTopicIds,
          recentTemplateIds,
          recentSignatures,
          courseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'error');
      setQuestion(data);
      if (data?.templateId) {
        setRecentTemplateIds((prev) => {
          const next = [data.templateId, ...prev.filter((id) => id !== data.templateId)];
          return next.slice(0, 6);
        });
      }
      if (data?.signature) {
        setRecentSignatures((prev) => {
          const next = [data.signature, ...prev.filter((sig) => sig !== data.signature)];
          return next.slice(0, 6);
        });
      }
      if (data?.topicId) {
        setRecentTopicIds((prev) => {
          const next = [data.topicId, ...prev.filter((id) => id !== data.topicId)];
          return next.slice(0, 6);
        });
      }
    } catch (e) {
      console.error(e);
      setFetchError('問題の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseParam) setCourseId(courseParam);
  }, [courseParam]);

  useEffect(() => {
    if (courseId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/course/settings", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) return;
        if (!cancelled) setCourseId(data.settings?.courseId ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  useEffect(() => {
    // topicが変わったらセッション状態も初期化
    setAnsweredCount(0);
    setCorrectStreak(0);
    setReviewDone(false);
    setFinalDone(false);
    setFinalCorrect(0);
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { ids?: string[]; sigs?: string[]; topics?: string[] };
          setRecentTemplateIds(Array.isArray(parsed?.ids) ? parsed.ids.slice(0, 6) : []);
          setRecentSignatures(Array.isArray(parsed?.sigs) ? parsed.sigs.slice(0, 6) : []);
          setRecentTopicIds(Array.isArray(parsed?.topics) ? parsed.topics.slice(0, 6) : []);
        } else {
          setRecentTemplateIds([]);
          setRecentSignatures([]);
          setRecentTopicIds([]);
        }
      } catch {
        setRecentTemplateIds([]);
        setRecentSignatures([]);
        setRecentTopicIds([]);
      }
    } else {
      setRecentTemplateIds([]);
      setRecentSignatures([]);
      setRecentTopicIds([]);
    }
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, mode, poolKey, courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ ids: recentTemplateIds, sigs: recentSignatures, topics: recentTopicIds })
      );
    } catch {
      // ignore
    }
  }, [recentTemplateIds, recentSignatures, recentTopicIds, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "course_last_topic",
        JSON.stringify({ topicId, updatedAt: new Date().toISOString(), courseId })
      );
      window.localStorage.setItem(
        "course_roadmap_current",
        JSON.stringify({ courseId, updatedAt: new Date().toISOString() })
      );
      window.dispatchEvent(new Event("course-roadmap-change"));
    } catch {
      // ignore storage errors
    }
  }, [topicId, courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("course_session_mood");
    if (saved === "focus" || saved === "review" || saved === "light") {
      setMood(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("course_session_mood", mood);
  }, [mood]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("course_session_focus");
    if (saved === "on") setFocusMode(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("course_session_focus", focusMode ? "on" : "off");
  }, [focusMode]);

  // ===== attempts保存（既に入れたやつ） =====
  const saveAttemptCourse = async (options: {
    userAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
    srsEvent?: boolean;
  }) => {
    if (!question) return;
    const effectiveTopicId = question.topicId ?? topicId;

    const payload = {
      mode: 'course',
      skillId: `course:${effectiveTopicId}`,
      courseTopicId: effectiveTopicId,
      templateId: question.templateId,
      params: question.params,
      userAnswer: options.userAnswer,

      // review UXの情報も meta に入れておく（後で分析できる）
      hintStepUsed: hintText ? hintStep : 0,
      hintMd: hintText ?? undefined,
      meta: {
        source: 'course',
        ui: 'practice/session',
        sessionMode: mode,
        srsEvent: options.srsEvent === true,
        answeredCount: answeredCount + 1, // 今回分を加味
        correctStreak: options.isCorrect ? correctStreak + 1 : 0,
      },
    };

    const res = await fetch('/api/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      console.error('Failed to save attempt (course)', data);
      throw new Error(data?.error ?? 'attempt insert failed');
    }
  };

  const finalizePracticeAndScheduleReview = async () => {
    if (loading) return;
    if (isPooled) {
      window.location.href = `/course/topics?r=${Date.now()}`;
      return;
    }

    setFinalizeLoading(true);
    try {
      const payload = {
        mode: "course",
        eventType: "practice_finalize",
        skillId: `course:${topicId}`,
        courseTopicId: topicId,
        meta: {
          source: "course",
          ui: "practice/session",
          sessionMode: mode,
          // ここに必要なら統計を載せられる（quality計算に使える）
          answeredCount,
          correctStreak,
        },
      };

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        console.error("Finalize failed:", data);
        throw new Error(data?.error ?? "finalize failed");
      }

      if (isQuickMode && REVIEW_MAX_QUESTIONS <= 3) {
        window.location.href = `/course?quick=1&r=${Date.now()}`;
      } else {
        window.location.href = `/course/topics?r=${Date.now()}`;
      }
    } catch (e) {
      console.error(e);
      setToast("復習スケジュールの作成に失敗しました（コンソールを確認してください）");
    } finally {
      setFinalizeLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question) return;
    if (reviewDone) return;
    if (question.answerKind === "multi") {
      const parts = question.subQuestions ?? [];
      for (const part of parts) {
        const value = multiAnswers[part.id];
        const err = multiErrors[part.id];
        if (part.answerKind === "multi_numeric" && err) {
          setToast(err);
          return;
        }
        if (!value) {
          setToast(`${part.label}を入力してください。`);
          return;
        }
      }
    }
    if (question.answerKind === "multi_numeric" && answerError) {
      setToast(answerError);
      return;
    }
    if (question.answerKind === "multi_numeric" && !answer) {
      setToast("解1と解2を入力するか、「実数解なし」を選択してください。");
      return;
    }

    setLoading(true);
    try {
      const userAnswer =
        question.answerKind === "multi" ? JSON.stringify(multiAnswers) : answer;
      const res = await fetch('/api/course/questions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: question.templateId,
          params: question.params,
          userAnswer,
        }),
      });

      const data: GradeResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'error');

      setGrade(data);

      // ===== review進捗更新 =====
      const nextAnswered = answeredCount + 1;
      setAnsweredCount(nextAnswered);

      let nextStreak = correctStreak;
      if (data.isCorrect) nextStreak = correctStreak + 1;
      else nextStreak = 0;

      setCorrectStreak(nextStreak);
      const nextFinalCorrect = finalCorrect + (data.isCorrect ? 1 : 0);
      if (isFinal) {
        setFinalCorrect(nextFinalCorrect);
      }

      // ===== attempts保存（採点成功後） =====
      // ★ 重要：SRS更新は「復習セッション完了の最後の1回」だけにしたい
      // - 復習モード かつ 今回の回答で streak が目標に到達する場合だけ srsEvent=true
      const willFinishReview =
        isReview && data.isCorrect && (nextStreak >= REVIEW_TARGET_STREAK);

      try {
        await saveAttemptCourse({
          userAnswer,
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          srsEvent: willFinishReview, // ★ここが2-2の本体
        });
      } catch (e) {
        console.error(e);
        setToast('（注意）学習履歴の保存に失敗しました。コンソールを確認してください。');
      }

      // ===== 完了判定 =====
      if (isReview) {
        if (nextStreak >= REVIEW_TARGET_STREAK) {
          setReviewDone(true);
          return;
        }
        if (nextAnswered >= REVIEW_MAX_QUESTIONS) {
          // 上限に達したら一旦終了扱い（ユーザーを詰ませない）
          setReviewDone(true);
          return;
        }
      }
      if (isFinal) {
        if (nextAnswered >= FINAL_TOTAL) {
          setFinalDone(true);
          if (onFinalComplete) {
            const passed = nextFinalCorrect / FINAL_TOTAL >= finalPassRate;
            onFinalComplete({ correct: nextFinalCorrect, total: FINAL_TOTAL, passed });
          }
          return;
        }
      }
    } catch (e) {
      console.error(e);
      setToast('採点に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleHint = async (step: HintStep) => {
    if (!question) return;
    setHintLoading(true);
    setHintStep(step);
    try {
      const res = await fetch('/api/course/tutor/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.statement,
          userAnswer: answer || null,
          hintStep: step,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'error');
      setHintText(data.hint);
    } catch (e) {
      console.error(e);
      setToast('ヒント生成に失敗しました');
    } finally {
      setHintLoading(false);
    }
  };

  // ===== 完了画面（final mode） =====
  if (isFinal && finalDone) {
    const passed = finalCorrect / FINAL_TOTAL >= finalPassRate;
    return (
      <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <Link href="/course" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
            ← コースTOPへ
          </Link>
          <Link href="/course/topics" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
            トピック一覧へ →
          </Link>
        </div>

        <div className="border rounded-2xl p-4 sm:p-6 bg-white shadow-sm space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold">
            修了テスト結果：{passed ? "合格" : "未達成"}
          </h2>
          <p className="text-gray-700 text-[11px] sm:text-sm">
            正答 {finalCorrect} / {FINAL_TOTAL}（合格基準: {Math.round(finalPassRate * 100)}%）
          </p>
          <div className={`text-[11px] sm:text-sm font-semibold ${passed ? "text-emerald-600" : "text-rose-600"}`}>
            {passed
              ? "おめでとう！このコースを修了しました。"
              : "もう少しで合格です。復習して再挑戦しましょう。"}
          </div>
        </div>
      </div>
    );
  }

  // ===== 完了画面（review mode） =====
  if (isReview && reviewDone) {
    const clearedByStreak = correctStreak >= REVIEW_TARGET_STREAK;
    const isShort = isQuickMode && REVIEW_MAX_QUESTIONS <= 3;

    return (
      <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <Link href="/course/review" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
            ← 復習一覧へ
          </Link>
          <Link href="/course" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
            コースTOPへ →
          </Link>
        </div>

        <div className="border rounded-2xl p-4 sm:p-6 bg-white shadow-sm space-y-2 sm:space-y-3">
          <h2 className="text-lg sm:text-xl font-semibold">{isShort ? "3問ショート完了" : "復習セッション完了"}</h2>

          <p className="text-gray-700 text-[11px] sm:text-sm">
            {clearedByStreak
              ? `連続${REVIEW_TARGET_STREAK}問正解できました！`
              : `このトピックを一旦ここまでにします（上限${REVIEW_MAX_QUESTIONS}問）。`}
          </p>

          <div className="text-[11px] sm:text-sm text-gray-600">
            回答数: {answeredCount} / 連続正解: {correctStreak}
          </div>
          {showQuickComplete ? (
            <div className="text-[10px] sm:text-xs text-emerald-700">
              余裕があればもう1セットやると定着が早いです。
            </div>
          ) : null}

          <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-2 pt-2">
            <Link
              href="/course/review"
            className="px-3 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner"
            >
              復習一覧へ戻る
            </Link>
            {isPooled ? (
              <Link
                href="/course/topics"
                className="px-3 py-2 rounded-full border hover:bg-gray-50 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner"
              >
                トピック一覧へ
              </Link>
            ) : (
              <Link
                href={`/course/topics/${topicId}`}
                className="px-3 py-2 rounded-full border hover:bg-gray-50 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner"
              >
                解説を見直す
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                // 同トピックでもう一回復習したいとき用
                setAnsweredCount(0);
                setCorrectStreak(0);
                setReviewDone(false);
                fetchQuestion();
              }}
            className="px-3 py-2 rounded-full border hover:bg-gray-50 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner"
            >
              {isShort ? "もう1セットやる" : "もう一回復習する"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-4 text-[11px] sm:text-sm space-y-2">
        {fetchError ? (
          <div className="rounded-[16px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
            <div className="flex items-center gap-2">
              <span>{fetchError}</span>
              <button
                type="button"
                onClick={fetchQuestion}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
              >
                再試行
              </button>
            </div>
          </div>
        ) : null}
        <div>{loading ? '読み込み中...' : '問題がありません'}</div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-2xl mx-auto p-3 sm:p-4 ${
        focusMode
          ? "space-y-2 rounded-2xl bg-white/70 shadow-sm backdrop-blur"
          : "space-y-3 sm:space-y-4"
      }`}
    >
      {toast ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-[10px] sm:text-sm text-rose-700 shadow-sm">
          {toast}
        </div>
      ) : null}
      {/* ナビ */}
      <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${focusMode ? "opacity-80" : ""}`}>
        <Link
          href={isReview ? "/course/review" : `/course/topics?r=${Date.now()}`}
          className="text-[10px] sm:text-sm text-blue-700 hover:underline px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm w-full sm:w-auto text-center transition active:scale-[0.98] active:shadow-inner"
        >
          ← {isReview ? '復習一覧へ' : 'トピック一覧へ'}
        </Link>

        {!isPooled && (
          <Link
            href={`/course/topics/${question?.topicId ?? topicId}`}
            className="text-[10px] sm:text-sm text-blue-700 hover:underline px-3 py-2 rounded-full bg-white border border-slate-200 shadow-sm w-full sm:w-auto text-center transition active:scale-[0.98] active:shadow-inner"
          >
            解説ページへ →
          </Link>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border chalkboard text-white p-4 sm:p-6">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Session</div>
            <h2 className="mt-2 text-lg sm:text-2xl font-semibold">
              {isReview ? '復習セッション' : '演習セッション'}
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] sm:text-xs text-white/90">
              {isReview ? "復習モード" : "演習モード"}
            </div>
          <div className="mt-2 text-[10px] sm:text-sm text-white/90">
              {(() => {
                const t = getTopicById(question.topicId);
                const label = t ? t.title : question.topicId;
                return `トピック: ${label}`;
              })()}
            </div>
          </div>
          {isReview ? (
            <div className="text-[10px] sm:text-sm text-white/80">
              連続正解: <span className="font-semibold">{correctStreak}</span> / {REVIEW_TARGET_STREAK}
            </div>
          ) : null}
        </div>
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
            回答数: {answeredCount}
          </span>
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-1.5 py-1">
            <button
              type="button"
              onClick={() => setMood("focus")}
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ${
                mood === "focus" ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10"
              }`}
            >
              集中
            </button>
            <button
              type="button"
              onClick={() => setMood("review")}
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ${
                mood === "review" ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10"
              }`}
            >
              復習
            </button>
            <button
              type="button"
              onClick={() => setMood("light")}
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] ${
                mood === "light" ? "bg-white text-slate-900" : "text-white/80 hover:bg-white/10"
              }`}
            >
              軽め
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFocusMode((v) => !v)}
            className={`rounded-full border border-white/20 px-3 py-1 ${
              focusMode ? "bg-white text-slate-900" : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            集中モード{focusMode ? "ON" : "OFF"}
          </button>
          <span className="hidden sm:inline text-white/80">気分/集中は保存されます</span>
        </div>
      </div>

      <div className={`border rounded-2xl ${focusMode ? "p-3" : "p-3 sm:p-4"} bg-white shadow-sm`}>
        <MathMarkdown content={question.statement} className="mb-3 sm:mb-4 prose max-w-none text-[12px] sm:text-base leading-relaxed" />

        <div className="mt-2">
          <label className="block text-[10px] sm:text-sm mb-1">解答</label>
          {question.answerKind === "multi" ? (
            <div className="space-y-3">
              {(question.subQuestions ?? []).map((part) => (
                <div key={part.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="text-[10px] sm:text-xs text-slate-500 mb-1">{part.label}</div>
                  <AnswerInput
                    answerKind={part.answerKind}
                    value={multiAnswers[part.id] ?? ""}
                    onChange={(value) => setMultiAnswers((prev) => ({ ...prev, [part.id]: value }))}
                    onErrorChange={(error) => setMultiErrors((prev) => ({ ...prev, [part.id]: error }))}
                    choices={part.choices}
                    placeholder={part.placeholder}
                  />
                </div>
              ))}
            </div>
          ) : (
            <AnswerInput
              answerKind={question.answerKind}
              value={answer}
              onChange={setAnswer}
              onErrorChange={setAnswerError}
              choices={question.choices}
            />
          )}
        </div>

        {grade && (
          <div className="mt-2 sm:mt-4 space-y-2">
            {(() => {
              if (question.answerKind !== "multi" || !grade.partResults) {
                return (
                  <p
                    className={
                      grade.isCorrect
                        ? "text-green-600 font-bold text-[10px] sm:text-sm"
                        : "text-red-600 font-bold text-[10px] sm:text-sm"
                    }
                  >
                    {grade.isCorrect ? "正解です！" : "不正解です。"}
                  </p>
                );
              }
              const parts = question.subQuestions ?? [];
              const total = parts.length;
              const correct = parts.filter((part) => grade.partResults?.[part.id]?.isCorrect).length;
              if (correct === total && total > 0) {
                return <p className="text-green-600 font-bold text-[10px] sm:text-sm">全問正解！</p>;
              }
              if (correct > 0) {
                return (
                  <p className="text-amber-600 font-bold text-[10px] sm:text-sm">
                    一部正解（{correct}/{total}）
                  </p>
                );
              }
              return <p className="text-red-600 font-bold text-[10px] sm:text-sm">不正解です。</p>;
            })()}

            {question.answerKind === "multi" && grade.partResults ? (
              <div className="border rounded-2xl p-3 bg-gray-50 space-y-2">
                <div className="text-[10px] sm:text-sm text-gray-800 font-semibold">各問の判定</div>
                <div className="grid gap-2">
                  {(question.subQuestions ?? []).map((part) => {
                    const result = grade.partResults?.[part.id];
                    if (!result) return null;
                    const display = getAnswerDisplay(result.correctAnswer);
                    return (
                      <div key={part.id} className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-[10px] sm:text-xs">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border px-2 py-0.5 text-[9px] text-slate-500">{part.label}</span>
                          <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                            {result.isCorrect ? "正解" : "不正解"}
                          </span>
                        </div>
                        {!result.isCorrect ? (
                          <span className="text-slate-700">
                            正答:{" "}
                            {display.kind === "tex" ? (
                              <KaTeXBlock tex={display.value} inline />
                            ) : (
                              display.value
                            )}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : !grade.isCorrect ? (
              <div className="border rounded-2xl p-3 bg-gray-50 space-y-2">
                <div className="text-[10px] sm:text-sm text-gray-800">
                  <span className="font-semibold">正しい答え：</span>
                  <span className="ml-1">
                    {(() => {
                      const display = getAnswerDisplay(grade.correctAnswer);
                      return display.kind === "tex" ? (
                        <KaTeXBlock tex={display.value} inline />
                      ) : (
                        display.value
                      );
                    })()}
                  </span>
                </div>

                {(() => {
                  const perProblem = question
                    ? explainProblem(question.templateId as any, question.params)
                    : null;

                  return perProblem ? (
                    <MathMarkdown content={perProblem} className="prose prose-sm max-w-none text-[11px] sm:text-base" />
                  ) : (
                    <p className="text-xs text-gray-600">この問題の解説は準備中です。</p>
                  );
                })()}

                {!focusMode ? (
                  <div className="pt-1">
                    <Link
                      href={`/course/topics/${topicId}`}
                      className="text-[11px] sm:text-sm text-blue-700 hover:underline"
                    >
                      解説ページで詳しく見る →
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || reviewDone}
            className="px-3 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-[10px] sm:text-sm w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner"
          >
            採点する
          </button>

          <button
            onClick={fetchQuestion}
            disabled={!canGoNext}
            className="px-3 py-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 text-[10px] sm:text-sm w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner"
            title={isReview && !grade ? '復習モードでは採点後に次へ進めます' : undefined}
          >
            次の問題へ
          </button>
        </div>

        {!isReview ? (
          <div className="mt-2 sm:mt-3">
            <button
              type="button"
              onClick={finalizePracticeAndScheduleReview}
              disabled={finalizeLoading || loading}
              className="w-full px-3 py-2 rounded-full border hover:bg-gray-50 disabled:opacity-50 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner sm:col-span-2"
            >
              {finalizeLoading
                ? "復習に回しています..."
                : "今日はこのトピックを終える（復習に回す）"}
            </button>

            {!focusMode ? (
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
                ※この操作で、このトピックが「復習スケジュール」に登録されます（SRS）。
              </p>
            ) : null}
          </div>
        ) : null}

        {isReview && !focusMode ? (
          <div className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3">
            ※復習モード：連続{REVIEW_TARGET_STREAK}問正解で完了。間違えると連続カウントはリセットされます。
          </div>
        ) : null}
      </div>

      {!focusMode ? (
        <div className="border rounded-2xl p-3 sm:p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="font-semibold text-sm sm:text-base">AIヒント</p>
            <span className="text-[10px] text-slate-400">タップで展開</span>
          </div>
          <div className="flex gap-2 mb-2 sm:mb-3 overflow-x-auto pb-1">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => handleHint(step as HintStep)}
                disabled={hintLoading}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] sm:text-sm border transition active:scale-[0.98] active:shadow-inner ${
                  hintStep === step ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                ヒント{step}
              </button>
            ))}
          </div>

          <div className="min-h-[72px] text-[10px] sm:text-sm">
            {hintLoading ? (
              'ヒント生成中...'
            ) : hintText ? (
              <MathMarkdown content={hintText} className="prose prose-sm max-w-none text-[11px] sm:text-base" />
            ) : (
              '必要なときに「ヒント1〜3」を押してください。'
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
