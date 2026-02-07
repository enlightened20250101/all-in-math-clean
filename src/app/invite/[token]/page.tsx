'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<'idle'|'accepting'|'done'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  const isInvalidToken = useMemo(() => !token || !UUID_RE.test(token), [token]);

  useEffect(() => {
    // トークンが不正なら404へ（ちらつき防止で描画もしない）
    if (isInvalidToken) router.replace('/404');
  }, [isInvalidToken, router]);

  const accept = async () => {
    if (isInvalidToken) return;

    setStatus('accepting');
    setMsg('参加処理を実行中…');

    // 未ログインならログインへ
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace(`/login?next=/invite/${token}`);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('accept_group_invite', { p_token: token });
      if (error) {
        console.error('RPC error', {
          message: error.message,
          details: (error as any).details,
          hint:    (error as any).hint,
          code:    (error as any).code,
        });
        throw error;
      }

      const groupId = data?.[0]?.gid as string | undefined;
      if (!groupId) throw new Error('グループIDが返りませんでした');

      setStatus('done');
      setMsg('参加に成功しました。チャットへ移動します…');
      router.replace(`/groups/${groupId}`);
    } catch (e: any) {
      console.error('accept exception', e);
      setStatus('error');
      setMsg(e?.message ?? '参加に失敗しました');
    }
  };

  if (isInvalidToken) return null;

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-semibold">グループに参加しますか？</h1>

      <button
        onClick={accept}
        disabled={status === 'accepting'}
        className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
      >
        {status === 'accepting' ? '参加中…' : '参加する'}
      </button>

      {msg && (
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>
          {msg}
        </p>
      )}

      <p className="text-xs text-gray-500">
        有効期限切れ・使用回数上限・無効化された招待の場合はエラーになります。オーナーに新しいリンクを依頼してください。
      </p>
    </div>
  );
}
