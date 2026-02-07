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
    const patch = body?.patch ?? {};
    if (!session_id) return NextResponse.json({ error: "session_id required" }, { status: 400 });

    // 既存設定の取得
    const { data: s, error: e1 } = await supabase
      .from("learning_sessions")
      .select("settings")
      .eq("id", session_id)
      .eq("user_id", userCtx.user.id)
      .maybeSingle();
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    if (!s) return NextResponse.json({ error: "session not found" }, { status: 404 });

    const merged = { ...(s.settings ?? {}), ...(patch || {}) };

    const { error: e2 } = await supabase
      .from("learning_sessions")
      .update({ settings: merged })
      .eq("id", session_id)
      .eq("user_id", userCtx.user.id);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    return NextResponse.json({ ok: true, settings: merged });
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
