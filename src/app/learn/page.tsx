// src/app/learn/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import TodayTray from "./components/TodayTray";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

export default function LearnHome() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { location.href = "/login?next=/learn"; return; }
      const { data } = await supabaseBrowser
        .from("learning_sessions")
        .select("id, topic_slug, mastery, status, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      setSessions(data ?? []);
    })();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">学習ハブ</h1>

      <Link href="/roadmap" className="inline-block px-3 py-1 border rounded">ロードマップを見る</Link>

      <TodayTray />

      <Link href="/roadmap/new" className="inline-block px-3 py-1 border rounded">新しいゴールを設定</Link>

      <div className="grid md:grid-cols-2 gap-3">
        {sessions.map((s) => (
          <Link key={s.id} href={`/learn/session/${s.id}`} className="border rounded p-3 hover:bg-gray-50">
            <div className="font-semibold">セッション #{s.id}</div>
            <div className="text-sm text-gray-600">
              topic: {s.topic_slug} / mastery: {Math.floor(((s.mastery ?? 0) * 100))}%
            </div>
          </Link>
        ))}
      </div>

      <WeaknessTray />
    </div>
  );
}

function WeaknessTray() {
  const [packs, setPacks] = useState<{ skill_id:string; problems:any[] }[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ (async ()=>{
    setError(null);
    try {
      const js = await cachedFetchJson(
        "learn_weakness",
        30_000,
        async () => {
          const r = await fetch("/api/weakness", { cache: "no-store" });
          const txt = await r.text();
          if (!r.ok || !txt) throw new Error("取得に失敗");
          return JSON.parse(txt);
        }
      );
      if (js?.ok) setPacks(js.items || []);
    } catch (e) { setError("取得に失敗"); }
  })(); },[]);

  if (error) return <div className="rounded-2xl border p-4 text-sm text-red-600">{error}</div>;
  if (!packs.length) return null;

  return (
    <div className="rounded-2xl border p-4">
      <div className="font-medium mb-3">弱点ドリル（各スキル 3 問）</div>
      <div className="space-y-4">
        {packs.map((pack) => (
          <div key={pack.skill_id} className="space-y-2">
            <div className="text-sm font-semibold">{pack.skill_id}</div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {pack.problems.map((p:any) => (
                <Link
                  key={p.id}
                  href={`/learn/skill/${encodeURIComponent(p.skill_id)}`}
                  className="min-w-[260px] border rounded-xl p-3 hover:bg-gray-50"
                >
                  <div className="text-xs text-gray-500">{p.kind || "exercise"}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {String(p.body_md || "").replace(/\$\$[^$]*\$\$/g,"").replace(/\s+/g," ").trim()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
