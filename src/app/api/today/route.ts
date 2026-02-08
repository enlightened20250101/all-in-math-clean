export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

/**
 * 返すアイテム構造:
 * { problem_id, skill_id, kind, body_md, reason, due_at?, score }
 */
export async function GET(_req: NextRequest) {
  try {
    const sb = await await supabaseServerReadOnly();

    // 1) ユーザー
    const { data: { user }, error: uerr } = await sb.auth.getUser();
    if (uerr || !user) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });

    // 2) 復習キュー（期限到来のスキル）
    const { data: dueMastery } = await sb
      .from("user_skill_mastery")
      .select("skill_id, mastery_level, easiness, interval_days, last_seen_at")
      .eq("user_id", user.id);

    const now = new Date();
    const dueSkills = (dueMastery || [])
      .filter((m: any) => {
        if (!m.last_seen_at) return false;
        const next = new Date(m.last_seen_at);
        next.setDate(next.getDate() + (m.interval_days ?? 0));
        return next <= now;
      })
      .map((m: any) => ({
        skill_id: m.skill_id,
        reason: "review",
        due_at: new Date(new Date(m.last_seen_at!).getTime() + (m.interval_days ?? 0) * 86400000).toISOString(),
        score: 100 + (5 - (m.mastery_level ?? 0)) * 10 // レビュー最優先 + 低マスタリ優遇
      }));

    // 3) ロードマップ（未到達スキル）
    //   roadmaps.nodes_json には {skill_id, due?, priority? , done?} の想定
    const { data: roads } = await sb
      .from("roadmaps")
      .select("nodes_json")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    const roadmapSkills: Array<{skill_id: string, due_at?: string, priority?: number}> =
      Array.isArray(roads?.nodes_json) ? roads!.nodes_json : [];

    // 既にマスター済みのスキルを除外（目安：mastery_level >= 4）
    const masteryMap = new Map<string, any>();
    for (const m of (dueMastery || [])) masteryMap.set(m.skill_id, m);

    const neededSkills = roadmapSkills
      .filter(n => {
        const mm = masteryMap.get(n.skill_id);
        return !mm || (mm.mastery_level ?? 0) < 4;
      })
      .map(n => ({
        skill_id: n.skill_id,
        reason: "roadmap",
        due_at: n.due_at ?? null,
        score: 60 + (n.priority ?? 0) + (n.due_at ? timeUrgency(n.due_at) : 0)
      }));

    // 4) スコアで並べ、重複除去して上位を取得
    const pool = [...dueSkills, ...neededSkills]
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const pickSkills: Array<{ skill_id: string, reason: string, score: number, due_at?: string | null }> = [];
    for (const item of pool) {
      if (seen.has(item.skill_id)) continue;
      seen.add(item.skill_id);
      pickSkills.push(item);
      if (pickSkills.length >= 12) break; // 問題紐づけの余裕を持って選ぶ
    }

    if (pickSkills.length === 0) {
      // フォールバック: 何も無ければ problems から3件
      const { data: anyProbs } = await sb
        .from("problems")
        .select("id, skill_id, body_md, kind")
        .order("created_at", { ascending: true })
        .limit(3);
      return NextResponse.json({ ok: true, items: (anyProbs || []).map((p: any) => ({
        problem_id: p.id, skill_id: p.skill_id, body_md: p.body_md, kind: p.kind, reason: "fallback", score: 1
      })) });
    }

    // 5) 各スキルに対し最初の問題を引く
    const skillsList = pickSkills.map(s => s.skill_id);
    const { data: probs } = await sb
      .from("problems")
      .select("id, skill_id, body_md, kind")
      .in("skill_id", skillsList)
      .order("created_at", { ascending: true });

    // skill -> 問題(最初の1件)
    const probBySkill = new Map<string, any>();
    for (const p of (probs || [])) {
      if (!probBySkill.has(p.skill_id)) probBySkill.set(p.skill_id, p);
    }

    let items = pickSkills
      .map(s => {
        const p = probBySkill.get(s.skill_id);
        if (!p) return null;
        return {
          problem_id: p.id,
          skill_id: p.skill_id,
          kind: p.kind,
          body_md: p.body_md,
          reason: s.reason,
          due_at: s.due_at ?? null,
          score: s.score
        };
      })
      .filter(Boolean)
      .slice(0, 3) as any[];

    // ★ 足りない分を「おすすめ」で補充（既に選んだ skill_id は除外）
    if (items.length < 3) {
      const chosen = new Set(items.map(i => i.skill_id));
      const { data: fillers } = await sb
        .from("problems")
        .select("id, skill_id, body_md, kind")
        .not("skill_id", "in", `(${[...chosen].map(s => `'${s}'`).join(",") || "''"})`)
        .order("created_at", { ascending: true })
        .limit(6);
      for (const f of (fillers || [])) {
        if (chosen.has(f.skill_id)) continue;
        items.push({
          problem_id: f.id,
          skill_id: f.skill_id,
          kind: f.kind,
          body_md: f.body_md,
          reason: "fallback",
          due_at: null,
          score: 1,
        });
        chosen.add(f.skill_id);
        if (items.length >= 3) break;
      }
    }

    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

function timeUrgency(dueISO: string): number {
  const due = new Date(dueISO).getTime();
  const now = Date.now();
  const days = Math.max(-3, Math.min(30, Math.round((due - now) / 86400000)));
  // 期限が迫るほど加点（遅れている場合はさらに加点）
  return days <= 0 ? 30 + Math.abs(days) * 5 : Math.max(0, 20 - days);
}
