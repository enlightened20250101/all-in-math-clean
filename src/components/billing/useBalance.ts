'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Balance = { credits: number };

export function useBalance() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let pollId: any = null;
    let stopped = false;

    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { setLoading(false); return; }

      // 初回読み込み
      const { data } = await supabaseBrowser
        .from('learning_profiles')
        .select('credits')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!stopped) {
        setBalance({ credits: data?.credits ?? 0 });
        setLoading(false);
      }

      // Realtime (Postgres Changes)
      const channel = supabaseBrowser
        .channel('lp_credits_' + user.id)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'learning_profiles', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row: any = payload.new || payload.old;
            if (row && typeof row.credits === 'number') {
              setBalance({ credits: row.credits });
            }
          }
        )
        .subscribe();

      // フォールバック：15秒ごとにポーリング（Realtime無効でも更新される）
      pollId = setInterval(async () => {
        const { data } = await supabaseBrowser
          .from('learning_profiles')
          .select('credits')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data && typeof data.credits === 'number') {
          setBalance((prev) => {
            if (!prev || prev.credits !== data.credits) return { credits: data.credits };
            return prev;
          });
        }
      }, 15000);

      unsub = () => {
        supabaseBrowser.removeChannel(channel);
        if (pollId) clearInterval(pollId);
      };
    })();

    return () => {
      stopped = true;
      if (unsub) unsub();
    };
  }, []);

  return { balance, loading };
}
