// app/join/[code]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function JoinByCodePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [msg, setMsg] = useState('参加処理中…');

  useEffect(() => {
    (async () => {
      // 未ログインならログインへ誘導
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.replace(`/login?returnTo=/join/${code}`);
        return;
      }
      const { data, error } = await supabase.rpc('consume_group_invite', { p_code: code });
      if (error) {
        const m = error.message;
        if (m.includes('expired')) setMsg('招待リンクの有効期限が切れています。');
        else if (m.includes('invalid invite')) setMsg('招待リンクが無効です。');
        else if (m.includes('max uses')) setMsg('招待リンクが上限回数に達しました。');
        else setMsg(`参加に失敗しました: ${m}`);
        return;
      }
      setMsg('参加に成功しました。グループへ移動します…');
      router.replace(`/groups/${data}`); // data = group_id
    })();
  }, [code, router]);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-2">招待リンク</h1>
      <p>{msg}</p>
    </div>
  );
}
