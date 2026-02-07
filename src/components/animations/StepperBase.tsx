// src/components/animations/StepperBase.tsx
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import ExportPngButton from '@/components/graphs/ExportPngButton';
import ExportSvgButton from '@/components/graphs/ExportSvgButton';
import { useRouter, usePathname } from 'next/navigation';
import { useNarration } from '@/hooks/useNarration';

const JXG: any = typeof window !== 'undefined' ? require('jsxgraph') : null;

export type DrawResult = { xs?: number[]; ys?: number[]; };
type DrawCtx = {
  create: (el: string, args: any[], attrs?: Record<string, any>) => any;
  add: (obj: any) => void;
};

export type StepperBaseProps<S> = {
  title: string;
  state: S;
  setState: (patch: Partial<S>) => void;
  renderControls: (s: S, set: StepperBaseProps<S>['setState']) => React.ReactNode;
  renderFormulas?: (s: S) => React.ReactNode;
  renderTable?: (s: S) => React.ReactNode;
  /** 2Dグラフ(JXG)を描かず、ここで返した要素を下段「グラフ」枠に描画する（3Dなどに） */
  renderGraph?: (s: S) => React.ReactNode;
  draw: (brd: any, s: S, ctx: DrawCtx) => DrawResult | void;
  toQuery?: (s: S) => Record<string, string>;
  fromQuery?: (qs: URLSearchParams) => Partial<S>;
  narrationText?: (s: S) => string | null;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function StepperBase<S>(props: StepperBaseProps<S>) {
  const {
    title, state, setState, renderControls, renderFormulas, renderTable,
    renderGraph, draw, toQuery, fromQuery, narrationText,
  } = props;

  // オプション
  const [graphH, setGraphH] = useState(360);
  const [autoFit, setAutoFit] = useState(true);
  const [narrationOn, setNarrationOn] = useState(false);
  const [squareAspect, setSquareAspect] = useState(false);
  const useCustomGraph = !!renderGraph;

  const { speak } = useNarration(narrationOn);

  // URL同期
  const router = useRouter();
  const pathname = usePathname();
  const firstLoadRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || firstLoadRef.current) return;
    firstLoadRef.current = true;
    const qs = new URLSearchParams(window.location.search);
    const gh = qs.get('h'); if (gh) setGraphH(clamp(Math.round(Number(gh)), 200, 900) || 360);
    const af = qs.get('autoFit'); if (af !== null) setAutoFit(af === '1' || af === 'true');
    const nar = qs.get('nar'); if (nar !== null) setNarrationOn(nar === '1' || nar === 'true');
    const sq = qs.get('sq'); if (sq !== null) setSquareAspect(sq === '1' || sq === 'true');
    if (fromQuery) {
      try {
        const raw = fromQuery(qs) || {} as Partial<S>;
        const patch = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== undefined)) as Partial<S>;
        if (Object.keys(patch).length) setState(patch);
      } catch { /* noop */ }
    }
  }, [pathname, setState, fromQuery]);

  useEffect(() => {
    if (typeof window === 'undefined' || !firstLoadRef.current) return;
    const id = window.setTimeout(() => {
      const qs = new URLSearchParams();
      qs.set('h', String(graphH));
      qs.set('autoFit', autoFit ? '1' : '0');
      qs.set('sq', squareAspect ? '1' : '0');
      if (narrationOn) qs.set('nar', '1');
      if (toQuery) Object.entries(toQuery(state) || {}).forEach(([k, v]) => qs.set(k, v));
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    }, 120); // 軽いデバウンス
    return () => window.clearTimeout(id);
  }, [graphH, autoFit, squareAspect, narrationOn, state, pathname, router, toQuery]);

  // ナレーション
  const narrTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!narrationOn || !narrationText) return;
    if (narrTimer.current) window.clearTimeout(narrTimer.current);
    narrTimer.current = window.setTimeout(() => {
      const msg = narrationText(state);
      if (msg) speak(msg);
    }, 300);
    return () => { if (narrTimer.current) window.clearTimeout(narrTimer.current); };
  }, [state, narrationOn, narrationText, speak]);

  // ====== JXG 準備 ======
  const domId = useId();
  const boardRef = useRef<any | null>(null);
  const createdRef = useRef<any[]>([]);
  const exportWrapRef = useRef<HTMLDivElement | null>(null);
  const lastFitRef = useRef<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });
  const [viewNonce, setViewNonce] = useState(0);
  const prevBBRef = useRef<[number, number, number, number] | null>(null);
  const hookedRef = useRef(false);

  // 初期化
  useEffect(() => {
    if (useCustomGraph) return; // カスタムグラフ時はJXGを作らない
    if (typeof window === 'undefined' || !JXG || boardRef.current) return;
    boardRef.current = JXG.JSXGraph.initBoard(domId, {
      boundingbox: [-5, 5, 5, -5],
      axis: true,
      showNavigation: true,
      keepaspectratio: squareAspect,
      zoom: { factorX: 1.2, factorY: 1.2, wheel: true },
      pan: { enabled: true },
    });
  }, [domId, useCustomGraph, squareAspect]);

  // keepaspectratio の動的変更
  useEffect(() => {
    if (useCustomGraph) return;
    const brd = boardRef.current as any;
    if (!brd) return;
    try { brd.setAttribute({ keepaspectratio: squareAspect }); } catch {}
    brd.update && brd.update();
  }, [squareAspect, useCustomGraph]);

  // ズーム・パン → AutoFit OFF & 再描画
  useEffect(() => {
    if (useCustomGraph) return;
    const brd = boardRef.current as any;
    if (!brd || hookedRef.current) return;
    const el: HTMLElement | null = brd?.containerObj ?? null;
    if (!el) return;
    const bump = () => setViewNonce(n => n + 1);
    const turnOffAutoFit = () => setAutoFit(false);
    const onWheel = () => { turnOffAutoFit(); bump(); };
    let dragging = false;
    const onPointerDown = () => { turnOffAutoFit(); dragging = true; };
    const onPointerUp   = () => { if (dragging) { dragging = false; bump(); } };
    const onMouseDown   = () => { turnOffAutoFit(); dragging = true; };
    const onMouseUp     = () => { if (dragging) { dragging = false; bump(); } };
    const onTouchStart  = () => { turnOffAutoFit(); };
    const onTouchEnd    = () => { bump(); };
    el.addEventListener('wheel', onWheel, { passive: true });
    el.addEventListener('pointerdown', onPointerDown, { passive: true });
    el.addEventListener('pointerup', onPointerUp, { passive: true });
    el.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    hookedRef.current = true;
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      hookedRef.current = false;
    };
  }, [useCustomGraph]);

  // bbox 監視
  useEffect(() => {
    if (useCustomGraph) return;
    const brd = boardRef.current as any;
    if (!brd) return;
    const id = window.setInterval(() => {
      try {
        const bb = brd.getBoundingBox?.();
        if (!bb) return;
        const prev = prevBBRef.current;
        if (
          !prev ||
          Math.abs(bb[0] - prev[0]) > 1e-9 ||
          Math.abs(bb[1] - prev[1]) > 1e-9 ||
          Math.abs(bb[2] - prev[2]) > 1e-9 ||
          Math.abs(bb[3] - prev[3]) > 1e-9
        ) {
          prevBBRef.current = [bb[0], bb[1], bb[2], bb[3]];
          setViewNonce(n => n + 1);
        }
      } catch {}
    }, 200);
    return () => window.clearInterval(id);
  }, [useCustomGraph]);

  // 手動フィット
  const doFitNow = () => {
    if (useCustomGraph) return; // カスタム表示時は意味がないので無効
    const brd = boardRef.current as any;
    if (!brd) return;
    const xs = (lastFitRef.current.xs || []).filter(Number.isFinite) as number[];
    const ys = (lastFitRef.current.ys || []).filter(Number.isFinite) as number[];
    if (xs.length < 2 || ys.length < 2) return;
    let xmin = Math.min(...xs), xmax = Math.max(...xs);
    let ymin = Math.min(...ys), ymax = Math.max(...ys);
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin === xmax) { xmin -= 1; xmax += 1; }
    if (!Number.isFinite(ymin) || !Number.isFinite(ymax) || ymin === ymax) { ymin -= 1; ymax += 1; }
    const xm = (xmax - xmin) * 0.12 || 1, ym = (ymax - ymin) * 0.12 || 1;
    brd.setBoundingBox([xmin - xm, ymax + ym, xmax + xm, ymin - ym], true);
    brd.update();
  };

  // 描画（2D: JXG / 3D: スキップして renderGraph に委ねる）
  useEffect(() => {
    if (useCustomGraph) return; // 3Dなどカスタム描画時はJXG描画をしない
    const brd = boardRef.current as any;
    if (!brd) return;

    // cleanup
    for (const o of createdRef.current) { try { brd.removeObject(o); } catch {} }
    createdRef.current = [];

    const ctx: DrawCtx = {
      create: (el, args, attrs = {}) => {
        try { const obj = brd.create(el, args, attrs); createdRef.current.push(obj); return obj; }
        catch { return null; }
      },
      add: (obj) => { if (obj) createdRef.current.push(obj); },
    };

    let res: DrawResult | void;
    try { res = draw(brd, state, ctx); } catch { res = undefined; }

    const xsKeep = (res?.xs ?? []).filter(Number.isFinite) as number[];
    const ysKeep = (res?.ys ?? []).filter(Number.isFinite) as number[];
    lastFitRef.current = { xs: xsKeep, ys: ysKeep };

    if (autoFit) {
      if (xsKeep.length >= 2 && ysKeep.length >= 2) {
        let xmin = Math.min(...xsKeep), xmax = Math.max(...xsKeep);
        let ymin = Math.min(...ysKeep), ymax = Math.max(...ysKeep);
        // 不正/退化対策
        if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin === xmax) { xmin -= 1; xmax += 1; }
        if (!Number.isFinite(ymin) || !Number.isFinite(ymax) || ymin === ymax) { ymin -= 1; ymax += 1; }
        
        // 直近の表示枠（現在のボード枠）
        const bbNow = brd.getBoundingBox?.(); // [xmin, ymax, xmax, ymin]
        if (bbNow && Array.isArray(bbNow) && bbNow.length === 4) {
          const eps = 1e-9;
          const contentTouchesEdges =
            (Math.abs(xmin - bbNow[0]) < eps && Math.abs(xmax - bbNow[2]) < eps) ||
            (Math.abs(ymax - bbNow[1]) < eps && Math.abs(ymin - bbNow[3]) < eps);
          // 「コンテンツの左右/上下が現在枠にぴったり一致」→ これ以上の拡張はしない
          if (contentTouchesEdges) {
            // 何もせず維持（拡張し続ける現象を停止）
          } else {
            const xm = (xmax - xmin) * 0.12 || 1;
            const ym = (ymax - ymin) * 0.12 || 1;
            brd.setBoundingBox([xmin - xm, ymax + ym, xmax + xm, ymin - ym], true);
          }
        } else {
          const xm = (xmax - xmin) * 0.12 || 1;
          const ym = (ymax - ymin) * 0.12 || 1;
          brd.setBoundingBox([xmin - xm, ymax + ym, xmax + xm, ymin - ym], true);
        }
      } else {
        brd.setBoundingBox([-5, 5, 5, -5], true);
      }
    }
    brd.update();
  }, [state, draw, autoFit, viewNonce, useCustomGraph]);

  return (
    <div className="space-y-6">
      {/* ヘッダ */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-sm text-gray-500">AutoFit / 共有URL / Export / Narration</div>
      </div>

      {/* 上段：操作＆数式 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 左：操作 */}
        <div className="rounded-xl border p-4 bg-white">
          {renderControls(state, setState)}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2 items-start">
            {!useCustomGraph && (
              <label className="text-sm flex items-center gap-3">
                <input type="checkbox" checked={autoFit} onChange={(e)=>setAutoFit(e.target.checked)} />
                <span className="text-gray-700">グラフ自動フィット</span>
              </label>
            )}
            <label className="text-sm flex items-center gap-3">
              <input type="checkbox" checked={narrationOn} onChange={(e)=>setNarrationOn(e.target.checked)} />
              <span className="text-gray-700">ナレーションON</span>
            </label>
            <label className="text-sm flex items-center gap-3">
              <input type="checkbox" checked={squareAspect} onChange={(e)=>setSquareAspect(e.target.checked)} />
              <span className="text-gray-700">正方形比率（1:1）</span>
            </label>
            {!squareAspect && (
              <div className="text-sm md:col-span-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">高さ</span>
                  <input
                    type="range" min={220} max={800} value={graphH}
                    onChange={(e)=>setGraphH(parseInt(e.target.value,10)||360)}
                    className="w-full max-w-sm"
                  />
                  <span className="text-xs text-gray-500">{graphH}px</span>
                </div>
              </div>
            )}
            {!useCustomGraph && (
              <div className="text-right md:col-span-3">
                <button
                  type="button"
                  onClick={doFitNow}
                  className="mt-2 inline-flex items-center gap-2 rounded border px-3 py-1 text-sm hover:bg-gray-50"
                  title="現在のデータ範囲にフィット"
                >
                  ⤢ 今すぐフィット
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右：数式 */}
        <div className="rounded-xl border p-4 bg-white">
          {renderFormulas?.(state)}
        </div>
      </div>

      {/* 任意の表（ある場合） */}
      {renderTable && (
        <div className="rounded-xl border p-4 bg-white">
          {renderTable(state)}
        </div>
      )}

      {/* 下段：グラフ（2D:JXG / 3D:カスタム） */}
      <div className="rounded-xl border p-2 bg-white">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-sm text-gray-500">グラフ</div>
          <div className="flex gap-2">
            {!useCustomGraph && (
              <>
                <ExportSvgButton targetRef={exportWrapRef} filename="figure.svg" />
                <ExportPngButton targetRef={exportWrapRef} filename="figure.png" />
              </>
            )}
          </div>
        </div>
        <div ref={exportWrapRef}>
          {useCustomGraph ? (
            // カスタム描画（3Dなど）を下段にそのまま表示
            <div
              className="w-full"
              style={squareAspect ? undefined : { height: `${graphH}px` }}
            >
              {renderGraph!(state)}
            </div>
          ) : (
            // 2Dグラフ（JXG）
            <div
              id={domId}
              className={`w-full ${squareAspect ? 'aspect-square' : ''}`}
              style={squareAspect ? undefined : { height: `${graphH}px` }}
            />
          )}
        </div>
        {!useCustomGraph && !autoFit && (
          <div className="text-xs text-gray-500 mt-2 px-1">
            ヒント：ホイールでズーム、ドラッグでパン
          </div>
        )}
      </div>
    </div>
  );
}
