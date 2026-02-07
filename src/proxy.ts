// src/proxy.ts
import { NextResponse, NextRequest } from "next/server";

// 保護対象プレフィックスだけマッチさせる
export const config = {
  matcher: [
    "/learn/:path*",
    "/groups/:path*",
    "/posts/:path*",
    "/u/:path*",
    "/settings/:path*",
  ],
};

export function proxy(req: NextRequest) {
  // /api/auth/* や /login などは matcher から外しているのでここには来ない

  // サーバが読む httpOnly Cookie だけを判定に使う
  const hasAccess = !!req.cookies.get("sb-access-token")?.value;

  if (!hasAccess) {
    const next = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/login?next=${next}`, req.url));
  }
  return NextResponse.next();
}
