// src/app/graphs/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import Link from 'next/link';
import GraphEmbed from '@/components/graphs/GraphEmbed';
import ExportPngButton from '@/components/graphs/ExportPngButton';
import { useRouter } from 'next/navigation';

type Row = { id:number; title:string; type:'function'|'series'|'implicit'; created_at:string };

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [userId, setUserId] = useState<string|null>(null);
  const previewRefs = useRef<Record<number, HTMLDivElement|null>>({});
  const router = useRouter();
  const [visibleMap, setVisibleMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) { location.href = '/login?next=/graphs'; return; }
      setUserId(user.id);
      const { data } = await supabaseBrowser
        .from('graphs')
        .select('id,title,type,created_at,author_id')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      setRows((data ?? []).map((r:any)=>({ id:r.id, title:r.title, type:r.type, created_at:r.created_at })));
    })();
  }, []);

  // プレビューを軽くするため：画面に入ったカードだけ GraphEmbed を描画
  useEffect(() => {
    if (rows.length === 0) return;
    if (typeof window === 'undefined') return;

    // IntersectionObserver がない古いブラウザなら全部描画
    if (!('IntersectionObserver' in window)) {
      const allVisible: Record<number, boolean> = {};
      rows.forEach((r) => {
        allVisible[r.id] = true;
      });
      setVisibleMap(allVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idAttr = entry.target.getAttribute('data-graph-id');
          if (!idAttr) return;
          const idNum = Number(idAttr);
          if (!Number.isFinite(idNum)) return;

          if (entry.isIntersecting) {
            // 既に true のものは更新しない（無駄な再レンダリング防止）
            setVisibleMap((prev) =>
              prev[idNum] ? prev : { ...prev, [idNum]: true },
            );
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      },
    );

    // 各カードのプレビューコンテナを監視対象にする
    rows.forEach((r) => {
      const el = previewRefs.current[r.id];
      if (el) {
        el.setAttribute('data-graph-id', String(r.id));
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [rows]);


  if (!userId) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">あなたのライブラリー</h1>
        <Link href="/graphs/new" className="px-3 py-1 border rounded bg-black text-white">新規作成</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {rows.map(r => (
          <div key={r.id} className="border rounded p-3 bg-white">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold truncate">{r.title}</div>
                <div className="text-xs text-gray-500">{r.type}・{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/graphs/${r.id}`} className="px-3 py-1 border rounded">
                  開く
                </Link>
                <button
                  className="px-3 py-1 border rounded text-sm"
                  onClick={() => router.push(`/graphs/new?from=${r.id}`)}
                >
                  編集
                </button>
                <ExportPngButton
                  getTarget={() => previewRefs.current[r.id] as HTMLElement | null}
                  filename={`${r.title || 'graph'}-${r.id}.png`}
                  className="px-3 py-1 border rounded"
                />
              </div>
            </div>
        
            {/* チャートはタイトルから少し離す / はみ出し防止 */}
            <div
              ref={(el) => {
                previewRefs.current[r.id] = el;
              }}
              className="w-full h-60 border rounded mt-2 overflow-hidden"
            >
              {visibleMap[r.id] ? (
                <GraphEmbed id={r.id} height={240} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  プレビューを読み込み中…
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
