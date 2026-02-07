'use client';

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Googleは /auth/callback でサーバー側セッション確立（既存の exchangeCodeForSession を使用）
function LoginPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [tab, setTab] = useState<"password"|"otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function afterLogin() {
    // クライアントのセッション取得
    const { data } = await supabase.auth.getSession();
    const s = data.session;
  
    // ① /api/auth/set-session を呼んで httpOnly Cookie を貼る
    if (s?.access_token && s?.refresh_token) {
      await fetch("/api/auth/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",        // ← 必須
        body: JSON.stringify({
          access_token: s.access_token,
          refresh_token: s.refresh_token,
        }),
      });
    }
  
    // ② ハード遷移で SSR を発生させ、Cookieを確実に送る
    window.location.assign(next);       // ← router.replace ではなくこちら
  }

  async function onPasswordSignIn() {
    setErr(null); setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error("セッションを取得できませんでした。");
      await afterLogin();
    } catch (e:any) {
      setErr(e.message || "ログインに失敗しました");
    } finally { setLoading(false); }
  }

  async function onSendOtp() {
    setErr(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }, // 新規も許可する場合
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (e:any) {
      setErr(e.message || "コード送信に失敗しました");
    } finally { setLoading(false); }
  }

  async function onVerifyOtp() {
    setErr(null); setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) throw error;
      if (!data.session) throw new Error("セッションを取得できませんでした。");
      await afterLogin();
    } catch (e:any) {
      setErr(e.message || "認証コードが正しくありません");
    } finally { setLoading(false); }
  }

  async function onGoogle() {
    setErr(null);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?returnTo=${encodeURIComponent(next)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      // ここでは何もしない：Google画面へ遷移→/auth/callback→returnTo へ
    } catch (e:any) {
      setErr(e.message || "Googleログインに失敗しました");
    }
  }

  return (
    <div className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-bold">ログイン</h1>

      {/* タブ */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${tab==="password"?"bg-black text-white":"border"}`}
          onClick={()=>setTab("password")}
        >パスワード</button>
        <button
          className={`px-3 py-1 rounded ${tab==="otp"?"bg-black text-white":"border"}`}
          onClick={()=>setTab("otp")}
        >メール認証コード</button>
      </div>

      {/* Google ログイン */}
      <div>
        <button
          onClick={onGoogle}
          className="w-full border rounded p-2 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 31.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 6.6 28.9 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.9-.2-3.6-.4-5.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.5 6.6 28.9 5 24 5 16.3 5 9.6 9.6 6.3 14.7z"/><path fill="#4CAF50" d="M24 47c5.2 0 9.8-2 13.1-5.2l-6.1-5.1C29.7 38.7 27 39 24 39c-5.2 0-9.6-3.3-11.5-7.9l-6.5 5C9.5 43.6 16.2 47 24 47z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.8-4.4 6.7-8.3 7.5l6.1 5.1C36.9 38.5 39 32.5 39 26c0-1.9-.2-3.6-.4-5.5z"/></svg>
          Google で続行
        </button>
      </div>

      {tab==="password" ? (
        <div className="space-y-3">
          <input className="border rounded w-full p-2" type="email" placeholder="you@example.com"
                 value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="border rounded w-full p-2" type="password" placeholder="パスワード"
                 value={password} onChange={(e)=>setPassword(e.target.value)} />
          <div className="text-[11px] text-slate-600">
            続行することで、<a className="underline" href="/terms">利用規約</a> と{" "}
            <a className="underline" href="/privacy">プライバシーポリシー</a> に同意したものとみなされます。
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="w-full bg-black text-white rounded p-2" disabled={loading} onClick={onPasswordSignIn}>
            {loading ? "送信中…" : "ログイン"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input className="border rounded w-full p-2" type="email" placeholder="you@example.com"
                 value={email} onChange={(e)=>setEmail(e.target.value)} />
          {!otpSent ? (
            <>
              <div className="text-[11px] text-slate-600">
                続行することで、<a className="underline" href="/terms">利用規約</a> と{" "}
                <a className="underline" href="/privacy">プライバシーポリシー</a> に同意したものとみなされます。
              </div>
              {err && <p className="text-red-600 text-sm">{err}</p>}
              <button className="w-full bg-black text-white rounded p-2" disabled={loading || !email} onClick={onSendOtp}>
                {loading ? "送信中…" : "6桁コードを送信"}
              </button>
            </>
          ) : (
            <>
              <input className="border rounded w-full p-2 tracking-widest text-center"
                     placeholder="123456" value={otp} onChange={(e)=>setOtp(e.target.value)} />
              <div className="text-[11px] text-slate-600">
                続行することで、<a className="underline" href="/terms">利用規約</a> と{" "}
                <a className="underline" href="/privacy">プライバシーポリシー</a> に同意したものとみなされます。
              </div>
              {err && <p className="text-red-600 text-sm">{err}</p>}
              <button className="w-full bg-black text-white rounded p-2"
                      disabled={loading || otp.length < 6} onClick={onVerifyOtp}>
                {loading ? "確認中…" : "コードを確認してログイン"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
