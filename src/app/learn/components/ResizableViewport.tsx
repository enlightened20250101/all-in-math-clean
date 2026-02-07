'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  /** localStorage に保存するキー（セッションごとに分けると便利） */
  storageKey: string;
  /** ビューポートの最小サイズ */
  minWidth?: number;
  minHeight?: number;
  /** 上部ヘッダー分のオフセット（Fit時の高さ計算に使用） */
  headerOffset?: number; // 例: 96〜120px
  /** 初期サイズ（px）。未指定時は window に合わせて初期化 */
  defaultWidth?: number;
  defaultHeight?: number;
};

export default function ResizableViewport({
  children,
  storageKey,
  minWidth = 720,
  minHeight = 480,
  headerOffset = 120,
  defaultWidth,
  defaultHeight,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number>(defaultWidth ?? 0);
  const [h, setH] = useState<number>(defaultHeight ?? 0);

  // 初期値の決定（localStorage → window サイズ）
  useEffect(() => {
    const saved = (() => {
      try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { return null; }
    })();
    if (saved && typeof saved.w === 'number' && typeof saved.h === 'number') {
      setW(saved.w); setH(saved.h);
    } else {
      const ww =
        typeof window !== 'undefined'
          ? Math.max(minWidth, Math.min(window.innerWidth - 32, 1400))
          : (defaultWidth ?? 1200);
      const hh =
        typeof window !== 'undefined'
          ? Math.max(minHeight, window.innerHeight - headerOffset - 24)
          : (defaultHeight ?? 720);
      setW(ww); setH(hh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 永続化
  useEffect(() => {
    if (w && h) {
      try { localStorage.setItem(storageKey, JSON.stringify({ w, h })); } catch {}
    }
  }, [w, h, storageKey]);

  // Pointer Events 版のドラッグ開始
  function startPointerDrag(which: 'right'|'bottom'|'corner') {
    return (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();

      // capture 開始
      try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}

      const startX = e.clientX;
      const startY = e.clientY;
      const startW = w;
      const startH = h;

      // ドラッグ中の選択/カーソル抑止
      const prevUserSelect = document.body.style.userSelect;
      const prevCursor = document.body.style.cursor;
      const dragCursor =
        which === 'right' ? 'ew-resize' :
        which === 'bottom' ? 'ns-resize' : 'nwse-resize';
      document.body.style.userSelect = 'none';
      document.body.style.cursor = dragCursor;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (which === 'right' || which === 'corner') {
          setW(Math.max(minWidth, startW + dx));
        }
        if (which === 'bottom' || which === 'corner') {
          setH(Math.max(minHeight, startH + dy));
        }
      };

      const cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
        document.body.style.userSelect = prevUserSelect;
        document.body.style.cursor = prevCursor;
      };

      const releaseCaptureSafely = (ev: PointerEvent) => {
        try {
          // グローバルリスナでは currentTarget が null になり得るため target を使用
          (ev.target as HTMLElement | null)?.releasePointerCapture?.(ev.pointerId);
        } catch { /* noop */ }
      };

      const onUp = (ev: PointerEvent) => {
        releaseCaptureSafely(ev);
        cleanup();
      };
      const onCancel = (ev: PointerEvent) => {
        releaseCaptureSafely(ev);
        cleanup();
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
    };
  }

  // ツールバー操作
  function fitToWindow() {
    if (typeof window === 'undefined') return;
    const ww = Math.max(minWidth, window.innerWidth - 32);
    const hh = Math.max(minHeight, window.innerHeight - headerOffset - 24);
    setW(ww); setH(hh);
  }
  function resetSize() {
    if (typeof window === 'undefined') return;
    setW(1200);
    setH(Math.max(minHeight, window.innerHeight - headerOffset - 24));
  }

  if (!w || !h) {
    // 初期計算までプレースホルダ
    return <div className="w-full h-[60vh] rounded border bg-white/50 animate-pulse" />;
  }

  return (
    <div className="relative mx-auto" style={{ width: w, height: h }}>
      {/* 本体 */}
      <div ref={containerRef} className="w-full h-full rounded border bg-white shadow-sm overflow-hidden">
        {children}
      </div>

      {/* ドラッグハンドル（右・下・角） */}
      <div
        onPointerDown={startPointerDrag('right')}
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-transparent touch-none select-none"
        title="横幅をドラッグで調整"
        role="separator"
        aria-orientation="vertical"
      />
      <div
        onPointerDown={startPointerDrag('bottom')}
        className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize bg-transparent touch-none select-none"
        title="高さをドラッグで調整"
        role="separator"
        aria-orientation="horizontal"
      />
      <div
        onPointerDown={startPointerDrag('corner')}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-gray-300 rounded-tl touch-none select-none"
        title="角をドラッグで調整"
      />

      {/* 小さなツールバー */}
      <div className="absolute -top-9 right-0 flex items-center gap-2 text-xs">
        <button onClick={fitToWindow} className="px-2 py-1 border rounded bg-white hover:bg-gray-50">Fit</button>
        <button onClick={resetSize} className="px-2 py-1 border rounded bg-white hover:bg-gray-50">Reset</button>
      </div>
    </div>
  );
}
