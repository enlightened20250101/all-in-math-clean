// src/app/api/roadmap/new/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly, supabaseServerAction } from "@/lib/supabaseServer";
import { planRoadmap } from "@/server/roadmapPlanner";

export async function POST(req: Request) {
  try {
    const sbr = await await supabaseServerReadOnly();
    const sba = await await supabaseServerAction();

    const { data: { user } } = await sbr.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

    const body = await req.json().catch(() => ({} as any));
    const title = body?.title || body?.goal_text || "My Roadmap";
    const target: Date | null = body?.target_date ? new Date(body.target_date) : null;
    const keepExisting: boolean = body?.keep_existing ?? true; // ← 既存を残す（デフォルト）

    // 既存アクティブを残したい（デフォルト）/アーカイブしたい（keep_existing=false）を切り替え
    if (!keepExisting) {
      await sba.from("roadmaps").update({ status: "archived" })
        .eq("user_id", user.id).eq("status", "active");
    }

    // サンプルノード（後でAI生成に差し替え予定）
    const now = new Date();
    const due1 = iso(target ? addDays(target, -28) : addDays(now, 14));
    const due2 = iso(target ? addDays(target, -14) : addDays(now, 28));

    let nodes: any[] = [];
    if (Array.isArray(body.nodes) && body.nodes.length) {
      nodes = body.nodes;
    } else if (body.goal_text || (Array.isArray(body.view_codes) && body.view_codes.length)) {
      const { nodes: planned } = await planRoadmap({
        userId: user.id,
        goalText: body.goal_text || "",
        targetDate: body.target_date || null,
        weeklyHours: body.weekly_hours ?? 7,
        viewCodes: body.view_codes || [],
        includeMastered: body.include_mastered ?? false,
        maxDepth: body.max_depth ?? 6,
        maxSkills: body.max_skills ?? 120,
      });
      nodes = planned;
    } else {
      const now = new Date();
      const due1 = (target ? addDays(target, -28) : addDays(now, 14)).toISOString();
      const due2 = (target ? addDays(target, -14) : addDays(now, 28)).toISOString();
      nodes = [
        { skill_id: "hs.calc.integral.basic", title: "不定積分の基礎", priority: 10, due_at: due1, prereqs: [] },
        { skill_id: "hs.calc.diff.basic",     title: "三角関数の微分", priority:  8, due_at: due2, prereqs: ["hs.calc.integral.basic"] },
      ];
    }

    // ロードマップ作成
    const { data: roadmap, error } = await sba
      .from("roadmaps")
      .insert({
        user_id: user.id,
        goal_id: title,
        nodes_json: nodes,
        status: "active",
      })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // ★ 学習セッションも自動で1件作成（最初に取り組むべきスキルを推定）
    let sessionId: string | number | null = null;
    try {
      const startSkill = pickStartSkill(nodes);
      if (startSkill) {
        const { data: sess } = await sba
          .from("learning_sessions")
          .insert({
            user_id: user.id,
            topic_slug: startSkill,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .maybeSingle();
        sessionId = sess?.id ?? null;
      }
    } catch {
      // セッション作成に失敗してもロードマップは成功として返す
    }

    return NextResponse.json({
      ok: true,
      roadmap_id: roadmap?.id || null,
      session_id: sessionId,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function iso(d: Date) { return d.toISOString(); }
function pickStartSkill(nodes: Array<any>): string | null {
  if (!Array.isArray(nodes) || !nodes.length) return null;
  const noDeps = nodes.filter(n => !Array.isArray(n.prereqs) || n.prereqs.length === 0);
  if (noDeps.length) return noDeps[0].skill_id;
  const withDue = nodes
    .filter(n => n.due_at)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
  if (withDue.length) return withDue[0].skill_id;
  return nodes[0].skill_id;
}
