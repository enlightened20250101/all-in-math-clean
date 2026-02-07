"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/course/topics";

type LastTopic = {
  topicId: string;
  updatedAt: string;
};

export default function CourseResumeCardClient() {
  const [lastTopic, setLastTopic] = useState<LastTopic | null>(null);
  const [hasStorage, setHasStorage] = useState(true);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("course_last_topic");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastTopic;
      if (parsed?.topicId) setLastTopic(parsed);
    } catch {
      setLastTopic(null);
      setHasStorage(false);
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const topic = useMemo(() => {
    if (!lastTopic?.topicId) return null;
    return TOPICS.find((t) => t.id === lastTopic.topicId) ?? null;
  }, [lastTopic]);

  const resumeLabel = useMemo(() => {
    if (!lastTopic?.updatedAt) return "";
    if (now == null) return "";
    const lastTime = new Date(lastTopic.updatedAt).getTime();
    if (!Number.isFinite(lastTime)) return "";
    const diffHours = Math.floor((now - lastTime) / (1000 * 60 * 60));
    return diffHours <= 24 ? "復習おすすめ" : "新規おすすめ";
  }, [lastTopic, now]);

  const lastLabel = useMemo(() => {
    if (!lastTopic?.updatedAt) return "";
    if (now == null) return "";
    const lastTime = new Date(lastTopic.updatedAt).getTime();
    if (!Number.isFinite(lastTime)) return "";
    const diffDays = Math.floor((now - lastTime) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "今日";
    if (diffDays === 1) return "昨日";
    if (diffDays < 7) return `${diffDays}日前`;
    return new Date(lastTime).toLocaleDateString();
  }, [lastTopic, now]);

  if (!topic) {
    if (!hasStorage) return null;
    return (
      <div className="border rounded-[28px] p-4 sm:p-6 bg-white/95 shadow-sm ring-1 ring-slate-200/70 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-[15px] sm:text-base">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            RS
          </span>
          前回の続き
        </div>
        <div className="text-[10px] sm:text-sm text-gray-600">
          まだ学習履歴がありません。トピック一覧から始めましょう。
        </div>
        <div className="grid gap-2 sm:flex sm:gap-2">
          <Link
            href="/course/topics"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] sm:text-sm hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner sm:w-auto"
          >
            トピック一覧へ
          </Link>
          <Link
            href="/course/settings"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] sm:text-sm hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner sm:w-auto"
          >
            コース設定へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-[28px] p-4 sm:p-6 bg-white/95 shadow-sm ring-1 ring-slate-200/70 space-y-3">
      <div className="flex items-center gap-2 font-semibold text-[15px] sm:text-base">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
          RS
        </span>
        前回の続き
      </div>
      <div className="text-[10px] sm:text-sm text-gray-800">
        <span className="font-semibold">{topic.title}</span> から再開できます
        {resumeLabel ? (
          <span className="ml-2 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700">
            {resumeLabel}
          </span>
        ) : null}
      </div>
      {lastLabel ? <div className="text-[10px] sm:text-xs text-gray-500">最終学習: {lastLabel}</div> : null}
      <div className="grid gap-2 sm:flex sm:gap-2">
        <Link
          href={`/course/topics/${topic.id}?unit=${topic.unit}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] sm:text-sm hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner sm:w-auto"
        >
          解説へ
        </Link>
        <Link
          href={`/course/topics?unit=${topic.unit}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] sm:text-sm hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner sm:w-auto"
        >
          一覧へ
        </Link>
        <Link
          href={`/course/practice/session?topic=${topic.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-[11px] sm:text-sm text-white hover:bg-blue-700 transition active:scale-[0.98] active:shadow-inner sm:w-auto"
        >
          演習へ
        </Link>
      </div>
    </div>
  );
}
