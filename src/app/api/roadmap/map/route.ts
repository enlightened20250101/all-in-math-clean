// src/app/api/roadmap/map/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { loadCurriculumGraph, loadCurriculumViews, buildViewEdges } from "@/server/curriculum";

type RMNode = {
  skill_id: string;
  title?: string;
  due_at?: string | null;
  priority?: number | null;
  done?: boolean;
  prereqs?: string[];
};
type Edge = { from: string; to: string };

export async function GET() {
  try {
    const sb = await await supabaseServerReadOnly();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:"auth" }, { status:401 });

    // 1) active ロードマップ全部
    const { data: roads, error: rErr } = await sb
      .from("roadmaps")
      .select("id, goal_id, nodes_json, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (rErr) return NextResponse.json({ ok:false, error:rErr.message }, { status:500 });

    const roadmaps = (roads || []).map((r: any) => ({
      roadmap_id: r.id,
      goal_id: r.goal_id || "(no-title)",
      nodes: (Array.isArray(r.nodes_json) ? r.nodes_json : []) as RMNode[]
    }));

    // 2) カリキュラム（前提とタイトル）+ ビュー（view_code -> skills）を読み込む
    const curriculum = await loadCurriculumGraph();
    const views = await loadCurriculumViews();
    const prereqsMap = new Map<string, string[]>();
    for (const [k, v] of Object.entries(curriculum.prereqs)) {
      prereqsMap.set(k, Array.isArray(v) ? v : []);
    }
    // ロードマップ内のノードが持つ prereqs も加算（和集合）
    for (const rm of roadmaps) {
      for (const n of rm.nodes) {
        if (Array.isArray(n.prereqs) && n.prereqs.length) {
          const cur = prereqsMap.get(n.skill_id) || [];
          prereqsMap.set(n.skill_id, Array.from(new Set([...cur, ...n.prereqs])));
        }
      }
    }

    // 3) 目標（全ゴールの skill 集合）＋ view展開
    const usedViewCodes: string[] = [];
    const goalSet = new Set<string>();
    for (const rm of roadmaps) {
        for (const n of rm.nodes) {
            const viewCode = (n as any).view_code || null;
            if (viewCode && views[viewCode]) {
                usedViewCodes.push(viewCode);
                views[viewCode].items.forEach(it => goalSet.add(it.skill_id));
                continue;
            }
            goalSet.add(n.skill_id);
        }
    }

    // ★ viewの順序から擬似依存を注入（prev→curr）
    const implied = buildViewEdges(views, usedViewCodes, 1);
    for (const e of implied) {
        const arr = prereqsMap.get(e.to) || [];
        arr.push(e.from);
        prereqsMap.set(e.to, Array.from(new Set(arr)));
    }

    // 4) 必要スキル：goals から前提を再帰的に展開（中間ノードがここで出る）
    const requiredSet = new Set<string>();
    for (const g of goalSet) expandPrereqs(g, prereqsMap, requiredSet, new Set());

    // 5) スタート集合（requiredサブグラフ上の入次数0ノード）
    const indeg = new Map<string, number>();
    for (const s of requiredSet) indeg.set(s, 0);
    for (const to of requiredSet) {
      const ps = prereqsMap.get(to) || [];
      for (const p of ps) if (requiredSet.has(p)) {
        indeg.set(to, (indeg.get(to) || 0) + 1);
      }
    }
    const startSet = new Set([...requiredSet].filter(s => (indeg.get(s) ?? 0) === 0));

    // 6) 表示対象（required ∪ goals）
    const showSet = new Set<string>([...requiredSet, ...goalSet]);

    // 7) mastery を “中間ノードも含めた” skill 群でまとめて取得
    const showSkillIds = Array.from(showSet);
    const mastery = new Map<string, number>();
    if (showSkillIds.length) {
      const { data: masteryRows } = await sb
        .from("user_skill_mastery")
        .select("skill_id, mastery_level")
        .eq("user_id", user.id)
        .in("skill_id", showSkillIds);
      (masteryRows || []).forEach((m: any) => mastery.set(m.skill_id, m.mastery_level ?? 0));
    }

    // 8) depth（スタートからの距離）
    const depthMap = topoDepth(showSet, prereqsMap, startSet);

    // 9) ノード出力（役割付与 & タイトル反映）
    const nodesOut: Array<{
      skill_id: string;
      title: string;
      role: "goal" | "start" | "required" | "mastered";
      mastery: number;
      prereqs: string[];
      depth: number;
    }> = [];

    for (const s of showSet) {
      const m = mastery.get(s) ?? 0;
      const isGoal = goalSet.has(s);
      const isStart = startSet.has(s);
      const role: "goal"|"start"|"required"|"mastered" =
        m >= 4 ? "mastered" : (isGoal ? "goal" : (isStart ? "start" : "required"));

      nodesOut.push({
        skill_id: s,
        title: curriculum.titles[s] || s,          // ★ カリキュラムのタイトルを適用
        role,
        mastery: m,
        prereqs: (prereqsMap.get(s) || []).filter(p => showSet.has(p)),
        depth: depthMap.get(s) ?? 0,
      });
    }

    // 10) edges（表示サブグラフのみ）
    const edges: Edge[] = [];
    for (const n of nodesOut) {
      for (const p of n.prereqs) edges.push({ from: p, to: n.skill_id });
    }

    // 11) デバッグ情報（今だけ可視化：どれくらい閉包されたか）
    const debug = {
      titlesTotal: Object.keys(curriculum.titles).length,
      prereqsTotal: Object.keys(curriculum.prereqs).length,
      goalCount: goalSet.size,
      requiredCount: requiredSet.size,
      showCount: showSet.size,
      startCount: startSet.size,
      sampleGoals: Array.from(goalSet).slice(0, 5),
    };

    return NextResponse.json({
      ok: true,
      goals: roadmaps.map(r => ({
        roadmap_id: r.roadmap_id,
        goal_id: r.goal_id,
        items: r.nodes.map(n => n.skill_id),
      })),
      map: { nodes: nodesOut, edges },
      counts: {
        goals: goalSet.size,
        starts: [...startSet].length,
        required: [...requiredSet].filter(s => !startSet.has(s) && !goalSet.has(s)).length,
        mastered: nodesOut.filter(n => n.role === "mastered").length,
      },
      debug, // ← UIやNetworkタブで確認できるように返す
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e) }, { status:500 });
  }
}

/* ============ helpers ============ */

// 再帰的に前提を集約
function expandPrereqs(skill: string, g: Map<string,string[]>, out: Set<string>, seen: Set<string>) {
  if (seen.has(skill)) return;
  seen.add(skill);
  const ps = g.get(skill) || [];
  for (const p of ps) {
    out.add(p);
    expandPrereqs(p, g, out, seen);
  }
}

// トポロジカル距離（複数スタート）
function topoDepth(show: Set<string>, g: Map<string,string[]>, starts: Set<string>): Map<string, number> {
  const d = new Map<string, number>();
  const indeg = new Map<string, number>();
  for (const s of show) {
    const cnt = (g.get(s) || []).filter(p => show.has(p)).length;
    indeg.set(s, cnt);
  }
  // starts を優先。無ければ入次数0をスタートに
  const q: string[] = [];
  if (starts.size) {
    for (const s of starts) { d.set(s, 0); q.push(s); }
  } else {
    for (const s of show) if ((indeg.get(s) ?? 0) === 0) { d.set(s, 0); q.push(s); }
  }
  while (q.length) {
    const u = q.shift()!;
    const du = d.get(u) ?? 0;
    for (const v of show) {
      const ps = g.get(v) || [];
      if (!ps.includes(u)) continue;
      const indegv = (indeg.get(v) ?? 0) - 1;
      indeg.set(v, indegv);
      d.set(v, Math.max(d.get(v) ?? 0, du + 1));
      if (indegv === 0) q.push(v);
    }
  }
  return d;
}

// 追加ヘルパー
function familyOf(id: string, depth = 3): string | null {
    const parts = id.split(".");
    if (parts.length < depth) return null;
    return parts.slice(0, depth).join(".") + "."; // 例: "hs.calc.diff."
  }
  