'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type TableKind = 'posts' | 'article_comments' | 'articles' | 'threads';

export default function RlsDebugPage() {
  const [me, setMe] = useState<any>(null);
  const [table, setTable] = useState<TableKind>('posts');
  const [id, setId] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user ?? null));
  }, []);

  const tryUpdate = async () => {
    setLoading(true);
    setResult('');
    try {
      const targetId = Number(id);
      if (!Number.isFinite(targetId)) {
        setResult('❌ IDが不正です');
        setLoading(false);
        return;
      }
  
      // まず対象行の所有者を確認
      const { data: row, error: e0 } = await supabase
        .from(table)
        .select('id, author_id')
        .eq('id', targetId)
        .maybeSingle();
  
      if (e0) {
        setResult(`❌ 事前取得エラー: ${e0.message}`);
        setLoading(false);
        return;
      }
      if (!row) {
        setResult('❌ 該当IDの行が存在しません');
        setLoading(false);
        return;
      }
  
      // 更新内容を用意
      let payload: any = {};
      const stamp = new Date().toISOString();
      if (table === 'posts') payload = { body_md: `RLS test (edited) ${stamp}` };
      if (table === 'article_comments') payload = { body_md: `RLS test (edited) ${stamp}` };
      if (table === 'articles') payload = { title: `RLS test (edited) ${stamp}` };
      if (table === 'threads') payload = { title: `RLS test (edited) ${stamp}` };
  
      // 代表的な「RLSの効いたUPDATE」は、返却行が0になる
      const { data: updated, error: e1, status } = await supabase
        .from(table)
        .update(payload)
        .eq('id', targetId)
        .select('id, author_id'); // ← これ重要（返却0で判定できる）
  
      if (e1) {
        setResult(`❌ ERROR [${status ?? '-'}]: ${e1.message}`);
        setLoading(false);
        return;
      }
  
      if (!updated || updated.length === 0) {
        // RLSで弾かれた or 条件に合わず更新0件（他人の行など）
        setResult(`❌ 更新0件（RLSで拒否 または 所有者と不一致）`);
        setLoading(false);
        return;
      }
  
      // ここに来たらRLS的に許可され、実際に更新された
      setResult(`✅ OK: id=${updated[0].id} を更新（author_id=${updated[0].author_id}）`);
    } catch (e: any) {
      setResult(`❌ EXCEPTION: ${String(e?.message || e)}`);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">RLS Debug</h1>

      <div className="text-sm text-gray-600">
        <div>Signed in as: <code>{me?.email ?? '(not signed in)'}</code></div>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <label className="text-sm">Table</label>
        <select
          className="border rounded p-2"
          value={table}
          onChange={(e) => setTable(e.target.value as TableKind)}
        >
          <option value="posts">posts（スレ返信）</option>
          <option value="article_comments">article_comments（記事コメント）</option>
          <option value="articles">articles（記事）</option>
          <option value="threads">threads（スレッド）</option>
        </select>

        <label className="text-sm mt-2">Target ID (numeric)</label>
        <input
          className="border rounded p-2"
          placeholder="例) 123"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <button
          onClick={tryUpdate}
          disabled={loading || !id}
          className="underline disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Try UPDATE with current user'}
        </button>
      </div>

      {!!result && (
        <pre className="border rounded p-3 whitespace-pre-wrap text-sm">{result}</pre>
      )}

      <div className="text-xs text-gray-500">
        <p>使い方：</p>
        <ol className="list-decimal ml-5">
          <li>自分が作成したレコードのIDを入れて「Try UPDATE」→ <b>✅OK</b> になるはず</li>
          <li>別アカウントでログインして同じIDで実行 → <b>❌ERROR</b>（RLSで拒否）</li>
        </ol>
      </div>
    </div>
  );
}
