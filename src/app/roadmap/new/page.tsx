// src/app/roadmap/new/page.tsx
"use client";
import { useState } from "react";

export default function RoadmapNewPage() {
  const [title, setTitle] = useState("高校 数II・微積の基礎固め");
  const [target, setTarget] = useState<string>("");
  const [hrs, setHrs] = useState<number>(7);
  const [log, setLog] = useState<string>("");
  const [goalText, setGoalText] = useState<string>("共通テスト 数学 80点 / 2ヶ月 / 因数分解と二次関数を重点");

  <label className="block space-y-1">
    <div className="text-sm text-gray-600">ゴール・制約の説明（任意）</div>
    <textarea value={goalText} onChange={e=>setGoalText(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 h-28" placeholder="例: 数Iの計算力を2ヶ月で底上げ。分数式と二次関数を重点に、既習単元は薄く。" />
  </label>

  async function submit() {
    setLog("");
    const r = await fetch("/api/roadmap/new", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, target_date: target || null, weekly_hours: hrs,
        goal_text: goalText, keep_existing: true
      }),
    });
    const txt = await r.text();
    let js: any = {};
    try { js = JSON.parse(txt); } catch {}
    if (js?.ok) {
      location.href = "/roadmap"; // 作成後は可視化へ
    } else {
      setLog("作成エラー: " + (js?.error || txt || r.status));
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">新しいゴールを設定</h1>
      <label className="block space-y-1">
        <div className="text-sm text-gray-600">ゴールの名前</div>
        <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <div className="text-sm text-gray-600">目標日（任意）</div>
        <input type="date" value={target} onChange={e=>setTarget(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
      </label>
      <label className="block space-y-1">
        <div className="text-sm text-gray-600">週あたり学習時間（h）</div>
        <input type="number" min={1} max={50} value={hrs} onChange={e=>setHrs(e.target.valueAsNumber||7)} className="w-full border rounded-lg px-3 py-2" />
      </label>
      <button onClick={submit} className="px-4 py-2 rounded-xl border bg-blue-600 text-white">
        作成
      </button>
      {log && <div className="text-sm text-red-600">{log}</div>}
    </div>
  );
}
