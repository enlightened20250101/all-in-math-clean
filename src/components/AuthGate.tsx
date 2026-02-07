'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function AuthGateInner({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const timer = useRef<any>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams?.toString();
  const current = qs ? `${pathname}?${qs}` : pathname || '/';

  useEffect(() => {
    let active = true;
    timer.current = setTimeout(() => { if (!ready) setReady(true); }, 4000);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSignedIn(Boolean(data.session));
        setReady(true);
      } catch {
        if (!active) return;
        setReady(true);
      }
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      setSignedIn(Boolean(session));
      setReady(true);
    });

    return () => {
      active = false;
      clearTimeout(timer.current);
      subscription.subscription.unsubscribe();
    };
  }, [ready]);

  if (!ready) return <div className="text-sm text-gray-500">Loading...</div>;
  if (!signedIn) return (
    <div className="border rounded p-4">
      <p className="mb-2">この機能の利用にはログインが必要です。</p>
      <Link className="underline" href={`/login?next=${encodeURIComponent(current)}`}>
        ログイン/登録へ
      </Link>
    </div>
  );
  return <>{children}</>;
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
      <AuthGateInner>{children}</AuthGateInner>
    </Suspense>
  );
}
