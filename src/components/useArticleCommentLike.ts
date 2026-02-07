// components/useArticleCommentLike.ts (新規)
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useArticleCommentLike(commentId: number, onError?: (message: string) => void) {
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from('article_comment_like_counts').select('likes').eq('comment_id', commentId).maybeSingle(),
        user ? supabase.from('article_comment_likes').select('comment_id').eq('comment_id', commentId).eq('user_id', user.id) : Promise.resolve({ data: null } as any),
      ]);
      setCount(c?.likes || 0);
      setMine(Boolean(m && (m as any[]).length));
    })();
  }, [commentId]);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { onError?.('ログインが必要です'); return; }
    if (!mine) {
      setMine(true); setCount(x => x + 1);
      const { error } = await supabase.from('article_comment_likes').insert({ comment_id: commentId, user_id: user.id });
      if (error) { setMine(false); setCount(x => Math.max(0, x - 1)); onError?.(error.message); }
    } else {
      setMine(false); setCount(x => Math.max(0, x - 1));
      const { error } = await supabase.from('article_comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      if (error) { setMine(true); setCount(x => x + 1); onError?.(error.message); }
    }
  };

  return { count, mine, toggle };
}
