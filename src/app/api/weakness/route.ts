export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const sb = await await supabaseServerReadOnly();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:"auth" }, { status:401 });

    // 1) 30日分の誤答を集計 → TOP3
    const sinceISO = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: att } = await sb
      .from("attempts")
      .select("skill_id, correct")
      .eq("user_id", user.id)
      .gte("created_at", sinceISO);

    const agg = new Map<string, { total:number; wrong:number }>();
    (att||[]).forEach((r:any)=>{
      const m = agg.get(r.skill_id) || { total:0, wrong:0 };
      m.total += 1; if (!r.correct) m.wrong += 1;
      agg.set(r.skill_id, m);
    });

    const topSkills = [...agg.entries()]
      .map(([skill_id,v])=>({ skill_id, score: v.wrong/Math.max(1,v.total) }))
      .sort((a,b)=> b.score - a.score)
      .slice(0,3)
      .map(x=>x.skill_id);

    if (!topSkills.length) return NextResponse.json({ ok:true, items: [] });

    // 2) 各スキル3問
    const { data: probs } = await sb
      .from("problems")
      .select("id, skill_id, body_md, kind, created_at")
      .in("skill_id", topSkills)
      .order("skill_id", { ascending: true })
      .order("created_at", { ascending: true });

    const bySkill: Record<string, any[]> = {};
    (probs||[]).forEach((p: any) =>{
      (bySkill[p.skill_id] ||= []).push(p);
    });

    const items = topSkills.map(s => ({
      skill_id: s,
      problems: (bySkill[s] || []).slice(0,3)
    })).filter(x => x.problems.length);

    return NextResponse.json({ ok:true, items });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
