"use client";

import { useEffect, useState } from "react";
import MathMarkdown from "@/components/MathMarkdown";
import { useRouter } from "next/navigation";
import AnswerInput from "@/components/course/AnswerInput";
import type { AnswerKind, SubQuestion } from "@/lib/course/types";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Question = {
  id: string;
  area: string;
  statement: string;
  answerKind: AnswerKind;
  choices: string[] | null;
  subQuestions?: SubQuestion[];
};

export default function DiagnosticClient() {
  const router = useRouter();
  const defaultCourseId = "hs_ia" as const;

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string | null>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, Record<string, string>>>({});
  const [multiErrors, setMultiErrors] = useState<Record<string, Record<string, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<
    "hs_ia" | "hs_iib" | "ct_iib" | "ct_iib_sequence" | "ct_iib_statistics" | "hs_iic" | "hs_iii"
  >(defaultCourseId);
  const courseLabels: Record<
    "hs_ia" | "hs_iib" | "ct_iib" | "ct_iib_sequence" | "ct_iib_statistics" | "hs_iic" | "hs_iii",
    string
  > = {
    hs_ia: "高校数学IA",
    hs_iib: "高校数学IIB",
    ct_iib: "共通テストII/B",
    ct_iib_sequence: "共通テストII/B（数列）",
    ct_iib_statistics: "共通テストII/B（統計）",
    hs_iic: "高校数学C",
    hs_iii: "高校数学III",
  };

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const load = async (targetCourseId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/course/diagnostic/questions?courseId=${encodeURIComponent(targetCourseId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "error");
      setQuestions(data.questions ?? []);
      setSessionId(data.sessionId ?? "");
    } catch (e) {
      console.error(e);
      setToast("診断問題の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadSettings = async () => {
      try {
        const data = await cachedFetchJson(
          "course_settings",
          30_000,
          async () => {
            const res = await fetch("/api/course/settings", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error ?? "settings error");
            return json;
          },
          { cooldownMs: 8000 }
        );
        if (data?.settings?.courseId && !ignore) {
          setCourseId(data.settings.courseId);
          load(data.settings.courseId);
          return;
        }
      } catch (e) {
        console.error(e);
      }
      if (!ignore) load(defaultCourseId);
    };
    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  const submit = async () => {
    const invalidMulti = questions.find((q) => {
      if (q.answerKind === "multi_numeric") {
        const err = answerErrors[q.id];
        return !!err || !answers[q.id];
      }
      if (q.answerKind !== "multi") return false;
      const parts = q.subQuestions ?? [];
      const bucket = multiAnswers[q.id] ?? {};
      const errs = multiErrors[q.id] ?? {};
      return parts.some((part) => {
        if (part.answerKind === "multi_numeric" && errs[part.id]) return true;
        return !bucket[part.id];
      });
    });
    if (invalidMulti) {
      if (invalidMulti.answerKind === "multi_numeric") {
        const err = answerErrors[invalidMulti.id];
        setToast(err ?? "解1と解2を入力するか、「実数解なし」を選択してください。");
        return;
      }
      setToast("未入力の小問があります。");
      return;
    }

    setSubmitting(true);
    try {
      const payloadAnswers: Record<string, string> = { ...answers };
      questions.forEach((q) => {
        if (q.answerKind !== "multi") return;
        payloadAnswers[q.id] = JSON.stringify(multiAnswers[q.id] ?? {});
      });
      const res = await fetch("/api/course/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          sessionId,
          answers: payloadAnswers,
        }),  
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "submit error");

      // 結果はURLパラメータで渡す（MVP）。後でDB保存してもOK
      const r = encodeURIComponent(JSON.stringify(data.result));
      router.push(`/course/onboarding/summary?r=${r}`);
    } catch (e) {
      console.error(e);
      setToast("診断の送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-[10px] sm:text-sm">読み込み中...</p>;
  if (!questions.length) return <p className="text-[10px] sm:text-sm">問題がありません</p>;

  const answeredCount = questions.filter((q) => {
    if (q.answerKind === "multi") {
      const parts = q.subQuestions ?? [];
      const bucket = multiAnswers[q.id] ?? {};
      return parts.length > 0 && parts.every((part) => !!bucket[part.id]);
    }
    return !!answers[q.id];
  }).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {toast ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-[10px] sm:text-sm text-rose-700 shadow-sm">
          {toast}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5">
          対象: {courseLabels[courseId] ?? courseId}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5">
          全 {questions.length} 問
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5">
          進捗 {answeredCount}/{questions.length}
        </span>
      </div>
      {questions.map((q, idx) => (
        <div key={q.id} className="border rounded-[24px] p-3 sm:p-5 bg-white/95 ring-1 ring-slate-200/70 shadow-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-sm text-gray-500">
            <span>
              Q{idx + 1} / area: {q.area}
            </span>
            <span className="rounded-full border px-2 py-0.5 text-[10px] sm:text-xs text-slate-500">
              {q.answerKind === "multi"
                ? (q.subQuestions ?? []).every((part) => !!(multiAnswers[q.id] ?? {})[part.id])
                  ? "回答済み"
                  : "未回答"
                : answers[q.id]
                ? "回答済み"
                : "未回答"}
            </span>
          </div>

          <MathMarkdown content={q.statement} className="prose max-w-none text-[11px] sm:text-base" />

          <div>
            <label className="text-[10px] sm:text-sm block mb-1">回答</label>
            {q.answerKind === "multi" ? (
              <div className="space-y-3">
                {(q.subQuestions ?? []).map((part) => (
                  <div key={part.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <div className="text-[10px] sm:text-xs text-slate-500 mb-1">{part.label}</div>
                    <AnswerInput
                      answerKind={part.answerKind}
                      value={(multiAnswers[q.id] ?? {})[part.id] ?? ""}
                      onChange={(value) =>
                        setMultiAnswers((prev) => ({
                          ...prev,
                          [q.id]: { ...(prev[q.id] ?? {}), [part.id]: value },
                        }))
                      }
                      onErrorChange={(error) =>
                        setMultiErrors((prev) => ({
                          ...prev,
                          [q.id]: { ...(prev[q.id] ?? {}), [part.id]: error },
                        }))
                      }
                      choices={part.choices ?? null}
                      placeholder={part.placeholder}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <AnswerInput
                answerKind={q.answerKind}
                value={answers[q.id] ?? ""}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                onErrorChange={(error) => setAnswerErrors((prev) => ({ ...prev, [q.id]: error }))}
                choices={q.choices}
              />
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400">
            {q.answerKind === "multi_numeric" ? "解1・解2の両方を入力してください" : "入力が終わったら次の問題へ"}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
          OK
        </span>
        {submitting ? "採点中..." : "診断結果を見る"}
      </button>
    </div>
  );
}
