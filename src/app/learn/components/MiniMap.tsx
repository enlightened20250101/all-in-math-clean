"use client";
import { useEffect, useState } from "react";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Skill = { id:string; title:string; unit?:string; topic?:string; difficulty?:number; priority?:number };

export default function MiniMap({
  sessionId,
  viewCode,
  currentSkillId,
  onJumped,             // ← 既存
  onSelect,             // ← 呼び出し側がこちらで渡しても動くように許容
}: {
  sessionId: number;
  viewCode: string;
  currentSkillId?: string;
  onJumped?: (skillId: string) => void;
  onSelect?: (skillId: string) => void;
}) {
  const [nodes, setNodes] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let die = false;
    setLoading(true);
    cachedFetchJson(
      `roadmap_view:${viewCode}`,
      60_000,
      async () => {
        const r = await fetch(`/api/roadmap/${viewCode}`, { cache: "no-store" });
        const j = await r.json();
        if (!r.ok) throw new Error("roadmap view error");
        return j;
      }
    )
      .then((j) => {
        if (die) return;
        const skills = (j?.items ?? []).map((it:any) => it.skill ?? it).filter(Boolean);
        setNodes((prev) => (skills.length ? skills : prev));
      })
      .finally(() => !die && setLoading(false));
    return () => { die = true; };
  }, [viewCode]);

  async function jump(skillId: string) {
    await fetch("/api/learn/jump", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: "include",
      body: JSON.stringify({ session_id: sessionId, skill_id: skillId }),
    });
    // どちらかが渡っていれば呼ぶ
    if (onJumped) onJumped(skillId);
    if (onSelect) onSelect(skillId);
  }

  if (loading) return <div className="text-xs text-gray-500">ミニマップ読み込み中…</div>;

  return (
    <div className="grid grid-cols-1 gap-1">
      {nodes.map((s) => {
        const active = s.id === currentSkillId;
        return (
          <button
            key={s.id}
            onClick={() => jump(s.id)}
            className={`text-left px-2 py-1 rounded border ${active ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}
            title={`${s.title} / 難度${s.difficulty ?? '-'}・優先${s.priority ?? '-'}`}
          >
            <div className="text-xs truncate">{s.title}</div>
            <div className="text-[10px] text-gray-500 truncate">{s.topic ?? s.unit ?? ""}</div>
          </button>
        );
      })}
    </div>
  );
}
