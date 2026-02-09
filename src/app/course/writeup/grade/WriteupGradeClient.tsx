"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MathMarkdown from "@/components/MathMarkdown";
import { getDefaultRubric, WRITEUP_PROBLEMS } from "@/lib/course/writeupProblems";

type WriteupEntry = {
  id: string;
  problemId?: string;
  topicId?: string;
  topicTitle?: string;
  problemTitle?: string;
  mode: "summary" | "steps";
  summary: string;
  steps: { plan: string; work: string; conclusion: string };
  imageDataUrl?: string | null;
  createdAt: string;
};

const STORAGE_KEY = "course_writeup_entries_v1";

export default function WriteupGradeClient() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<WriteupEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setEntries(parsed as WriteupEntry[]);
    } catch {
      // ignore
    }
  }, []);

  const entryId =
    searchParams.get("entry") ??
    (typeof window !== "undefined"
      ? window.localStorage.getItem("course_writeup_last_submitted")
      : null);

  const entry = useMemo(
    () => entries.find((item) => item.id === entryId) ?? null,
    [entries, entryId]
  );

  const problem = useMemo(
    () => WRITEUP_PROBLEMS.find((item) => item.id === entry?.problemId),
    [entry?.problemId]
  );

  const rubric = problem?.rubric ?? getDefaultRubric();
  const rubricKeywords = problem?.rubricKeywords ?? [];
  const combinedAnswer = useMemo(() => {
    if (!entry) return "";
    if (entry.mode === "summary") return entry.summary;
    return [entry.steps.plan, entry.steps.work, entry.steps.conclusion].filter(Boolean).join("\n");
  }, [entry]);

  const rubricChecks = useMemo(() => {
    const normalizedAnswer = normalizeText(combinedAnswer);
    const solutionText = problem?.solution ?? "";
    return rubric.map((item, index) => {
      const overrideTokens = rubricKeywords[index] ?? [];
      const tokens = uniqueTokens([
        ...extractTokens(item),
        ...overrideTokens.map((token) => normalizeText(token)),
      ]);
      const mathTokens = uniqueTokens([
        ...extractMathTokens(item),
        ...extractMathTokens(overrideTokens.join(" ")),
        ...extractMathTokens(solutionText),
      ]);
      const hitByText = tokens.some((token) => normalizedAnswer.includes(token));
      const hitByMath = mathTokens.some((token) => normalizedAnswer.includes(token));
      return { item, hit: combinedAnswer.trim().length > 0 && (hitByText || hitByMath) };
    });
  }, [combinedAnswer, rubric, rubricKeywords, problem?.solution]);

  const rubricScore = useMemo(() => {
    if (!rubricChecks.length) return 0;
    const hits = rubricChecks.filter((check) => check.hit).length;
    return Math.round((hits / rubricChecks.length) * 100);
  }, [rubricChecks]);

  if (!entry) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-600">
        採点対象が見つかりません。保存履歴から選び直してください。
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/course/writeup"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            記述トップへ
          </Link>
          <Link
            href="/course/writeup/list"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            保存一覧へ
          </Link>
        </div>
      </div>
    );
  }

  const backHref = entry.topicId ? `/course/topics/${entry.topicId}/writeup` : "/course/writeup";

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6">
        <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Writeup Grade</div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">簡易採点結果</h2>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            達成率 {rubricScore}%
          </span>
          <span className="text-xs text-slate-400">
            {entry.problemTitle ?? "記述問題"} / {entry.topicTitle ?? "共通問題"}
          </span>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold text-slate-500">必要要素</div>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {rubricChecks.map((check) => (
            <li key={check.item} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${check.hit ? "bg-emerald-500" : "bg-slate-300"}`} />
              <MathMarkdown content={check.item} className="text-sm" />
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6">
        <div className="text-xs font-semibold text-slate-500">提出内容</div>
        {entry.mode === "summary" ? (
          <MathMarkdown content={entry.summary || "（未入力）"} className="mt-3 text-sm" />
        ) : (
          <div className="mt-3 space-y-4 text-sm text-slate-700">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">方針</div>
              <MathMarkdown content={entry.steps.plan || "（未入力）"} className="mt-1 text-sm" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">途中式</div>
              <MathMarkdown content={entry.steps.work || "（未入力）"} className="mt-1 text-sm" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">結論</div>
              <MathMarkdown content={entry.steps.conclusion || "（未入力）"} className="mt-1 text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={backHref}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs text-white hover:bg-black"
        >
          編集に戻る
        </Link>
        <Link
          href="/course/writeup/list"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
        >
          保存一覧へ
        </Link>
      </div>
    </div>
  );
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[、。,.!?]/g, "");
}

function extractTokens(value: string): string[] {
  const matches = value.match(/[一-龥ぁ-んァ-ンa-zA-Z0-9]+/g) ?? [];
  return matches
    .map((token) => normalizeText(token))
    .filter((token) => token.length >= 2)
    .filter((token) => !STOP_WORDS.has(token));
}

function extractMathTokens(value: string): string[] {
  const tokens: string[] = [];
  const patterns = [/\$([^$]+)\$/g, /\\\(([^)]+)\\\)/g, /\\\[([\s\S]+?)\\\]/g];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
      tokens.push(normalizeText(match[1]));
    }
  }
  return tokens;
}

function uniqueTokens(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

const STOP_WORDS = new Set([
  "それぞれ",
  "ただし",
  "次",
  "次の",
  "求め",
  "求めよ",
  "について",
  "より",
  "なら",
  "この",
  "その",
  "ある",
  "こと",
  "として",
  "条件",
  "場合",
  "計算",
  "答え",
  "導け",
  "示せ",
  "示し",
]);
