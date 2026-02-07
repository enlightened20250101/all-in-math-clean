'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function BillingFinish() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (!session) {
        router.replace('/login?next=/billing');
        return;
      }
      // httpOnly Cookie へ同期（Server側で認証可能に）
      await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        }),
      });
      // Webhook反映のタイミングに余裕を持たせる（必要に応じて調整）
      setTimeout(() => router.replace('/billing?success=1'), 1200);
    })();
  }, [router]);

  return (
    <div className="p-6 text-sm text-gray-500">
      決済が完了しました。セッションを同期しています…
    </div>
  );
}
