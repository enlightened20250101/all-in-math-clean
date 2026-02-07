// src/app/api/learn/start/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServerAction } from "@/lib/supabaseServer";

async function clearAuthCookies() {
  const c = await cookies();
  // あなたのクッキー名に合わせて
  c.set("sb-access-token", "", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  c.set("sb-refresh-token","", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  c.set("supabase-auth-token","", { path: "/", maxAge: 0, httpOnly: true, secure: true });
}

export async function POST(req: Request) {
  try {
    const supabase = await await supabaseServerAction();

    // 直接ユーザーを読む（Authorization ヘッダで）
    const { data: userCtx, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !userCtx?.user) {
      // セッションが壊れている可能性 → クッキーを消して 401
      await clearAuthCookies();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const track_code   = body?.track_code as string | undefined;
    const settingsPatch= body?.settings ?? {};
    const start_desc   = body?.start_desc as string | null | undefined;
    const goal_desc    = body?.goal_desc  as string | null | undefined;
    const mode         = body?.mode       as string | null | undefined;

    if (!track_code) {
      return NextResponse.json({ error: "track_code required" }, { status: 400 });
    }

    const defaultSettings = {
      target_score: null, target_date: null,
      difficulty: 2, pace: "normal", priority_mode: "balanced",
      max_depth: 2, time_per_day: null,
    };
    const settings = { ...defaultSettings, ...(settingsPatch || {}) };

    const ins = {
      user_id: userCtx.user.id,
      track_code,
      settings,
      current_skill_id: null,
      frontier: [],
      start_desc: start_desc ?? null,
      goal_desc:  goal_desc  ?? null,
      mode:       mode       ?? null,
    };

    const { data, error } = await supabase
      .from("learning_sessions")
      .insert(ins)
      .select("id, track_code, settings")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ session_id: data!.id, track_code: data!.track_code, settings: data!.settings });

  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
