export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await await supabaseServerAction();
    const body = await req.json().catch(() => ({}));

    const { data: userCtx, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !userCtx?.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const session_id = body?.session_id as number | undefined;
    const skill_id = body?.skill_id as string | undefined;
    if (!session_id || !skill_id) {
      return NextResponse.json({ error: "session_id and skill_id required" }, { status: 400 });
    }

    // skills に存在するか（軽い整合チェック）
    const { data: sk } = await supabase.from("skills").select("id").eq("id", skill_id).maybeSingle();
    if (!sk) return NextResponse.json({ error: "skill not found" }, { status: 400 });

    const { data: updated, error } = await supabase
      .from("learning_sessions")
      .update({ current_skill_id: skill_id })
      .eq("id", session_id)
      .eq("user_id", userCtx.user.id)
      .select("id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!updated) return NextResponse.json({ error: "session not found" }, { status: 404 });
    return NextResponse.json({ ok: true, current_skill_id: skill_id });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
