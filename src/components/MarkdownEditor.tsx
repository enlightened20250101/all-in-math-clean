'use client';

import { useEffect, useRef, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

let mathliveLoadPromise: Promise<void> | null = null;

/** mathlive を “まず公式エクスポート”、失敗時は CDN で読む */
function loadMathlive(): Promise<void> {
  if (mathliveLoadPromise) return mathliveLoadPromise;

  mathliveLoadPromise = (async () => {
    // 1) パッケージ公開エントリから（推奨）
    try {
      await import('mathlive'); // ← dist/ を使わない
      return;
    } catch (_) {
      // 続行してCDNへ
    }

    // 2) 最後の砦: CDN
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mathlive/dist/mathlive.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (err) => reject(err as any);
      document.head.appendChild(s);
    });
  })();

  return mathliveLoadPromise;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [mathReady, setMathReady] = useState(false);
  const [mathFailed, setMathFailed] = useState(false);
  const mathRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadMathlive();
        if (mounted) setMathReady(true);
      } catch {
        if (mounted) setMathFailed(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const insertLatex = () => {
    const latex =
      mathRef.current?.getValue?.() ??
      mathRef.current?.value ??
      '';
    if (!latex) return;
    onChange(value + ` $${latex}$ `);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <textarea
          className="w-full h-64 border rounded p-2 font-mono"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="border rounded p-2">
          {mathReady && !mathFailed ? (
            <div>
              {/* @ts-ignore web component provided by mathlive */}
              <math-field
                ref={mathRef}
                virtual-keyboard-mode="manual"
                class="border rounded p-2 w-full"
              />
              <button onClick={insertLatex} className="mt-2 text-sm underline">
                TeXを本文に挿入
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {mathFailed
                ? 'Math キーボードの読み込みに失敗しました（通常入力は利用できます）'
                : 'Math キーボードを読み込み中...'}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-500 mb-1">プレビュー</div>
        <div className="border rounded p-3 bg-white">
          <MarkdownRenderer markdown={value} />
        </div>
      </div>
    </div>
  );
}
