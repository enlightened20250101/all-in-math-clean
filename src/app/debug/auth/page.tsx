'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DebugAuth() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();
        setSession(sessionRes.data?.session ?? null);
        const userRes = await supabase.auth.getUser();
        setUser(userRes.data?.user ?? null);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Debug / Auth</h1>
      {error && <pre className="text-red-600">{error}</pre>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">Session</h2>
          <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(session, null, 2)}</pre>
        </div>
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">User</h2>
          <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
