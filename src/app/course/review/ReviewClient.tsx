"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTopicById } from "@/lib/course/topics";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Item = {
  topic_id: string;
  due_at: string;
  interval_days: number;
  reps: number;
  lapses: number;
  last_quality: number | null;
};

export default function ReviewClient() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"due" | "interval" | "lapses" | "priority">("due");
  const [error, setError] = useState<string | null>(null);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [legendDismissed, setLegendDismissed] = useState(false);
  const [showInfoInline, setShowInfoInline] = useState(false);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("course_review_sort");
    if (saved === "due" || saved === "interval" || saved === "lapses" || saved === "priority") {
      setSortBy(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      setShowInfoInline(window.innerWidth < 640);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "course_review_legend_last";
    const saved = window.localStorage.getItem(key);
    if (saved) {
      const last = new Date(saved).getTime();
      if (Number.isFinite(last)) {
        const diffDays = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) {
          setLegendDismissed(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!showLegend) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("course_review_legend_last", new Date().toISOString());
    }
  }, [showLegend]);

  useEffect(() => {
    if (!showLegend) return;
    const timer = window.setTimeout(() => {
      setShowLegend(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [showLegend]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("course_review_sort", sortBy);
  }, [sortBy]);

  const load = async () => {
    const now = Date.now();
    if (loadingRef.current && now - lastLoadRef.current < 1500) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    setLoading(true);
    setError(null);
    try {
      const data = await cachedFetchJson(
        "course_review_list",
        15_000,
        async () => {
          const res = await fetch("/api/course/review", { cache: "no-store" });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.error ?? "error");
          return json;
        },
        { cooldownMs: 8000 }
      );
      setItems((prev) => {
        const next = data.items ?? [];
        return prev.length === next.length ? prev : next;
      });
      setLastUpdated(Date.now());
    } catch (e) {
      console.error(e);
      if (!(e instanceof Error && e.message === "request cooldown")) {
        setError("復習一覧の取得に失敗しました（ログイン状態を確認してください）");
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <p>読み込み中...</p>;

  if (error && !items.length) {
    return (
      <div className="rounded-[28px] border bg-white/95 p-4 sm:p-5 shadow-sm ring-1 ring-slate-200/70 space-y-3">
        <div className="rounded-[20px] border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-[11px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[10px] sm:text-xs text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
          {lastUpdated ? (
            <div className="mt-1 text-[10px] sm:text-xs text-amber-700/80">
              最終更新: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] border bg-white/95 p-4 sm:p-5 shadow-sm ring-1 ring-slate-200/70 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 text-[11px] sm:text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            RV
          </span>
          今日の復習はありません。
        </div>
        <p className="text-[11px] sm:text-xs text-gray-500">
          ログインしていない場合は復習履歴が取得できません。
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href="/course/topics"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 p-2.5 sm:p-3 text-[10px] sm:text-sm text-sky-800 hover:bg-sky-100 text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-sky-200 bg-white text-[9px] tracking-wider text-sky-700">
              TP
            </span>
            トピック一覧へ
          </Link>
          <Link
            href="/course"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 p-2.5 sm:p-3 text-[10px] sm:text-sm text-indigo-800 hover:bg-indigo-100 text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-indigo-200 bg-white text-[9px] tracking-wider text-indigo-700">
              HM
            </span>
            おすすめを確認
          </Link>
          <Link
            href="/course/onboarding/diagnostic"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 p-2.5 sm:p-3 text-[10px] sm:text-sm text-amber-800 hover:bg-amber-100 text-center sm:col-span-2 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-amber-200 bg-white text-[9px] tracking-wider text-amber-700">
              DX
            </span>
            診断で最適化する
          </Link>
        </div>
      </div>
    );
  }

  const priorityScore = (it: Item) => {
    const dueAt = new Date(it.due_at).getTime();
    const diffDays = Math.ceil((dueAt - Date.now()) / (1000 * 60 * 60 * 24));
    const dueScore =
      diffDays <= 0 ? 70 + Math.min(20, Math.abs(diffDays) * 4) : Math.max(0, 50 - diffDays * 6);
    const lapseScore = Math.min(30, it.lapses * 8);
    return dueScore + lapseScore;
  };

  const sorted = [...items].sort((a, b) => {
    if (sortBy === "interval") return a.interval_days - b.interval_days;
    if (sortBy === "lapses") return b.lapses - a.lapses;
    if (sortBy === "priority") return priorityScore(b) - priorityScore(a);
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });
  const nextItem = sorted[0];
  const now = Date.now();
  const overdueCount = items.filter((it) => new Date(it.due_at).getTime() < now).length;
  const priorityCount = items.filter((it) => {
    const dueAt = new Date(it.due_at).getTime();
    return dueAt - now <= 1000 * 60 * 60 * 24 * 2 || it.lapses >= 2;
  }).length;
  const sortLabel = {
    due: "期限",
    interval: "間隔",
    lapses: "つまずき",
    priority: "優先度",
  }[sortBy];
  const flowItems = sorted.slice(0, 3);

  const handleStartReview = (topicId: string) => {
    router.push(`/course/practice/session?topic=${topicId}&mode=review`);
  };

  return (
    <div className="space-y-4 sm:space-y-4">
      {error ? (
        <div className="rounded-[20px] border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-[11px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[10px] sm:text-xs text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
          {lastUpdated ? (
            <div className="mt-1 text-[10px] sm:text-xs text-amber-700/80">
              最終更新: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[10px] text-slate-500">復習対象をまとめてチェック</div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] sm:text-xs hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
          >
            再読み込み
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
          <Link
            href="/course/topics"
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 hover:bg-gray-50 transition"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
              TP
            </span>
            トピック一覧
          </Link>
          <Link
            href="/course/settings"
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 hover:bg-gray-50 transition"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
              ST
            </span>
            設定
          </Link>
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      {nextItem ? (
        <div
          role="link"
          tabIndex={0}
          onClick={() => handleStartReview(nextItem.topic_id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStartReview(nextItem.topic_id);
            }
          }}
          className="cursor-pointer rounded-[28px] border bg-white/95 p-3 sm:p-5 shadow-sm ring-1 ring-blue-200/80 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="text-[11px] sm:text-sm text-gray-700">
            次にやる: <span className="font-semibold">{getTopicById(nextItem.topic_id)?.title ?? nextItem.topic_id}</span>
          </div>
          <Link
            href={`/course/practice/session?topic=${nextItem.topic_id}&mode=review`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white text-[10px] sm:text-sm hover:bg-blue-700 text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full sm:w-auto"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
              GO
            </span>
            今すぐ開始
          </Link>
        </div>
      ) : null}
      {flowItems.length ? (
        <div className="rounded-[20px] border border-slate-200/70 bg-white/90 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)]">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Review Flow</div>
          <div className="mt-2 relative space-y-2 pl-6 text-[11px] text-slate-600">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-rose-200 via-amber-200 to-emerald-200/70" />
            {flowItems.map((it, idx) => {
              const topic = getTopicById(it.topic_id);
              return (
                <div key={it.topic_id} className="relative flex items-center gap-2">
                  <span
                    className={`absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                      idx === 0 ? "bg-rose-400 shadow-[0_0_0_6px_rgba(244,63,94,0.2)]" : "bg-slate-300"
                    }`}
                  />
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
                    {idx + 1}
                  </span>
                  <span className="truncate">{topic?.title ?? it.topic_id}</span>
                  {idx < flowItems.length - 1 ? <span className="text-slate-300">→</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="rounded-[20px] border border-slate-200/70 bg-white/90 p-3 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.2)]">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>並び替え</span>
          <span className="rounded-full border bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
            現在: {sortLabel}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSortBy("due")}
            className={`shrink-0 px-3 py-2 border rounded-full text-[11px] sm:text-xs ${sortBy === "due" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
          >
            期限
          </button>
          <button
            type="button"
            onClick={() => setSortBy("interval")}
            className={`shrink-0 px-3 py-2 border rounded-full text-[11px] sm:text-xs ${sortBy === "interval" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
          >
            間隔
          </button>
          <button
            type="button"
            onClick={() => setSortBy("lapses")}
            className={`shrink-0 px-3 py-2 border rounded-full text-[11px] sm:text-xs ${sortBy === "lapses" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
          >
            つまずき
          </button>
          <button
            type="button"
            onClick={() => setSortBy("priority")}
            className={`shrink-0 px-3 py-2 border rounded-full text-[11px] sm:text-xs ${sortBy === "priority" ? "bg-slate-900 text-white border-slate-900" : "bg-white"}`}
          >
            優先度
          </button>
          <button
            type="button"
            onClick={load}
            className="shrink-0 px-3 py-2 border rounded-full text-[11px] sm:text-xs bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner"
          >
            更新
          </button>
          {lastUpdated ? (
            <span className="shrink-0 rounded-full border bg-white px-3 py-2 text-[10px] sm:text-xs text-slate-500">
              更新: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-[10px] text-slate-400 sm:hidden">横にスクロールできます</div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-xs text-gray-500">
        <span className="sm:whitespace-nowrap">※「期限」と「つまずき」で並び替え</span>
        <button
          type="button"
          onClick={() => {
            if (legendDismissed) return;
            setShowLegend(true);
            setOpenInfoId(null);
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] transition ${
            legendDismissed ? "bg-rose-50 text-rose-400 cursor-default border-rose-200" : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
          }`}
          disabled={legendDismissed}
          title={legendDismissed ? "今日は表示済みです" : "説明を表示"}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] border-rose-200">
            i
          </span>
          最優先の説明
        </button>
      </div>
      {showLegend ? (
        <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs text-rose-800 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2">
          <span>最優先 = 期限が近い or つまずきが多い</span>
          <button
            type="button"
            onClick={() => {
              setShowLegend(false);
              setLegendDismissed(true);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("course_review_legend_last", new Date().toISOString());
              }
            }}
            className="text-rose-600 hover:text-rose-800"
            aria-label="説明を閉じる"
          >
            ×
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500">
        <span className="text-[10px] text-slate-400">サマリー</span>
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5">
            全 {items.length} 件
          </span>
          <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-red-700">
            期限超過 {overdueCount} 件
          </span>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-rose-700">
            最優先 {priorityCount} 件
          </span>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {sorted.map((it) => {
        const topic = getTopicById(it.topic_id);
        const dueAt = new Date(it.due_at).getTime();
        const isUrgent = dueAt - Date.now() <= 1000 * 60 * 60 * 24 * 2;
        const isOverdue = dueAt - Date.now() < 0;
        const isPriority = isUrgent || it.lapses >= 2;
        const priorityTone = isOverdue
          ? "border-red-200 bg-red-50 text-red-700"
          : isPriority
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : it.lapses > 0
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-500";
        const priorityLabel = isOverdue ? "期限超過" : isPriority ? "最優先" : it.lapses > 0 ? "注意" : "通常";
        const isInfoOpen = openInfoId === it.topic_id;
        return (
          <div
            key={it.topic_id}
            role="link"
            tabIndex={0}
            onClick={() => handleStartReview(it.topic_id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleStartReview(it.topic_id);
              }
            }}
            className={`cursor-pointer border rounded-[28px] p-3 sm:p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
              it.topic_id === nextItem?.topic_id ? "ring-2 ring-blue-200/80" : ""
            } ${isOverdue ? "bg-red-50/40 border-red-200/70" : isPriority ? "bg-rose-50/40 border-rose-200/70" : ""}`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-sm sm:text-base leading-snug line-clamp-2">
                  {topic ? topic.title : it.topic_id}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 sm:hidden">タップで復習開始</div>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-gray-600">
                  {isOverdue ? (
                    <span
                      className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-[10px] text-red-800"
                      aria-label="期限超過"
                    >
                      <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                      期限超過
                    </span>
                  ) : null}
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${priorityTone}`}>
                    {priorityLabel}
                  </span>
                  {isPriority ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenInfoId(isInfoOpen ? null : it.topic_id);
                        setShowLegend(false);
                      }}
                      onMouseEnter={() => {
                        if (!showInfoInline) setOpenInfoId(it.topic_id);
                      }}
                      onMouseLeave={() => {
                        if (!showInfoInline) setOpenInfoId(null);
                      }}
                      className="hidden sm:inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-100 transition"
                      title="説明を表示"
                      aria-label="最優先の説明を表示"
                    >
                      <span className="mr-1 inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                      最優先
                    </button>
                  ) : null}
                </div>
                {isPriority && (isInfoOpen || showInfoInline) ? (
                  <div className="mt-1 text-[10px] sm:text-[11px] text-rose-700">
                    期限が近い、またはつまずき回数が多い項目です
                  </div>
                ) : null}
                <div className="text-[11px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1">
                  {(() => {
                    const diff = Math.ceil((new Date(it.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const lateDays = Math.abs(diff) || 1;
                    const label = diff <= 0 ? `期限超過 ${lateDays}日` : `あと ${diff}日`;
                    const short =
                      diff <= 0
                        ? "今日"
                        : diff === 1
                          ? "明日"
                          : diff === 2
                            ? "明後日"
                            : null;
                    const shortTone = diff <= 0 ? "text-rose-700" : "text-amber-700";
                    const date = new Date(it.due_at).toLocaleDateString();
                    return (
                      <span>
                        <span className="hidden sm:inline">{date}</span>
                        {short ? (
                          <span className={`ml-1 font-semibold ${shortTone}`}>（{short}）</span>
                        ) : (
                          <span className="ml-1 text-gray-500">（{label}）</span>
                        )}
                      </span>
                    );
                  })()}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-600">
                  <span className="rounded-full border px-2 py-0.5">つまずき {it.lapses}</span>
                  <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">正解 {it.reps}</span>
                  <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">間隔 {it.interval_days}日</span>
                  {it.last_quality != null ? (
                    <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">前回Q {it.last_quality}</span>
                  ) : null}
                </div>
              </div>
              <Link
                href={`/course/practice/session?topic=${it.topic_id}&mode=review`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] sm:text-sm hover:bg-blue-700 text-center sm:w-auto w-full transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                  GO
                </span>
                復習開始
              </Link>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
