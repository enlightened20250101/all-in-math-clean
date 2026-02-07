// src/app/course/topics/[topicId]/TopicRelationStatusDot.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type SrsRow = {
  topic_id: string;
  due_at: string;
  reps: number;
};

type ProgressResponse = {
  ok: boolean;
  items: SrsRow[];
};

type Status = "due" | "weak" | "new" | "strong";

function isDue(dueAtIso: string): boolean {
  return new Date(dueAtIso).getTime() <= Date.now();
}

export default function TopicRelationStatusDot({ topicId }: { topicId: string }) {
  const [status, setStatus] = useState<Status>("new");
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      const now = Date.now();
      if (loadingRef.current && now - lastLoadRef.current < 1500) return;
      loadingRef.current = true;
      lastLoadRef.current = now;
      try {
        const data = await cachedFetchJson(
          "course_progress",
          10_000,
          async () => {
            const res = await fetch("/api/course/progress", { cache: "no-store" });
            const json: ProgressResponse = await res.json();
            if (!res.ok || !json.ok) throw new Error("progress error");
            return json;
          },
          { cooldownMs: 8000 }
        );
        const row = (data.items ?? []).find((r) => r.topic_id === topicId) ?? null;
        if (!row) {
          setStatus("new");
        } else if (isDue(row.due_at)) {
          setStatus("due");
        } else if (row.reps <= 0) {
          setStatus("weak");
        } else {
          setStatus("strong");
        }
      } catch {
        setStatus("new");
      } finally {
        loadingRef.current = false;
      }
    };
    load();
  }, [topicId]);

  const tone =
    status === "due"
      ? "bg-rose-500 shadow-[0_0_0_6px_rgba(244,63,94,0.2)]"
      : status === "weak"
      ? "bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.2)]"
      : status === "strong"
      ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.2)]"
      : "bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.2)]";

  return (
    <span
      aria-hidden
      className={`absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${tone}`}
    />
  );
}
