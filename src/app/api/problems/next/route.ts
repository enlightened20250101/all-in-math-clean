export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const sb = await await supabaseServerReadOnly();
  const skillId = req.nextUrl.searchParams.get("skillId");
  const afterId = req.nextUrl.searchParams.get("after"); // ★ 追加

  if (!skillId) {
    return NextResponse.json({ ok: false, error: "skillId required" }, { status: 400 });
  }

  // afterが来ていたら、その問題の“次”（作成日時が後）を返す
  if (afterId) {
    // afterのcreated_atを調べる
    const { data: cur } = await sb
      .from("problems")
      .select("created_at")
      .eq("id", afterId)
      .maybeSingle();

    if (cur?.created_at) {
      const { data: next } = await sb
        .from("problems")
        .select("id, skill_id, body_md, kind, payload, created_at")
        .eq("skill_id", skillId)
        .gt("created_at", cur.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (next) return NextResponse.json({ ok: true, problem: next });
    }
  }

  // 通常：最初の1件（フォールバック含む）
  const { data: first, error } = await sb
    .from("problems")
    .select("id, skill_id, body_md, kind, payload, created_at")
    .eq("skill_id", skillId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !first) {
    return NextResponse.json({ ok: false, error: error?.message || "no problem" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, problem: first });
}
