// src/app/course/writeup/list/writeupListClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/course/topics";
import { WRITEUP_PROBLEMS } from "@/lib/course/writeupProblems";

type LevelFilter = 0 | 1 | 2 | 3;

const LEVEL_LABEL: Record<LevelFilter, string> = {
  0: "全て",
  1: "基礎",
  2: "標準",
  3: "発展",
};

const TAG_OPTIONS = ["説明", "手順", "意味", "証明"] as const;
type TagOption = (typeof TAG_OPTIONS)[number];

function deriveTags(problem: { title: string; statement: string }) {
  const tags: TagOption[] = [];
  const text = `${problem.title} ${problem.statement}`;
  if (text.includes("証明")) tags.push("証明");
  if (text.includes("手順") || text.includes("求め方") || text.includes("解く"))
    tags.push("手順");
  if (text.includes("意味")) tags.push("意味");
  if (text.includes("説明")) tags.push("説明");
  if (tags.length === 0) tags.push("説明");
  return Array.from(new Set(tags));
}

const SORT_OPTIONS = ["recommended", "level", "title"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const SORT_LABELS: Record<SortOption, string> = {
  recommended: "おすすめ順",
  level: "難易度順",
  title: "タイトル順",
};

type WriteupEntry = {
  id: string;
  problemId?: string;
  topicId?: string;
  createdAt: string;
};

const STORAGE_KEY = "course_writeup_entries_v1";

export default function WriteupListClient() {
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(0);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<TagOption[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [entries, setEntries] = useState<WriteupEntry[]>([]);
  const [answerFilter, setAnswerFilter] = useState<"all" | "answered" | "unanswered">("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setEntries(parsed as WriteupEntry[]);
    } catch {
      setEntries([]);
    }
  }, []);

  const topicOptions = useMemo(() => {
    return [
      { id: "all", title: "全ての単元" },
      ...TOPICS.map((topic) => ({ id: topic.id, title: topic.title })),
    ];
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const entryStats = useMemo(() => {
    const byProblem = new Map<string, { count: number; lastAt: string }>();
    const byTopic = new Map<string, { count: number; lastAt: string }>();
    for (const entry of entries) {
      if (entry.problemId) {
        const prev = byProblem.get(entry.problemId);
        if (!prev || entry.createdAt > prev.lastAt) {
          byProblem.set(entry.problemId, {
            count: (prev?.count ?? 0) + 1,
            lastAt: entry.createdAt,
          });
        } else {
          byProblem.set(entry.problemId, { ...prev, count: prev.count + 1 });
        }
      }
      if (entry.topicId) {
        const prev = byTopic.get(entry.topicId);
        if (!prev || entry.createdAt > prev.lastAt) {
          byTopic.set(entry.topicId, {
            count: (prev?.count ?? 0) + 1,
            lastAt: entry.createdAt,
          });
        } else {
          byTopic.set(entry.topicId, { ...prev, count: prev.count + 1 });
        }
      }
    }
    return { byProblem, byTopic };
  }, [entries]);

  const filtered = useMemo(() => {
    const base = WRITEUP_PROBLEMS.filter((problem) => {
      if (topicFilter !== "all" && problem.topicId !== topicFilter) return false;
      if (levelFilter !== 0 && (problem.level ?? 1) !== levelFilter) return false;
      if (tagFilter.length > 0) {
        const tags = deriveTags(problem);
        if (!tagFilter.every((tag) => tags.includes(tag))) return false;
      }
      if (answerFilter === "answered" && !entryStats.byProblem.has(problem.id)) return false;
      if (answerFilter === "unanswered" && entryStats.byProblem.has(problem.id)) return false;
      if (!normalizedQuery) return true;
      const text = `${problem.title} ${problem.statement}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
    const sorted = [...base];
    if (sortOption === "level") {
      sorted.sort((a, b) => (a.level ?? 1) - (b.level ?? 1));
    } else if (sortOption === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    } else {
      sorted.sort((a, b) => {
        const la = a.level ?? 1;
        const lb = b.level ?? 1;
        if (la !== lb) return la - lb;
        return a.title.localeCompare(b.title, "ja");
      });
    }
    return sorted;
  }, [topicFilter, levelFilter, normalizedQuery, tagFilter, sortOption, answerFilter, entryStats.byProblem]);

  const recentEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted.slice(0, 3);
  }, [entries]);

  const formatDate = (value?: string) => {
    if (!value) return "記録なし";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "記録なし";
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Writeup Catalog</div>
          <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">記述問題の一覧</div>
          <div className="mt-2 text-sm text-slate-600">
            検索・単元・難易度で素早く探せます。
          </div>
        </div>
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500">
          {filtered.length} 問 / {WRITEUP_PROBLEMS.length} 問
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">検索</div>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="キーワードで検索（例: 判別式、面積、内積）"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">単元フィルタ</div>
          <select
            value={topicFilter}
            onChange={(event) => setTopicFilter(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <div className="text-xs font-semibold text-slate-500">難易度フィルタ</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          {(Object.keys(LEVEL_LABEL) as unknown as LevelFilter[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setLevelFilter(level)}
                className={`rounded-full border px-3 py-1 transition ${
                  levelFilter === level
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {LEVEL_LABEL[level]}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">並び順</div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSortOption(option)}
                className={`rounded-full border px-3 py-1 transition ${
                  sortOption === option
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {SORT_LABELS[option]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <div className="text-xs font-semibold text-slate-500">回答状況</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          {[
            { value: "all", label: "全て" },
            { value: "answered", label: "解答済み" },
            { value: "unanswered", label: "未回答" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAnswerFilter(item.value as "all" | "answered" | "unanswered")}
              className={`rounded-full border px-3 py-1 transition ${
                answerFilter === item.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {recentEntries.length ? (
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">最近の記述フロー</div>
          <div className="mt-3 relative space-y-2 pl-6 text-[11px] text-slate-600">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-sky-200 to-emerald-200/70" />
            {recentEntries.map((entry, idx) => {
              const label = entry.problemId
                ? WRITEUP_PROBLEMS.find((p) => p.id === entry.problemId)?.title ?? "記述問題"
                : "記述問題";
              const topicTitle =
                entry.topicId ? TOPICS.find((t) => t.id === entry.topicId)?.title : undefined;
              return (
                <div key={entry.id} className="relative flex items-center gap-2">
                  <span
                    className={`absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                      idx === 0 ? "bg-blue-500 shadow-[0_0_0_6px_rgba(59,130,246,0.2)]" : "bg-slate-300"
                    }`}
                  />
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    {idx + 1}
                  </span>
                  <span className="truncate">
                    {label}
                    {topicTitle ? ` / ${topicTitle}` : ""}
                  </span>
                  {idx < recentEntries.length - 1 ? <span className="text-slate-300">→</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm">
        <div className="text-xs font-semibold text-slate-500">タグ</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          {TAG_OPTIONS.map((tag) => {
            const active = tagFilter.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setTagFilter((prev) =>
                    prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                  );
                }}
                className={`rounded-full border px-3 py-1 transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {tagFilter.length > 0 ? (
            <button
              type="button"
              onClick={() => setTagFilter([])}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-500 transition hover:bg-slate-50"
            >
              クリア
            </button>
          ) : null}
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          タグは問題文のキーワードから自動で付与しています。
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-sm text-slate-500">
            条件に一致する問題がありません。検索やフィルタを変更してください。
          </div>
        ) : (
          filtered.map((problem) => {
            const topic = TOPICS.find((item) => item.id === problem.topicId);
            const tags = deriveTags(problem);
            const problemStats = entryStats.byProblem.get(problem.id);
            const topicStats = problem.topicId ? entryStats.byTopic.get(problem.topicId) : undefined;
            return (
              <div
                key={problem.id}
                className="group flex h-full flex-col rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-500">
                    {topic?.title ?? "共通問題"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-500">
                    {LEVEL_LABEL[(problem.level ?? 1) as LevelFilter]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {tags.map((tag) => (
                    <span
                      key={`${problem.id}-${tag}`}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-800">{problem.title}</div>
                <div className="mt-2 text-sm text-slate-600 line-clamp-3">{problem.statement}</div>
                <div className="mt-auto space-y-2 pt-4 text-[11px] text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      解いた回数: {problemStats?.count ?? 0}回
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      最終: {formatDate(problemStats?.lastAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      単元合計: {topicStats?.count ?? 0}回
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      単元最終: {formatDate(topicStats?.lastAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>記述演習でこの単元を解く</span>
                    {problem.topicId ? (
                      <Link
                        href={`/course/topics/${problem.topicId}/writeup`}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition group-hover:border-slate-400 group-hover:text-slate-900"
                      >
                        開く
                      </Link>
                    ) : (
                      <Link
                        href="/course/writeup"
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition group-hover:border-slate-400 group-hover:text-slate-900"
                      >
                        開く
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
