// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnTo = url.searchParams.get("returnTo") || "/";

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    }
  );

  if (code) {
    // ここで server-side に httpOnly Cookie が確立される
    await supabase.auth.exchangeCodeForSession(code);
  }

  // サーバーがCookieを持った状態で 302 → 次のSSRから認証済みになる
  return NextResponse.redirect(new URL(returnTo, url.origin));
}
