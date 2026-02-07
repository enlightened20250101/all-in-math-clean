// 先頭
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer"; // ← ここを修正

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await await supabaseServerReadOnly();          // ← ここも修正

    const { code } = await ctx.params;
    const { data: v, error: ev } = await supabase
      .from("views")
      .select("id, code, title, description")
      .eq("code", code)
      .maybeSingle();
    if (ev) return NextResponse.json({ error: ev.message }, { status: 500 });
    if (!v) return NextResponse.json({ error: "view not found", items: [] }, { status: 404 });

    const { data: items, error: ei } = await supabase
      .from("view_items")
      .select("order_index, weight, skills:skill_id(*)")
      .eq("view_id", v.id)
      .order("order_index", { ascending: true });
    if (ei) return NextResponse.json({ error: ei.message, items: [] }, { status: 500 });

    return NextResponse.json({
      view: v,
      items: (items ?? []).map((r: any) => ({
        order_index: r.order_index,
        weight: r.weight,
        skill: r.skills,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e), items: [] }, { status: 500 });
  }
}
