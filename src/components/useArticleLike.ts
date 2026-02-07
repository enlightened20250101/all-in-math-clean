// components/useArticleLike.ts (新規)
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useArticleLike(articleId: number, onError?: (message: string) => void) {
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from('article_like_counts').select('likes').eq('article_id', articleId).maybeSingle(),
        user ? supabase.from('article_likes').select('article_id').eq('article_id', articleId).eq('user_id', user.id) : Promise.resolve({ data: null } as any),
      ]);
      setCount(c?.likes || 0);
      setMine(Boolean(m && (m as any[]).length));
    })();
  }, [articleId]);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { onError?.('ログインが必要です'); return; }
    if (!mine) {
      setMine(true); setCount(x => x + 1);
      const { error } = await supabase.from('article_likes').insert({ article_id: articleId, user_id: user.id });
      if (error) { setMine(false); setCount(x => Math.max(0, x - 1)); onError?.(error.message); }
    } else {
      setMine(false); setCount(x => Math.max(0, x - 1));
      const { error } = await supabase.from('article_likes').delete().eq('article_id', articleId).eq('user_id', user.id);
      if (error) { setMine(true); setCount(x => x + 1); onError?.(error.message); }
    }
  };

  return { count, mine, toggle };
}
