'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import React from 'react';

export default function ResizableSplit({
  left,
  right,
  storageKey = 'learn-split',
  minLeft = 420,
  minRight = 320,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  storageKey?: string;
  minLeft?: number;
  minRight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  // leftW は「割合（0〜1）」で保持
  const [leftW, setLeftW] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const ratio = raw ? Number(raw) : 0.6; // 初期値 60%
      return Number.isFinite(ratio) ? ratio : 0.6;
    } catch {
      return 0.6;
    }
  });

  // 永続化
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(leftW));
    } catch {}
  }, [leftW, storageKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerW(rect.width);
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 描画用の左幅（px）を計算してクランプ
  const pxLeft = useMemo(() => {
    const total = containerW || 0;
    const px = Math.round(total * leftW);
    const clamped = Math.max(minLeft, Math.min(px, total - minRight));
    return clamped;
  }, [leftW, minLeft, minRight, containerW]);

  // 比率に戻して state を更新（ドラッグ・キー操作共通）
  const updateFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPx = Math.max(minLeft, Math.min(x, rect.width - minRight));
    setLeftW(clampedPx / rect.width);
  };

  // Pointer Events でのドラッグ開始
  const startPointerDrag: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!containerRef.current) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const onMove = (ev: PointerEvent) => updateFromClientX(ev.clientX);

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };

    const releaseSafe = (ev: PointerEvent) => {
      try {
        (ev.target as HTMLElement | null)?.releasePointerCapture?.(ev.pointerId);
      } catch {}
    };

    const onUp = (ev: PointerEvent) => {
      releaseSafe(ev);
      cleanup();
    };
    const onCancel = (ev: PointerEvent) => {
      releaseSafe(ev);
      cleanup();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  const HANDLE_W = 6; // つまみ幅（px）

  // キーボード操作（左右キーで 2% or 8px）
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const step = Math.max(8, Math.round(rect.width * 0.02)); // 2% or 8px
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setLeftW(Math.max(minLeft, rect.width * leftW - step) / rect.width);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setLeftW(Math.min(rect.width - minRight, rect.width * leftW + step) / rect.width);
    }
  };

  // ARIA 用の値（px ベース）
  const ariaMin = minLeft;
  const ariaMax = Math.max(minLeft, (containerW || 0) - minRight);
  const ariaNow = pxLeft;

  return (
    <div ref={containerRef} className="relative w-full h-full flex overflow-hidden">
      {/* 左ペイン（px 指定で描画） */}
      <div style={{ width: pxLeft }} className="h-full overflow-auto">
        {left}
      </div>

      {/* 仕切りハンドル */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="左右の幅をドラッグで調整"
        aria-valuemin={ariaMin}
        aria-valuemax={ariaMax}
        aria-valuenow={ariaNow}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={startPointerDrag}
        className="shrink-0"
        style={{ width: HANDLE_W }}
      >
        <div
          // 見た目（太めのヒットエリア）
          className="w-full h-full cursor-col-resize hover:bg-gray-300/70 bg-gray-200/70 touch-none select-none transition-colors"
          title="ドラッグまたは左右キーで調整"
        />
      </div>

      {/* 右ペイン（残り幅を使用） */}
      <div style={{ width: `calc(100% - ${pxLeft + HANDLE_W}px)` }} className="h-full overflow-auto">
        {right}
      </div>
    </div>
  );
}
