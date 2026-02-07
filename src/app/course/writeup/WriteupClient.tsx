// src/app/course/writeup/WriteupClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getDefaultRubric, getWriteupProblemsByTopic } from "@/lib/course/writeupProblems";
import type { TopicId } from "@/lib/course/topics";

type WriteupMode = "summary" | "steps";

type WriteupClientProps = {
  topicTitle?: string;
  topicId?: TopicId;
};

type WriteupEntry = {
  id: string;
  problemId?: string;
  topicId?: string;
  topicTitle?: string;
  problemTitle?: string;
  mode: WriteupMode;
  summary: string;
  steps: { plan: string; work: string; conclusion: string };
  imageDataUrl?: string | null;
  createdAt: string;
};

const STORAGE_KEY = "course_writeup_entries_v1";
const DRAFT_KEY_PREFIX = "course_writeup_draft_v1";
const FILTER_KEY_PREFIX = "course_writeup_filter_v1";

function loadEntries(): WriteupEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WriteupEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: WriteupEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 20)));
}

export default function WriteupClient({ topicTitle, topicId }: WriteupClientProps) {
  const [mode, setMode] = useState<WriteupMode>("summary");
  const problems = useMemo(() => getWriteupProblemsByTopic(topicId), [topicId]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [problemOrder, setProblemOrder] = useState<number[]>([]);
  const [levelFilter, setLevelFilter] = useState<0 | 1 | 2 | 3>(0);
  const visibleProblems = useMemo(() => {
    if (levelFilter === 0) return problems;
    return problems.filter((problem) => (problem.level ?? 1) === levelFilter);
  }, [problems, levelFilter]);
  const activeProblem = visibleProblems[problemOrder[problemIndex] ?? 0];
  const rubric = activeProblem?.rubric ?? getDefaultRubric();
  const solutionText = activeProblem?.solution ?? "模範解答は準備中です。";
  const rawSolution = activeProblem?.solution ?? "";
  const solutionSteps = useMemo(() => {
    if (!rawSolution) return [];
    return rawSolution
      .split("。")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `${part}。`);
  }, [rawSolution]);
  const [summary, setSummary] = useState("");
  const [plan, setPlan] = useState("");
  const [work, setWork] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [entries, setEntries] = useState<WriteupEntry[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "topic">("all");
  const [orderMode, setOrderMode] = useState<"recommended" | "shuffle">("recommended");
  const [solutionView, setSolutionView] = useState<"full" | "steps">("full");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`${FILTER_KEY_PREFIX}:${topicId ?? "common"}`);
    if (!raw) return;
    const parsed = Number(raw);
    if ([0, 1, 2, 3].includes(parsed)) {
      setLevelFilter(parsed as 0 | 1 | 2 | 3);
    }
  }, [topicId]);

  useEffect(() => {
    const order = visibleProblems
      .map((problem, index) => ({ index, level: problem.level ?? 1 }))
      .sort((a, b) => a.level - b.level)
      .map((item) => item.index);
    setProblemOrder(order);
    setProblemIndex(0);
    setOrderMode("recommended");
  }, [visibleProblems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`${FILTER_KEY_PREFIX}:${topicId ?? "common"}`, String(levelFilter));
  }, [levelFilter, topicId]);

  const problemText = activeProblem?.statement ?? "記述問題は準備中です。";
  const draftKey = `${DRAFT_KEY_PREFIX}:${topicId ?? "common"}:${activeProblem?.id ?? "default"}`;

  function handleSubmit() {
    const newEntry: WriteupEntry = {
      id: editingId ?? crypto.randomUUID(),
      problemId: activeProblem?.id,
      topicId,
      topicTitle,
      problemTitle: activeProblem?.title,
      mode,
      summary,
      steps: { plan, work, conclusion },
      imageDataUrl: imagePreview,
      createdAt: new Date().toISOString(),
    };
    const filtered = entries.filter((entry) => entry.id !== newEntry.id);
    const next = [newEntry, ...filtered];
    setEntries(next);
    saveEntries(next);
    setEditingId(null);
    setImagePreview(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(draftKey);
    }
  }

  function applyEntry(entry: WriteupEntry) {
    setMode(entry.mode);
    setSummary(entry.summary);
    setPlan(entry.steps.plan);
    setWork(entry.steps.work);
    setConclusion(entry.steps.conclusion);
    setImagePreview(entry.imageDataUrl ?? null);
    setEditingId(entry.id);
    if (entry.problemId) {
      const index = visibleProblems.findIndex((problem) => problem.id === entry.problemId);
      if (index >= 0) {
        const orderIndex = problemOrder.indexOf(index);
        setProblemIndex(orderIndex >= 0 ? orderIndex : 0);
      }
    }
  }

  function clearForm() {
    setSummary("");
    setPlan("");
    setWork("");
    setConclusion("");
    setEditingId(null);
    setLastSavedAt(null);
    setImagePreview(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(draftKey);
    }
  }

  function shuffleProblems() {
    const next = [...problemOrder];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setProblemOrder(next);
    setProblemIndex(0);
    setOrderMode("shuffle");
  }

  useEffect(() => {
    if (editingId) return;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) {
      setSummary("");
      setPlan("");
      setWork("");
      setConclusion("");
      setLastSavedAt(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        mode?: WriteupMode;
        summary?: string;
        plan?: string;
        work?: string;
        conclusion?: string;
        savedAt?: string;
      };
      if (parsed.mode) setMode(parsed.mode);
      setSummary(parsed.summary ?? "");
      setPlan(parsed.plan ?? "");
      setWork(parsed.work ?? "");
      setConclusion(parsed.conclusion ?? "");
      setLastSavedAt(parsed.savedAt ?? null);
    } catch {
      setLastSavedAt(null);
    }
  }, [draftKey, editingId]);

  useEffect(() => {
    if (editingId) return;
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      const payload = {
        mode,
        summary,
        plan,
        work,
        conclusion,
        savedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(draftKey, JSON.stringify(payload));
      setLastSavedAt(payload.savedAt);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [mode, summary, plan, work, conclusion, draftKey, editingId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Writeup Practice</div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">
            記述演習{topicTitle ? `：${topicTitle}` : ""}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            紙で解いてから、要点を清書する使い方を想定しています。
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
          <button
            type="button"
            onClick={() => setMode("summary")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === "summary" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            清書モード
          </button>
          <button
            type="button"
            onClick={() => setMode("steps")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === "steps" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            段階モード
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-4 sm:p-6 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">問題</div>
            <div className="mt-3 text-sm leading-relaxed">
              {activeProblem?.title ? <div className="text-sm font-semibold mb-1">{activeProblem.title}</div> : null}
              {problemText}
              <br />
              解答は方針・式の変形・結論を含めて簡潔にまとめよ。
            </div>
            {visibleProblems.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-[11px] text-slate-500">
                この難易度の問題はまだありません。フィルタを変更してください。
              </div>
            ) : null}
          {visibleProblems.length > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                問題 {problemIndex + 1} / {visibleProblems.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const order = visibleProblems
                      .map((problem, index) => ({ index, level: problem.level ?? 1 }))
                      .sort((a, b) => a.level - b.level)
                      .map((item) => item.index);
                    setProblemOrder(order);
                    setProblemIndex(0);
                    setOrderMode("recommended");
                  }}
                  className={`rounded-full border px-3 py-1 text-[11px] transition ${
                    orderMode === "recommended"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  おすすめ順
                </button>
                <button
                  type="button"
                  onClick={shuffleProblems}
                  className={`rounded-full border px-3 py-1 text-[11px] transition ${
                    orderMode === "shuffle"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  シャッフル
                </button>
                <button
                  type="button"
                  onClick={() => setProblemIndex(Math.max(0, problemIndex - 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                >
                  前へ
                </button>
                <button
                  type="button"
                  onClick={() => setProblemIndex(Math.min(visibleProblems.length - 1, problemIndex + 1))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                >
                  次へ
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {mode === "summary" ? (
              <div>
                <label className="text-xs font-semibold text-slate-600">清書（要点まとめ）</label>
                <textarea
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="紙で解いた内容を要点だけ整理して入力してください。"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600">方針</label>
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="何を使って解くか（平方完成・解の公式など）"
                    value={plan}
                    onChange={(event) => setPlan(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">途中式</label>
                  <textarea
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="重要な変形や立式だけを記述"
                    value={work}
                    onChange={(event) => setWork(event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">結論</label>
                  <textarea
                    rows={2}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="最終的な答えを簡潔に"
                    value={conclusion}
                    onChange={(event) => setConclusion(event.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600">解答用紙の写真（任意）</label>
              <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-xs text-slate-500">
                <input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : null;
                      setImagePreview(result);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="answer preview"
                    width={640}
                    height={360}
                    className="w-full max-h-48 rounded-xl border border-slate-200 object-contain bg-white"
                    unoptimized
                  />
                ) : (
                  <div>写真は提出前の確認用として表示します（採点連携は準備中）。</div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            >
              {editingId ? "編集内容を保存" : "提出して保存する"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              入力をクリア
            </button>
            <div className="text-[11px] text-slate-400">
              {lastSavedAt ? `下書きを自動保存: ${new Date(lastSavedAt).toLocaleTimeString()}` : "下書きは自動保存されます。"}
            </div>
            <div className="text-[11px] text-slate-500">
              採点は後で有効化できます。今は履歴として保存します。
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">難易度フィルタ</div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              {[
                { label: "全て", value: 0 },
                { label: "基礎", value: 1 },
                { label: "標準", value: 2 },
                { label: "発展", value: 3 },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLevelFilter(item.value as 0 | 1 | 2 | 3)}
                  className={`rounded-full border px-3 py-1 transition ${
                    levelFilter === item.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              おすすめ順は難易度の低い順に並びます。
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">必要要素（例）</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {rubric.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[11px] text-slate-500">
              採点ではこの要素の有無で部分点を付けます。
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-500">模範解答</div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSolutionView("full")}
                  className={`rounded-full border px-3 py-1 transition ${
                    solutionView === "full"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  全文
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionView("steps")}
                  className={`rounded-full border px-3 py-1 transition ${
                    solutionView === "steps"
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  ステップ
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              {solutionView === "steps" && solutionSteps.length > 0 ? (
                <ol className="space-y-2">
                  {solutionSteps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                solutionText
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">次におすすめ</div>
            <div className="mt-3 text-sm text-slate-600">
              同単元の基本問題へ戻る / 類題へ進む などの導線をここに表示します。
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">最近の清書</div>
            {entries.length === 0 ? (
              <div className="mt-3 text-sm text-slate-400">まだ保存された記述はありません。</div>
            ) : (
              <>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                  <button
                    type="button"
                    onClick={() => setHistoryFilter("all")}
                    className={`rounded-full border px-3 py-1 transition ${
                      historyFilter === "all"
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    全て
                  </button>
                  {topicId ? (
                    <button
                      type="button"
                      onClick={() => setHistoryFilter("topic")}
                      className={`rounded-full border px-3 py-1 transition ${
                        historyFilter === "topic"
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      このトピックのみ
                    </button>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {(historyFilter === "topic" && topicId
                    ? entries.filter((entry) => entry.topicId === topicId)
                    : entries
                  )
                    .slice(0, 6)
                    .map((entry) => (
                  <li key={entry.id} className="rounded-xl border border-slate-200/70 bg-white px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </div>
                        <div className="text-[12px] text-slate-700">
                          {entry.problemTitle ?? "記述問題"} / {entry.topicTitle ?? "共通問題"} /{" "}
                          {entry.mode === "summary" ? "清書" : "段階"}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                          {entry.mode === "summary"
                            ? entry.summary || "（未入力）"
                            : entry.steps.conclusion || entry.steps.work || entry.steps.plan || "（未入力）"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => applyEntry(entry)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-600 hover:bg-slate-50"
                        >
                          再編集
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = entries.filter((item) => item.id !== entry.id);
                            setEntries(next);
                            saveEntries(next);
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
