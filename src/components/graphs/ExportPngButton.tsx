// src/components/graphs/ExportPngButton.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ExportPngButton({
  targetRef,
  getTarget,
  filename = 'graph.png',
  className = 'px-3 py-1 border rounded',
  onError
}: {
  targetRef?: React.RefObject<HTMLElement>;
  getTarget?: () => HTMLElement | null;
  filename?: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 2200);
    return () => window.clearTimeout(timer);
  }, [error]);

  async function onClick() {
    const target = getTarget ? getTarget() : targetRef?.current ?? null;
    if (!target) return;
    setBusy(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(target as HTMLElement, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();
    } catch (e) {
      console.error(e);
      const message = '画像保存に失敗しました';
      setError(message);
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button onClick={onClick} className={className} disabled={busy}>
        {busy ? '画像生成中…' : 'PNG保存'}
      </button>
      {error ? (
        <span className="text-[10px] text-rose-600" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}
