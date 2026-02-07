"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type SrsRow = {
  topic_id: string;
  due_at: string;
  interval_days: number;
  reps: number;
  lapses: number;
  ef: number;
  last_quality: number | null;
  updated_at: string;
};

type ProgressResponse = {
  ok: boolean;
  items: SrsRow[];
  error?: string;
};

function isDue(dueAtIso: string): boolean {
  return new Date(dueAtIso).getTime() <= Date.now();
}

export default function TopicProgressClient({ topicId }: { topicId: string }) {
  const [rows, setRows] = useState<SrsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  const load = useCallback(async () => {
    const now = Date.now();
    if (loadingRef.current && now - lastLoadRef.current < 1500) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    setLoading(true);
    setError(null);
    try {
      const data = await cachedFetchJson(
        "course_progress",
        10_000,
        async () => {
          const res = await fetch("/api/course/progress", { cache: "no-store" });
          const json: ProgressResponse = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.error ?? "progress error");
          return json;
        },
        { cooldownMs: 8000 }
      );
      setRows((prev) => {
        const next = data.items ?? [];
        return prev.length === next.length ? prev : next;
      });
    } catch (e) {
      console.error(e);
      if (!(e instanceof Error && e.message === "request cooldown")) {
        setError("進捗の取得に失敗しました");
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const row = useMemo(
    () => rows.find((r) => r.topic_id === topicId) ?? null,
    [rows, topicId]
  );

  const due = row ? isDue(row.due_at) : false;
  const status =
    !row ? "未着手" : due ? "復習期限" : row.reps <= 0 ? "弱" : "学習中";

  return (
    <div className="rounded-[28px] p-4 sm:p-6 bg-white/95 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-[15px] sm:text-base">学習ステータス</div>
        <span className="text-[11px] sm:text-xs px-3 py-1 rounded-full border bg-slate-50">
          {status}
        </span>
      </div>

      {loading ? (
        <p className="text-[10px] sm:text-sm text-gray-600">読み込み中...</p>
      ) : error ? (
        <div className="rounded-[18px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
        </div>
      ) : row ? (
        <div className="text-[10px] sm:text-sm text-gray-700 space-y-1">
          <div>次回復習: {new Date(row.due_at).toLocaleDateString()}</div>
          <div>間隔: {row.interval_days}日 / 正解: {row.reps} / つまずき: {row.lapses}</div>
          <div>EF: {Number(row.ef).toFixed(2)}</div>
        </div>
      ) : (
        <p className="text-[10px] sm:text-sm text-gray-600">まだ学習履歴がありません。</p>
      )}

      <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-2 pt-1">
        <Link
          href={`/course/practice/session?topic=${topicId}${due ? "&mode=review" : ""}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] sm:text-sm hover:bg-blue-700 text-center w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
            GO
          </span>
          {due ? "復習を始める" : "このトピックを練習する"}
        </Link>
        <Link
          href="/course/review"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border text-[11px] sm:text-sm hover:bg-gray-50 text-center w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            RV
          </span>
          復習一覧へ
        </Link>
      </div>
    </div>
  );
}
