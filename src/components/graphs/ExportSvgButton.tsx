// src/components/graphs/ExportSvgButton.tsx
'use client';
import { useEffect, useState } from 'react';

export default function ExportSvgButton({
  targetRef,
  filename = 'graph.svg',
  className = 'px-3 py-1 border rounded',
  onError
}: {
  targetRef: React.RefObject<HTMLElement>;
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
    const root = targetRef.current;
    if (!root) return;
    setBusy(true);
    try {
      const svg = root.querySelector('svg');
      if (!svg) throw new Error('SVG not found');
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      const message = 'SVG保存に失敗しました';
      setError(message);
      onError?.(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button onClick={onClick} className={className} disabled={busy}>
        {busy ? 'SVG生成中…' : 'SVG保存'}
      </button>
      {error ? (
        <span className="text-[10px] text-rose-600" role="status">
          {error}
        </span>
      ) : null}
    </div>
  );
}
