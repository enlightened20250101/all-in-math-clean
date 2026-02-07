"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/course/topics";

type LastTopic = {
  topicId: string;
  updatedAt: string;
};

export default function CourseRecentTopicLinkClient() {
  const [lastTopic, setLastTopic] = useState<LastTopic | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("course_last_topic");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastTopic;
      if (parsed?.topicId) setLastTopic(parsed);
    } catch {
      setLastTopic(null);
    }
  }, []);

  const topic = useMemo(() => {
    if (!lastTopic?.topicId) return null;
    return TOPICS.find((t) => t.id === lastTopic.topicId) ?? null;
  }, [lastTopic]);

  if (!topic) return null;
  const label = `最近: ${topic.title}`;
  const href = `/course/topics/${topic.id}?unit=${topic.unit}`;

  return (
    <div className="col-span-2 w-full">
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[11px] sm:text-sm text-emerald-800 hover:bg-emerald-100 transition active:scale-[0.98] active:shadow-inner w-full truncate"
        title={topic.title}
      >
        {label}
      </Link>
    </div>
  );
}
