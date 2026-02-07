// src/app/graphs/[id]/page.client.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import GraphEmbed from '@/components/graphs/GraphEmbed';
import { useRouter } from 'next/navigation';
import ExportPngButton from '@/components/graphs/ExportPngButton';
import ExportSvgButton from '@/components/graphs/ExportSvgButton';

export default function GraphPageClient({ id }: { id: number }) {
  const [title, setTitle] = useState<string | null>(null);
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let stop = false;
    (async () => {
      const { data } = await supabaseBrowser
        .from('graphs')
        .select('title')
        .eq('id', id)
        .maybeSingle();
      if (!stop) setTitle(data?.title ?? `Graph ${id}`);
    })();
    return () => { stop = true; };
  }, [id]);

  return (
    <div className="container mx-auto p-6 space-y-4">
      {/* タイトル + エクスポートボタン */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold mb-3">{title ?? 'Loading…'}</h1>
        <div className="flex items-center gap-2">
          <ExportSvgButton
            targetRef={previewRef}
            filename={`${title || 'graph'}-${id}.svg`}
          />
          <ExportPngButton
            targetRef={previewRef}
            filename={`${title || 'graph'}-${id}.png`}
          />
        </div>
      </div>
  
      {/* グラフ本体：ここをエクスポート対象にする */}
      <div
        ref={previewRef}
        className="w-full border rounded bg-white"
        style={{ maxWidth: 800, aspectRatio: '1 / 1' }}
      >
        <GraphEmbed id={id} />
      </div>
  
      {/* 埋め込みコード + 編集ボタン */}
      <div className="flex justify-between items-center mt-3 text-sm">
        <p>
          本文に埋め込む: <code>[graph:id={id}]</code>
        </p>
        <button
          className="px-3 py-1 border rounded hover:bg-gray-50"
          onClick={() => router.push(`/graphs/new?from=${id}`)}
        >
          このグラフを編集
        </button>
      </div>
    </div>
  );  
}
