// src/app/api/debug/cookie-dump/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

export async function GET() {
  const c = await cookies();
  const h = await headers();
  return NextResponse.json({
    has_cookie: !!c.get("sb-access-token"),
    cookie_len: c.get("sb-access-token")?.value?.length ?? 0,
    req_cookie_header_present: !!h.get("cookie"),
  });
}
