// src/app/api/debug/jwt/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function b64urlToJSON(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const str = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(str);
}

export async function GET() {
  const token = (await cookies()).get("sb-access-token")?.value;
  if (!token) return NextResponse.json({ ok: false, reason: "no_cookie" }, { status: 400 });
  const [h, p] = token.split(".");
  const header = b64urlToJSON(h);
  const payload = b64urlToJSON(p);
  return NextResponse.json({
    ok: true,
    header,
    payload: {
      sub: payload.sub,
      email: payload.email ?? null,
      exp: payload.exp,
      iss: payload.iss, // 発行元（プロジェクトURL）
      aud: payload.aud,
    },
  });
}
