export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { planRoadmap } from "@/server/roadmapPlanner";

export async function POST(req: Request) {
  try {
    const sbr = await await supabaseServerReadOnly();
    const { data: { user } } = await sbr.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:"auth" }, { status:401 });

    const body = await req.json().catch(()=> ({}));
    const { nodes, budgetHours } = await planRoadmap({
      userId: user.id,
      goalText: body.goal_text || body.title || "",
      targetDate: body.target_date || null,
      weeklyHours: body.weekly_hours ?? 7,
      viewCodes: body.view_codes || [],
      includeMastered: body.include_mastered ?? false,
      maxDepth: body.max_depth ?? 6,
      maxSkills: body.max_skills ?? 120,
    });

    return NextResponse.json({ ok:true, preview: nodes, budget_hours: budgetHours });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status:500 });
  }
}
