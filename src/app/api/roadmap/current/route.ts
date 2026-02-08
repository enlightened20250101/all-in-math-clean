// src/app/api/roadmap/current/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

type NodeItem = {
  skill_id: string;
  title?: string;
  due_at?: string | null;
  priority?: number | null;
  done?: boolean;
  prereqs?: string[];
};

type EnrichedItem = NodeItem & {
  mastery: number;
  status: "done" | "learning" | "overdue" | "not_started";
};

export async function GET() {
  try {
    const sb = await await supabaseServerReadOnly();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

    // 1) activeロードマップを取得
    const { data: roads, error: rErr } = await sb
      .from("roadmaps")
      .select("id, goal_id, nodes_json, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (rErr) return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 });

    // 2) mastery を引いてノードを整形
    const allNodes = (roads || []).flatMap((r: any) => Array.isArray(r.nodes_json) ? r.nodes_json.map((n: any) => n.skill_id) : []);
    const skillIds = Array.from(new Set(allNodes));
    const masteryMap = new Map<string, any>();
    if (skillIds.length) {
      const { data: mastery } = await sb
        .from("user_skill_mastery")
        .select("skill_id, mastery_level, retrievability, interval_days, last_seen_at")
        .eq("user_id", user.id)
        .in("skill_id", skillIds);
      (mastery || []).forEach((m: any) => masteryMap.set(m.skill_id, m));
    }

    const now = Date.now();
    const goals = (roads || []).map((r: any) => {
      const nodes: NodeItem[] = Array.isArray(r.nodes_json) ? r.nodes_json : [];
      const items: (EnrichedItem)[] = nodes.map(n => {
        const m = masteryMap.get(n.skill_id);
        const mastery = m?.mastery_level ?? 0;
        const dueISO = n.due_at || null;
        const dueTs = dueISO ? new Date(dueISO).getTime() : null;
        let status: EnrichedItem["status"] = "not_started";
        if (mastery >= 4 || n.done) status = "done";
        else if (dueTs && dueTs < now) status = "overdue";
        else if (mastery >= 1) status = "learning";

        return {
          ...n,
          title: n.title || n.skill_id,
          due_at: dueISO,
          priority: n.priority ?? 0,
          prereqs: Array.isArray(n.prereqs) ? n.prereqs : [],
          mastery,
          status,
        };
      });
      return {
        roadmap_id: r.id,
        goal_id: r.goal_id || "(no-title)",
        created_at: r.created_at,
        items,
      };
    });

    // 3) 軽量サマリ（最初のactiveロードマップ基準）
    const g0 = goals[0];
    let summary: {
      goal: string;
      masteryToday: number; // 0..100
      plan: { next: Array<{ id: string; title: string }> };
    } | null = null;

    if (g0) {
      // overdue → learning → not_started の順で、priority降順、最後にtitle
      const pool = g0.items
        .filter((it: any) => it.status !== "done")
        .slice()
        .sort((a: any, b: any) => {
          const order = (s: EnrichedItem["status"]) =>
            s === "overdue" ? 0 : s === "learning" ? 1 : s === "not_started" ? 2 : 3;
          if (order(a.status) !== order(b.status)) return order(a.status) - order(b.status);
          const pa = (a.priority ?? 0), pb = (b.priority ?? 0);
          if (pa !== pb) return pb - pa;
          return (a.title || a.skill_id).localeCompare(b.title || b.skill_id, "ja");
        });

      const next = pool.slice(0, 3).map(it => ({ id: it.skill_id, title: it.title || it.skill_id }));

      // “今日の達成”は今は 0 としておく（将来 attempts から日次集計）
      summary = {
        goal: g0.goal_id,
        masteryToday: 0,
        plan: { next },
      };
    }

    return NextResponse.json({ ok: true, goals, summary });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
