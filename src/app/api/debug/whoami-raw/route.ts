// src/app/api/debug/whoami-raw/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const access = (await cookies()).get("sb-access-token")?.value;
  if (!access) return NextResponse.json({ ok: false, reason: "no_cookie" }, { status: 400 });

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`;
  const r = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  });

  let body: any = null;
  try { body = await r.json(); } catch {}

  return NextResponse.json({ ok: r.ok, status: r.status, body });
}
