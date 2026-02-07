// src/components/SessionSync.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function SessionSync() {
  const router = useRouter();
  const lastAccessRef = useRef<string | null>(null);

  useEffect(() => {
    const sb = supabaseBrowser;

    // 初回：有効セッションがあれば差分同期
    sb.auth.getSession().then(async ({ data }) => {
      const at = data?.session?.access_token ?? null;
      if (at && lastAccessRef.current !== at) {
        await setServerAccess(at);
        lastAccessRef.current = at;
      }
    });

    // 以後：Auth 状態が変わった時だけ同期（差分）
    const { data: sub } = sb.auth.onAuthStateChange(async (_event, session) => {
      const at = session?.access_token ?? null;
      if (!at) {
        // サインアウト → サーバの httpOnly cookie も掃除
        await fetch("/api/auth/clear", { method: "POST", credentials: "include" }).catch(() => {});
        return;
      }
      if (at !== lastAccessRef.current) {
        await setServerAccess(at);
        lastAccessRef.current = at;
      }
    });

    return () => { sub.subscription?.unsubscribe(); };
  }, [router]);

  return null;
}

async function setServerAccess(access_token: string) {
  await fetch("/api/auth/set-session", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    credentials: "include",
    body: JSON.stringify({ access_token }), // ← refresh_token は送らない（使い捨てなので）
  }).catch(() => {});
}
