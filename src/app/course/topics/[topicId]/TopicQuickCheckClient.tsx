"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MathMarkdown from "@/components/MathMarkdown";
import AnswerInput from "@/components/course/AnswerInput";
import type { AnswerKind, SubQuestion } from "@/lib/course/types";
import KaTeXBlock from "@/components/math/KaTeXBlock";
import { getAnswerDisplay } from "@/lib/course/answerDisplay";

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

export default function TopicQuickCheckClient({ topicId }: { topicId: string }) {
  const storageKey = `course_recent_quick_${topicId}`;
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("course");
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string>>({});
  const [multiErrors, setMultiErrors] = useState<Record<string, string | null>>({});
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>([]);
  const [recentSignatures, setRecentSignatures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(courseParam);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const loadQuestion = async () => {
    setLoading(true);
    setGrade(null);
    setAnswer("");
    setAnswerError(null);
    setMultiAnswers({});
    setMultiErrors({});
    setError(null);
    try {
      const res = await fetch("/api/course/questions/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, recentTemplateIds, recentSignatures, courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setQuestion(data as Question);
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
    } catch (e) {
      console.error(e);
      setError("問題の取得に失敗しました");
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
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { ids?: string[]; sigs?: string[] };
          setRecentTemplateIds(Array.isArray(parsed?.ids) ? parsed.ids.slice(0, 6) : []);
          setRecentSignatures(Array.isArray(parsed?.sigs) ? parsed.sigs.slice(0, 6) : []);
        } else {
          setRecentTemplateIds([]);
          setRecentSignatures([]);
        }
      } catch {
        setRecentTemplateIds([]);
        setRecentSignatures([]);
      }
    } else {
      setRecentTemplateIds([]);
      setRecentSignatures([]);
    }
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ ids: recentTemplateIds, sigs: recentSignatures })
      );
    } catch {
      // ignore
    }
  }, [recentTemplateIds, recentSignatures, storageKey]);

  const submit = async () => {
    if (!question) return;
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

    setGrading(true);
    try {
      const userAnswer =
        question.answerKind === "multi" ? JSON.stringify(multiAnswers) : answer;
      const res = await fetch("/api/course/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: question.templateId,
          params: question.params,
          userAnswer,
        }),
      });
      const data: GradeResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "error");
      setGrade(data);
    } catch (e) {
      console.error(e);
      setToast("採点に失敗しました");
    } finally {
      setGrading(false);
    }
  };

  if (!question) {
    return (
      <div className="space-y-2">
        {error ? (
          <div className="rounded-[16px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
            <div className="flex items-center gap-2">
              <span>{error}</span>
              <button
                type="button"
                onClick={loadQuestion}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
              >
                再試行
              </button>
            </div>
          </div>
        ) : null}
        <p className="text-[10px] sm:text-sm text-gray-600">{loading ? "読み込み中..." : "問題がありません"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {toast ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-[10px] sm:text-sm text-rose-700 shadow-sm">
          {toast}
        </div>
      ) : null}
      <div className="text-[10px] sm:text-sm text-gray-600">1問だけ解いて理解度を確認できます。</div>
      <div className="border rounded-2xl p-4 sm:p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70">
        <MathMarkdown content={question.statement} className="prose max-w-none text-[10px] sm:text-base" />

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
          <div className="mt-2 space-y-2">
            {(() => {
              if (question.answerKind !== "multi" || !grade.partResults) {
                return (
                  <div
                    className={`${grade.isCorrect ? "text-green-600" : "text-red-600"} font-semibold text-[10px] sm:text-sm`}
                  >
                    {grade.isCorrect ? "正解です！" : "不正解です。"}
                  </div>
                );
              }
              const parts = question.subQuestions ?? [];
              const total = parts.length;
              const correct = parts.filter((part) => grade.partResults?.[part.id]?.isCorrect).length;
              if (correct === total && total > 0) {
                return <div className="text-[10px] sm:text-sm font-semibold text-emerald-700">全問正解！</div>;
              }
              if (correct > 0) {
                return (
                  <div className="text-[10px] sm:text-sm font-semibold text-amber-700">
                    一部正解（{correct}/{total}）
                  </div>
                );
              }
              return <div className="text-[10px] sm:text-sm font-semibold text-rose-700">不正解です。</div>;
            })()}
            {question.answerKind === "multi" && grade.partResults ? (
              <div className="border rounded-xl p-3 bg-gray-50 space-y-2">
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
              <div className="text-[10px] sm:text-sm text-gray-800">
                <span className="font-semibold">正しい答え：</span>{" "}
                {(() => {
                  const display = getAnswerDisplay(grade.correctAnswer);
                  return display.kind === "tex" ? (
                    <KaTeXBlock tex={display.value} inline />
                  ) : (
                    display.value
                  );
                })()}
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={grading}
            className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] sm:text-sm hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner"
          >
            {grading ? "採点中..." : "採点する"}
          </button>
          <button
            type="button"
            onClick={loadQuestion}
            disabled={loading}
            className="px-4 py-2.5 rounded-full border text-[11px] sm:text-sm hover:bg-gray-50 disabled:opacity-50 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner"
          >
            別の問題にする
          </button>
        </div>
      </div>
    </div>
  );
}
