// src/app/api/auth/set-session/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { access_token } = (await req.json().catch(() => ({}))) as {
      access_token?: unknown;
    };

    if (typeof access_token !== "string" || access_token.length < 20) {
      return NextResponse.json({ ok: false, error: "access_token required" }, { status: 400 });
    }

    const c = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    // 1) 念のため既存を全消し（httpOnly/非httpOnlyとも）
    c.delete("sb-access-token");
    c.delete("sb-refresh-token");
    c.delete("supabase-auth-token");
    c.delete("sb:token");

    // 2) access を httpOnly Cookie にセット（ドメインは省略＝現在ホスト）
    c.set("sb-access-token", access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,          // localhost は false でOK
      maxAge: 60 * 60 * 12,    // 12h（任意）
    });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
