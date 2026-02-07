'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Profile = {
  credits: number | null;
  plan: string | null;
  monthly_quota_limit: number | null;
  monthly_quota_used: number | null;
};

// 概算ポイント換算（by_tokens想定）
// ※ 実際の減算はサーバ側の deduct_credits が厳密に行うので、ここは「目安」表示。
function estimatePointsFromTokens(totalTokens: number) {
  // 表示用の公開env（未設定なら既定値）
  const P_IN = Number(process.env.NEXT_PUBLIC_POINTS_PER_1K_INPUT ?? '0.2');
  const P_OUT = Number(process.env.NEXT_PUBLIC_POINTS_PER_1K_OUTPUT ?? '0.8');
  if (!totalTokens || totalTokens <= 0) return 0;

  // おおよそ入力40%/出力60%で按分（実装に合わせて変えるならここ）
  const inTok = totalTokens * 0.4;
  const outTok = totalTokens * 0.6;
  const pts = Math.ceil((inTok / 1000) * P_IN + (outTok / 1000) * P_OUT);
  return Math.max(0, pts);
}

export default function BillingPage() {
  const [ready, setReady] = useState(false);   // httpOnly同期完了
  const [loading, setLoad] = useState(true);   // プロフィール/使用量ロード中
  const [p, setP] = useState<Profile | null>(null);
  const [usage, setUsage] = useState<{ tokens_used: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  // 1) ブラウザのセッションを httpOnly Cookie へ同期
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session) {
          location.href = '/login?next=/billing';
          return;
        }
        await fetch('/api/auth/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
        setReady(true);
      } catch (e: any) {
        console.error('[billing] set-session error', e);
        setErr(e?.message ?? 'セッション同期に失敗しました');
      }
    })();
  }, []);

  // 2) プロフィール/今月の使用量を取得（ready 後）
  useEffect(() => {
    if (!ready) return;
    (async () => {
      setLoad(true);
      setErr(null);
      try {
        const [{ data: prof, error: pe }, { data: u, error: ue }] = await Promise.all([
          supabaseBrowser.from('learning_profiles')
            .select('credits, plan, monthly_quota_limit, monthly_quota_used')
            .maybeSingle(),
          // 既存ビュー: v_usage_monthly(tokens_used bigint)
          supabaseBrowser.from('v_usage_monthly')
            .select('tokens_used')
            .maybeSingle(),
        ]);
        if (pe) throw pe;
        if (ue) throw ue;
        setP(prof ?? { credits: 0, plan: null, monthly_quota_limit: 0, monthly_quota_used: 0 });
        setUsage(u ?? { tokens_used: 0 });
      } catch (e: any) {
        console.error('[billing] load error', e);
        setErr(e?.message ?? '読み込みに失敗しました');
      } finally {
        setLoad(false);
      }
    })();
  }, [ready]);

  // 3) Checkout: クレジット購入（前払い）
  async function buyCredits(kind: 'credits_1000') {
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) { location.href = '/login?next=/billing'; return; }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Bearerを付ける（httpOnlyが無い/不安定な環境でも確実に認証）
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ mode: 'payment', kind }),
      });
      const raw = await res.text();
      let j: any = {}; try { if (raw) j = JSON.parse(raw); } catch { j = { raw }; }
      if (!res.ok) {
        console.error('[buyCredits] error', res.status, j);
        setToast({ message: `購入エラー: ${j.error ?? res.status}`, type: 'error' });
        return;
      }
      if (j.url) location.href = j.url;
    } catch (e: any) {
      console.error('[buyCredits] fetch error', e);
      setToast({ message: `購入エラー: ${e?.message ?? 'network error'}`, type: 'error' });
    }
  }

  // 4) Checkout: 月額プラン（必要なら使用）
  async function subscribe(kind: 'plan_basic') {
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) { location.href = '/login?next=/billing'; return; }

      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ mode: 'subscription', kind }),
      });
      const raw = await res.text();
      let j: any = {}; try { if (raw) j = JSON.parse(raw); } catch { j = { raw }; }
      if (!res.ok) {
        console.error('[subscribe] error', res.status, j);
        setToast({ message: `購読エラー: ${j.error ?? res.status}`, type: 'error' });
        return;
      }
      if (j.url) location.href = j.url;
    } catch (e: any) {
      console.error('[subscribe] fetch error', e);
      setToast({ message: `購読エラー: ${e?.message ?? 'network error'}`, type: 'error' });
    }
  }

  if (!ready) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  const monthLimit  = p?.monthly_quota_limit ?? 0;
  const monthUsed   = p?.monthly_quota_used ?? 0;
  const monthRemain = Math.max(0, monthLimit - monthUsed);
  const tokensUsed  = usage?.tokens_used ?? 0;
  const pointsUsed  = estimatePointsFromTokens(tokensUsed);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">ご利用状況とプラン</h1>

      {toast ? (
        <div
          className={`rounded border px-3 py-2 text-sm ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {err && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded p-3">
          {err}
        </div>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        {/* 残高（ポイント） */}
        <div className="border rounded p-4">
          <div className="text-xs text-gray-500">残高（ポイント）</div>
          <div className="text-2xl font-semibold">{loading ? '—' : (p?.credits ?? 0)}</div>
          <button
            onClick={()=>buyCredits('credits_1000')}
            className="mt-3 px-3 py-2 border rounded"
            disabled={!ready}
          >
            ¥1,000 チャージ（1,000 pt）
          </button>
        </div>

        {/* 月額プラン（任意） */}
        <div className="border rounded p-4">
          <div className="text-xs text-gray-500">月額プラン</div>
          <div className="text-sm">{loading ? '読込中…' : `プラン: ${p?.plan ?? '未加入'}`}</div>
          <div className="text-sm">
            {loading ? '—' :
              <>今月枠: {monthLimit.toLocaleString()} / 使用: {monthUsed.toLocaleString()} / 残り: {monthRemain.toLocaleString()}</>}
          </div>
          <button
            onClick={()=>subscribe('plan_basic')}
            className="mt-3 px-3 py-2 border rounded"
            disabled={!ready}
          >
            月額プランに加入
          </button>
        </div>

        {/* 今月のポイント消費（概算） */}
        <div className="border rounded p-4">
          <div className="text-xs text-gray-500">今月のポイント消費（概算）</div>
          <div className="text-2xl font-semibold">{loading ? '—' : pointsUsed.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">
            ※概算。実際の残高はポイント減算処理に基づきます。
          </div>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="border rounded p-4">
        <div className="font-semibold mb-2">注意事項</div>
        <ul className="text-sm list-disc ml-5">
          <li>チャージは「円 → ポイント（1円=1pt）」で付与されます。</li>
          <li>ポイント消費は会話の内容や長さにより変動します（最少/最大を設定）。</li>
          <li>残高・使用量の反映に1〜2秒かかる場合があります。</li>
        </ul>
      </section>
    </div>
  );
}
