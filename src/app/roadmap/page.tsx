// src/app/roadmap/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Role = "goal" | "start" | "required" | "mastered";
type MapNode = {
  skill_id: string;
  title: string;
  role: Role;
  mastery: number;
  prereqs: string[];
  depth: number;        // スタートからの距離
};
type MapEdge = { from: string; to: string };
type MapData = { nodes: MapNode[]; edges: MapEdge[] };
type GoalPack = { goal_id: string; items: string[] };

const roleColor = (role: Role) =>
  role === "goal"     ? "#8b5cf6" :
  role === "start"    ? "#f59e0b" :
  role === "mastered" ? "#22c55e" :
                        "#3b82f6"; // required

export default function RoadmapPage() {
  const [goals, setGoals] = useState<GoalPack[]>([]);
  const [mapData, setMap] = useState<MapData>({ nodes: [], edges: [] });
  const [activeTab, setActiveTab] = useState<string>("__ALL__");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true); setError(null);
    try {
      const js = await cachedFetchJson(
        "roadmap_map",
        60_000,
        async () => {
          const r = await fetch("/api/roadmap/map", { cache: "no-store" });
          const txt = await r.text();
          if (!r.ok || !txt) throw new Error("ロードマップ取得に失敗しました");
          return JSON.parse(txt);
        }
      );
      if (js?.ok) {
        setGoals((js.goals || []) as GoalPack[]);
        setMap(js.map as MapData);
      } else {
        setError(js?.error || "ロードマップ取得に失敗しました");
      }
    } catch (e:any) {
      setError(String(e));
    } finally { setLoading(false); }
  })(); }, []);

  // タブ一覧
  const tabIds = useMemo(() => ["__ALL__", ...goals.map(g => g.goal_id)], [goals]);

  // ゴール所属マップ（skill_id -> そのスキルを含む goal_id[]）
  const membership = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const g of goals) {
      for (const sid of g.items) {
        const cur = m.get(sid) || [];
        if (!cur.includes(g.goal_id)) cur.push(g.goal_id);
        m.set(sid, cur);
      }
    }
    return m;
  }, [goals]);

  // 表示対象ノードの抽出（ALL or ゴール別）
  const viewNodes: (MapNode & { __goals?: string[] })[] = useMemo(() => {
    if (activeTab === "__ALL__") {
      // そのまま全部。所属ゴールチップ用に __goals を付与
      return mapData.nodes.map(n => ({
        ...n,
        __goals: membership.get(n.skill_id) || [],
      }));
    } else {
      // 指定ゴールに含まれるスキル + そこへ至る前提スキル（map.edges から逆引き）
      const targetSkills = new Set(goals.find(g => g.goal_id === activeTab)?.items || []);
      if (targetSkills.size === 0) return [];

      // 前提を再帰取得するため、逆辺（to -> froms）を構築
      const prereqMap = new Map<string, string[]>();
      for (const e of mapData.edges) {
        const arr = prereqMap.get(e.to) || [];
        arr.push(e.from);
        prereqMap.set(e.to, arr);
      }

      const need = new Set<string>(targetSkills);
      const stack = [...targetSkills];
      while (stack.length) {
        const cur = stack.pop()!;
        const ps = prereqMap.get(cur) || [];
        for (const p of ps) if (!need.has(p)) { need.add(p); stack.push(p); }
      }
      return mapData.nodes
        .filter(n => need.has(n.skill_id))
        .map(n => ({ ...n, __goals: [activeTab] }));
    }
  }, [activeTab, mapData, goals, membership]);

  // 表示対象のエッジ（view内のみ）
  const viewEdges = useMemo(() => {
    const ids = new Set(viewNodes.map(n => n.skill_id));
    return mapData.edges.filter(e => ids.has(e.from) && ids.has(e.to));
  }, [viewNodes, mapData.edges]);

  // 2D 配置：depth を縦、同レイヤは横並び
  const graph = useMemo(() => layout(viewNodes, viewEdges), [viewNodes, viewEdges]);

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">ロードマップ</h1>

      {/* タブ */}
      <div className="flex flex-wrap gap-2">
        {tabIds.map(id => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1 rounded-full border text-sm ${activeTab === id ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}
          >
            {id === "__ALL__" ? "すべて" : id}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-sm">読み込み中...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && !error && !viewNodes.length && (
        <p className="text-gray-500 text-sm">表示できる項目がありません。</p>
      )}

      {!!viewNodes.length && (
        <div className="w-full overflow-auto rounded-xl border">
          <SVGMap graph={graph} />
        </div>
      )}
    </div>
  );
}

/* ========== Layout / Renderer ========== */
type NodeDraw = MapNode & { x: number; y: number; w: number; h: number; __goals?: string[] };
type Graph = { nodes: NodeDraw[]; edges: MapEdge[]; bbox: { w: number; h: number } };

function layout(nodesIn: (MapNode & { __goals?: string[] })[], edges: MapEdge[]): Graph {
  const paddingX = 24, paddingY = 24;
  const cardW = 240, cardH = 88, hGap = 60, vGap = 40;

  // レイヤ（depth）→ 行
  const byDepth = new Map<number, (MapNode & { __goals?: string[] })[]>();
  for (const n of nodesIn) {
    const arr = byDepth.get(n.depth) || [];
    arr.push(n); byDepth.set(n.depth, arr);
  }
  const depths = Array.from(byDepth.keys()).sort((a,b)=> a - b);

  const nodes: NodeDraw[] = [];
  depths.forEach((d, li) => {
    const layer = byDepth.get(d)!;
    layer.forEach((n, idx) => {
      nodes.push({
        ...n,
        x: paddingX + idx * (cardW + hGap),
        y: paddingY + li * (cardH + vGap),
        w: cardW, h: cardH,
      });
    });
  });

  const maxX = Math.max(0, ...nodes.map(n => n.x + n.w)) + paddingX;
  const maxY = Math.max(0, ...nodes.map(n => n.y + n.h)) + paddingY;
  return { nodes, edges, bbox: { w: maxX, h: maxY } };
}

function SVGMap({ graph }: { graph: Graph }) {
  const { nodes, edges, bbox } = graph;

  return (
    <svg width={bbox.w} height={bbox.h}>
      {/* edges */}
      {edges.map((e, i) => {
        const from = nodes.find(n => n.skill_id === e.from);
        const to   = nodes.find(n => n.skill_id === e.to);
        if (!from || !to) return null;
        const x1 = from.x + from.w, y1 = from.y + from.h/2;
        const x2 = to.x,           y2 = to.y + to.h/2;
        const mx = (x1 + x2) / 2;
        const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
        return <path key={i} d={path} stroke="#cbd5e1" strokeWidth={2} fill="none" markerEnd="url(#arrow)" />;
      })}
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#cbd5e1" />
        </marker>
      </defs>

      {/* nodes */}
      {nodes.map(n => (
        // SVG内は <Link> より onClick で遷移させる方が安定
        <g key={n.skill_id} transform={`translate(${n.x}, ${n.y})`} style={{ cursor: "pointer" }}
           onClick={() => { location.href = `/learn/skill/${encodeURIComponent(n.skill_id)}`; }}>
          <rect width={n.w} height={n.h} rx={12} ry={12} fill="#fff" stroke={roleColor(n.role)} strokeWidth={2}/>
          {/* 役割チップ */}
          <circle cx={12} cy={12} r={6} fill={roleColor(n.role)} />
          <text x={28} y={16} fontSize={12} fill="#334155">
            {labelRole(n.role)}{Number.isFinite(n.mastery) ? ` (M${n.mastery})` : ""}
          </text>
          {/* タイトル */}
          <text x={12} y={38} fontSize={13} fontWeight={600} fill="#0f172a">
            {n.title.length > 28 ? `${n.title.slice(0,28)}…` : n.title}
          </text>
          {/* 所属ゴール（ALL時に有効） */}
          {Array.isArray((n as any).__goals) && (n as any).__goals.length > 0 && (
            <text x={12} y={58} fontSize={11} fill="#64748b">
              {(n as any).__goals.slice(0,2).join(" / ")}{(n as any).__goals.length>2 ? " …" : ""}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

function labelRole(r: Role) {
  return r === "goal" ? "ゴール" : r === "start" ? "スタート" : r === "mastered" ? "習得済み" : "必須";
}
