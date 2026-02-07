// src/app/api/auth/clear/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function clearAll() {
  const c = await cookies();
  c.delete("sb-access-token");
  c.delete("sb-refresh-token");
  c.delete("supabase-auth-token");
  c.delete("sb:token");
}

export async function POST() {
  await clearAll();
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

// 便利のため GET でもクリア可能に
export async function GET() {
  await clearAll();
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
