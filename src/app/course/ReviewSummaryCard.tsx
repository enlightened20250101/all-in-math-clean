"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getTopicById } from "@/lib/course/topics";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Summary = {
  ok: boolean;
  count: number;
  nextTopicId: string | null;
  error?: string;
};

export default function ReviewSummaryCard() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const load = async () => {
    const now = Date.now();
    if (loadingRef.current && now - lastLoadRef.current < 1500) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    setLoading(true);
    try {
      const data = await cachedFetchJson(
        "course_review_summary",
        30_000,
        async () => {
          const res = await fetch("/api/course/review/summary", { cache: "no-store" });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.error ?? "error");
          return json;
        },
        { cooldownMs: 8000 }
      );
      setSummary((prev) => {
        if (!prev) return data;
        if (prev.count === data.count && prev.nextTopicId === data.nextTopicId && prev.ok === data.ok) {
          return prev;
        }
        return data;
      });
      setLastUpdated(Date.now());
    } catch (e) {
      console.error(e);
      setSummary({ ok: false, count: 0, nextTopicId: null, error: "取得に失敗しました" });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => { load(); }, []);

  const count = summary?.count ?? 0;
  const nextTopic = summary?.nextTopicId ? getTopicById(summary.nextTopicId) : null;

  return (
    <div className="border rounded-[28px] p-4 sm:p-6 bg-white/95 shadow-sm ring-1 ring-rose-200/80">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
              RV
            </span>
            今日の復習
          </div>
          <div className="text-[10px] sm:text-sm text-gray-700 mt-1">
            {loading ? (
              "読み込み中..."
            ) : summary?.ok === false ? (
              <span className="text-slate-500">復習情報を取得できませんでした</span>
            ) : count > 0 ? (
              <>
                <span className="font-semibold">{count}</span> 件の復習があります
                {nextTopic ? (
                  <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
                    まずは：{nextTopic.title}
                  </div>
                ) : null}
              </>
            ) : (
              "今日の復習はありません"
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/course/review"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-xs sm:text-sm text-white hover:bg-blue-700 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:w-auto"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
              RV
            </span>
            復習を見る
          </Link>

          {summary?.ok && summary.nextTopicId ? (
            <Link
              href={`/course/practice/session?topic=${summary.nextTopicId}&mode=review`}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:w-auto"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
                GO
              </span>
              今すぐ復習開始
            </Link>
          ) : null}
        </div>
      </div>

      {summary?.ok === false ? (
        <div className="mt-3 rounded-[18px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] sm:text-xs text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>復習情報の取得に失敗しました</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-2.5 py-1 text-[10px] text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
          {lastUpdated ? (
            <div className="mt-1 text-[10px] text-amber-700/80">
              最終更新: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] sm:text-xs text-gray-500">
        <button
          type="button"
          onClick={load}
          className="text-[10px] sm:text-xs text-gray-600 hover:underline"
        >
          更新
        </button>
        {lastUpdated ? (
          <span className="rounded-full border bg-white px-2 py-0.5">
            更新: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        ) : null}
        <span className="text-[10px] sm:text-xs text-gray-400">
          ※復習はSRS（間隔最適化）で自動調整されます
        </span>
      </div>
    </div>
  );
}
