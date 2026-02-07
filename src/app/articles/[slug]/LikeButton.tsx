'use client';
import { useEffect, useState } from 'react';
import { useArticleLike } from '@/components/useArticleLike';

export default function LikeButton({ articleId }: { articleId: number }) {
  const [toast, setToast] = useState<string | null>(null);
  const { count, mine, toggle } = useArticleLike(articleId, (message) => setToast(message));

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  return (
    <div className="grid gap-1">
      <button onClick={toggle} className={`text-sm underline ${mine ? 'text-rose-600' : ''}`}>
        いいね {count}
      </button>
      {toast ? (
        <div className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
