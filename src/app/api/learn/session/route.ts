// src/app/api/learn/session/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServerAction } from "@/lib/supabaseServer";

/** 認証が壊れているときにクッキーを掃除する（次の /login で貼り直し） */
async function clearAuthCookies() {
  const c = await cookies();
  // あなたのクッキー名に合わせて調整
  try {
    c.set("sb-access-token", "", { path: "/", maxAge: 0, httpOnly: true, secure: true });
    c.set("sb-refresh-token","", { path: "/", maxAge: 0, httpOnly: true, secure: true });
    c.set("supabase-auth-token","", { path: "/", maxAge: 0, httpOnly: true, secure: true });
  } catch {}
}

export async function POST(req: Request) {
  try {
    const supabase = await await supabaseServerAction();

    // 1) 認証ユーザー（Authorization: Bearer <access> でのみ判定）
    const { data: userCtx, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !userCtx?.user) {
      await clearAuthCookies();
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2) リクエスト body
    const body = await req.json().catch(() => ({} as any));
    const skill_id = body?.skill_id as string | undefined;
    if (!skill_id || typeof skill_id !== "string") {
      return NextResponse.json({ error: "skill_id required" }, { status: 400 });
    }

    // 3) セッション作成
    //    topic_slug と current_skill_id の両方をセットして、/learn 側で即このスキルから開始できるようにする
    const { data: inserted, error: insErr } = await supabase
      .from("learning_sessions")
      .insert({
        user_id: userCtx.user.id,
        topic_slug: skill_id,
        current_skill_id: skill_id,
      })
      .select("id, topic_slug, current_skill_id")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json(
      { session_id: inserted.id, topic_slug: inserted.topic_slug, current_skill_id: inserted.current_skill_id },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
