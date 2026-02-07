"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Item = {
  problem_id: string;
  skill_id: string;
  kind?: string | null;
  body_md?: string | null;
  reason: "review" | "roadmap" | "fallback" | string;
  due_at?: string | null;
  score: number;
};

export default function TodayTray() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const js = await cachedFetchJson(
          "learn_today",
          30_000,
          async () => {
            const r = await fetch("/api/today", { cache: "no-store" });
            const json = await r.json();
            if (!r.ok || !json?.ok) throw new Error("today error");
            return json;
          }
        );
        if (js?.ok) setItems((prev) => (js.items?.length ? js.items : prev));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="mb-6 rounded-2xl border p-4 text-sm text-gray-500">今日やる3件を計算中...</div>;
  if (!items.length) return null;

  return (
    <div className="mb-6 rounded-2xl border p-4">
      <div className="font-medium mb-2">今日やる3件</div>
      <div className="flex flex-col gap-2">
        {items.map((p) => (
          <Link
            key={p.problem_id}
            href={`/learn/skill/${encodeURIComponent(p.skill_id)}`}
            className="hover:bg-gray-50 rounded-xl p-3 border flex items-start justify-between gap-3"
          >
            <div>
              <div className="text-xs text-gray-500">{p.kind || "exercise"}</div>
              <div className="text-base font-medium">{p.skill_id}</div>
              {p.body_md && (
                <div className="text-xs text-gray-500 line-clamp-1">
                  {p.body_md.replace(/\$\$[^$]*\$\$/g, "").replace(/\s+/g, " ").trim()}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs rounded-full px-2 py-0.5 border ${p.reason === "review" ? "bg-yellow-50" : "bg-blue-50"}`}>
                {p.reason === "review" ? "復習" : p.reason === "roadmap" ? "ロードマップ" : "おすすめ"}
              </span>
              {p.due_at && <span className="text-[11px] text-gray-500">期限: {fmtDate(p.due_at)}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}
