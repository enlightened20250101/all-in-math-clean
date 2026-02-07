"use client";

import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/course/topics";

type SrsRow = {
  topic_id: string;
  reps: number;
  lapses: number;
};

export default function MyLearningSummaryClient() {
  const [items, setItems] = useState<SrsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/course/progress", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error("progress error");
        if (!active) return;
        setItems(data.items ?? []);
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = TOPICS.length;
    let mastered = 0;
    let inProgress = 0;
    let needsReview = 0;
    const map = new Map(items.map((i) => [i.topic_id, i]));
    for (const topic of TOPICS) {
      const s = map.get(topic.id);
      if (!s) continue;
      if (s.lapses >= 3) {
        needsReview += 1;
        continue;
      }
      if (s.reps >= 2) {
        mastered += 1;
        continue;
      }
      if (s.reps > 0) inProgress += 1;
    }
    return { total, mastered, inProgress, needsReview };
  }, [items]);

  if (loading) {
    return (
      <div className="text-xs text-gray-500">学習状況を読み込み中…</div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4 text-center text-[11px] sm:text-sm">
      <Stat label="総トピック" value={summary.total} />
      <Stat label="定着" value={summary.mastered} tone="text-emerald-700" />
      <Stat label="進行中" value={summary.inProgress} tone="text-amber-700" />
      <Stat label="要復習" value={summary.needsReview} tone="text-rose-700" />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border bg-white px-3 py-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`text-lg font-semibold ${tone ?? "text-slate-800"}`}>{value}</div>
    </div>
  );
}
