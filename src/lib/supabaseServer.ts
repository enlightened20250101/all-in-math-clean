// src/lib/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** 読み取り専用 */
export async function supabaseServerReadOnly() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabase env missing');
  }

  // 1) sb-access-token（httpOnly）を最優先
  let access = cookieStore.get("sb-access-token")?.value || null;

  // 2) 無ければ supabase-auth-token(JSON) から access_token を拾う
  if (!access) {
    const raw = cookieStore.get("supabase-auth-token")?.value;
    if (raw) {
      try { access = JSON.parse(raw)?.access_token || null; } catch {}
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      // cookies.get は refresh 系を SSR に見せない（勝手なリフレッシュ防止）
      cookies: {
        getAll: () =>
          cookieStore
            .getAll()
            .filter((c) => {
              const k = c.name.toLowerCase();
              return k !== "sb-refresh-token" && k !== "sb:token";
            })
            .map((c) => ({ name: c.name, value: c.value })),
        setAll: async () => {},
      },
      // ★ 決定打：Supabase クライアントの「送信ヘッダ」に常時 Authorization を差す
      global: {
        headers: access ? { Authorization: `Bearer ${access}` } : {},
      },
      // （任意）受信側のヘッダ参照はそのまま維持
      // headers は SSR client options には存在しないため渡さない
    }
  );
}

/** Route Handler / Action 向け（書き込み可）も同様に */
export async function supabaseServerAction() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('supabase env missing');
  }

  let access = cookieStore.get("sb-access-token")?.value || null;
  if (!access) {
    const raw = cookieStore.get("supabase-auth-token")?.value;
    if (raw) {
      try { access = JSON.parse(raw)?.access_token || null; } catch {}
    }
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () =>
          cookieStore
            .getAll()
            .filter((c) => {
              const k = c.name.toLowerCase();
              return k !== "sb-refresh-token" && k !== "sb:token";
            })
            .map((c) => ({ name: c.name, value: c.value })),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
      global: {
        headers: access ? { Authorization: `Bearer ${access}` } : {},
      },
      // headers は SSR client options には存在しないため渡さない
    }
  );
}
