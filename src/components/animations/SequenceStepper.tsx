// src/components/animations/SequenceStepper.tsx
'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import ExportPngButton from '@/components/graphs/ExportPngButton';
import ExportSvgButton from '@/components/graphs/ExportSvgButton';
import { useRouter, usePathname } from 'next/navigation';
import { useNarration } from '@/hooks/useNarration';

const JXG: any = typeof window !== 'undefined' ? require('jsxgraph') : null;

type SeqKind = 'arithmetic' | 'geometric';
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const MAX_DRAW_MAG = 1e6; // これ超えは描画スキップ（bbox崩壊防止）
const EPS = 1e-12;

const isFiniteNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const texNum = (x: number) => (Number.isFinite(x) ? (x < 0 ? `(${x})` : `${x}`) : '\\text{未定義}');

export default function SequenceStepper() {
  // ===== 基本状態 =====
  const [kind, setKind]   = useState<SeqKind>('arithmetic');
  const [a1, setA1]       = useState<number>(2);
  const [d, setD]         = useState<number>(3);   // 公差
  const [r, setR]         = useState<number>(2);   // 公比
  const [nMax, setNMax]   = useState<number>(10);
  const [n, setN]         = useState<number>(1);   // 現在の項

  // ===== グラフ表示オプション =====
  const [autoFit, setAutoFit]           = useState<boolean>(true);
  const [graphH, setGraphH]             = useState<number>(360); // px
  const [showSticks, setShowSticks]     = useState<boolean>(true);
  const [showPolyline, setShowPolyline] = useState<boolean>(false);

  // ===== 再生制御 =====
  const [playing, setPlaying] = useState(false);
  const playRef = useRef<number | null>(null);
  const [speedMs, setSpeedMs] = useState<number>(900);

  // ===== ナレーション =====
  const [narrationOn, setNarrationOn] = useState<boolean>(false);
  const { speak } = useNarration(narrationOn);

  // ===== URL 同期（共有用） =====
  const router = useRouter();
  const pathname = usePathname();
  const firstLoadRef = useRef(false);

  // 初回：URL -> state
  useEffect(() => {
    if (typeof window === 'undefined' || firstLoadRef.current) return;
    firstLoadRef.current = true;
    const qs = new URLSearchParams(window.location.search);
    const qKind = qs.get('kind');
    if (qKind === 'geometric' || qKind === 'geom') setKind('geometric');
    if (qKind === 'arithmetic' || qKind === 'arith') setKind('arithmetic');

    const num = (k: string, def: number) => {
      const v = qs.get(k); if (v == null) return def;
      const n = Number(v); return Number.isFinite(n) ? n : def;
    };
    setA1(num('a1', 2));
    setD(num('d', 3));
    setR(num('r', 2));
    setNMax(clamp(Math.round(num('nMax', 10)), 1, 200));
    setN(clamp(Math.round(num('n', 1)), 1, 200));
    setGraphH(clamp(Math.round(num('h', 360)), 200, 900));

    const af = qs.get('autoFit'); if (af !== null) setAutoFit(af === '1' || af === 'true');
    const ss = qs.get('sticks');  if (ss !== null) setShowSticks(ss === '1' || ss === 'true');
    const pl = qs.get('poly');    if (pl !== null) setShowPolyline(pl === '1' || pl === 'true');
    const sp = qs.get('speed');   if (sp !== null) { const v = Number(sp); if (Number.isFinite(v)) setSpeedMs(clamp(Math.round(v), 100, 5000)); }
    const narr = qs.get('nar');   if (narr !== null) setNarrationOn(narr === '1' || narr === 'true');
  }, [pathname]);

  // state -> URL
  useEffect(() => {
    if (typeof window === 'undefined' || !firstLoadRef.current) return;
    const qs = new URLSearchParams();
    qs.set('kind', kind === 'geometric' ? 'geom' : 'arith');
    qs.set('a1', String(a1));
    if (kind === 'arithmetic') qs.set('d', String(d));
    if (kind === 'geometric')  qs.set('r', String(r));
    qs.set('nMax', String(nMax));
    qs.set('n', String(n));
    qs.set('h', String(graphH));
    qs.set('autoFit', autoFit ? '1' : '0');
    qs.set('sticks', showSticks ? '1' : '0');
    qs.set('poly', showPolyline ? '1' : '0');
    if (speedMs !== 900) qs.set('speed', String(speedMs));
    if (narrationOn) qs.set('nar', '1');
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
  }, [kind, a1, d, r, nMax, n, autoFit, graphH, showSticks, showPolyline, speedMs, narrationOn, pathname, router]);

  // ===== 入力値サニタイズ（NumInput が空/NaN を渡すケース対策） =====
  const safeSetA1 = (v: number) => setA1(isFiniteNum(v) ? v : 0);
  const safeSetD  = (v: number) => setD(isFiniteNum(v) ? v : 0);
  const safeSetR  = (v: number) => setR(isFiniteNum(v) ? v : 0);
  const safeSetNMax = (v: number) => setNMax(clamp(isFiniteNum(v) ? Math.round(v) : 10, 1, 200));

  // ===== 安全な項の計算（発散・NaNは除外できるよう NaN を返す） =====
  const termAt = useCallback((idx1: number) => {
    if (idx1 < 1) return NaN;
    if (kind === 'arithmetic') {
      const t = a1 + (idx1 - 1) * d;
      return Number.isFinite(t) && Math.abs(t) <= MAX_DRAW_MAG ? t : NaN;
    } else {
      // 幾何：0,1,負、公比すべて許容（ただし巨大値はNaNとして扱いスキップ）
      const t = a1 * Math.pow(r, idx1 - 1);
      return Number.isFinite(t) && Math.abs(t) <= MAX_DRAW_MAG ? t : NaN;
    }
  }, [a1, d, kind, r]);

  const terms = useMemo(() => {
    const res: number[] = [];
    for (let i = 1; i <= nMax; i++) res.push(termAt(i));
    return res;
  }, [nMax, termAt]);

  // 和 S_n（r ≈ 1 は等比の特例に切替）
  const sumN = useMemo(() => {
    if (kind === 'arithmetic') {
      const s = n * 0.5 * (2 * a1 + (n - 1) * d);
      return Number.isFinite(s) ? s : NaN;
    } else {
      if (Math.abs(r - 1) < EPS) {
        const s = a1 * n; // r=1
        return Number.isFinite(s) ? s : NaN;
      }
      const denom = 1 - r;
      if (Math.abs(denom) < EPS) return NaN; // 念のため分母ゼロ回避
      const s = a1 * (1 - Math.pow(r, n)) / denom;
      return Number.isFinite(s) && Math.abs(s) <= MAX_DRAW_MAG ? s : NaN;
    }
  }, [kind, a1, d, r, n]);

  // ===== 再生 =====
  useEffect(() => {
    if (!playing) {
      if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
      return;
    }
    playRef.current = window.setInterval(
      () => setN(prev => (prev < nMax ? prev + 1 : 1)),
      clamp(speedMs, 100, 5000)
    );
    return () => { if (playRef.current) { clearInterval(playRef.current); playRef.current = null; } };
  }, [playing, nMax, speedMs]);

  useEffect(() => { setN(prev => clamp(prev, 1, nMax)); }, [nMax, kind, a1, d, r]);

  // ===== JSXGraph =====
  const domId = useId();
  const boardRef   = useRef<any | null>(null);
  const pointsRef  = useRef<any[]>([]);
  const sticksRef  = useRef<any[]>([]);
  const curveRef   = useRef<any | null>(null);
  const exportWrapRef = useRef<HTMLDivElement | null>(null);

  // init
  useEffect(() => {
    if (typeof window === 'undefined' || !JXG || boardRef.current) return;
    boardRef.current = JXG.JSXGraph.initBoard(domId, {
      boundingbox: [-1, 5, 12, -5],
      axis: true,
      showNavigation: true,
      keepaspectratio: false,
      zoom: { factorX: 1.2, factorY: 1.2, wheel: true },
      pan: { enabled: true }
    });
  }, [domId]);

  // draw/update
  useEffect(() => {
    const brd = boardRef.current as any;
    if (!brd) return;

    // 既存を除去
    for (const p of pointsRef.current) { try { brd.removeObject(p); } catch {} }
    pointsRef.current = [];
    for (const s of sticksRef.current) { try { brd.removeObject(s); } catch {} }
    sticksRef.current = [];
    if (curveRef.current) { try { brd.removeObject(curveRef.current); } catch {} curveRef.current = null; }

    // 有効データに絞る
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < terms.length; i++) {
      const x = i + 1;
      const y = terms[i];
      if (!Number.isFinite(y)) continue; // NaN/Infinity は描画スキップ
      xs.push(x); ys.push(y);
      try {
        const pt = brd.create('point', [x, y], { name: '', size: 2, fixed: true, fillOpacity: 0.9 });
        pointsRef.current.push(pt);
        if (showSticks) {
          const seg = brd.create('segment', [[x, 0], [x, y]], { strokeColor: '#94a3b8', strokeWidth: 1 });
          sticksRef.current.push(seg);
        }
      } catch { /* noop: 失敗したら捨てる */ }
    }

    if (showPolyline && xs.length > 1) {
      try {
        curveRef.current = brd.create('curve', [xs, ys], { strokeWidth: 1.5 });
      } catch { /* noop */ }
    }

    // 自動フィット：有限値のみで bbox を決定。なければ安全な既定値
    if (autoFit) {
      const margin = 1;
      const xMax = Math.max(6, nMax + 1);
      if (ys.length) {
        const yMin = Math.min(-3, Math.min(...ys, 0) - margin);
        const yMax = Math.max(3, Math.max(...ys, 0) + margin);
        brd.setBoundingBox([-1, yMax, xMax, yMin], true);
      } else {
        brd.setBoundingBox([-1, 5, Math.max(6, nMax + 1), -5], true);
      }
    }
    brd.update();
  }, [terms, nMax, autoFit, showSticks, showPolyline]);

  // ハイライト（有効点のみ）
  useEffect(() => {
    const brd = boardRef.current as any;
    if (!brd) return;
    for (const p of pointsRef.current) {
      try { p.setAttribute({ size: 2, fillColor: '#1f2937', strokeColor: '#1f2937' }); } catch {}
    }
    const targetIdx = n - 1;
    // terms 的に無効ならハイライト無し
    if (targetIdx >= 0 && targetIdx < terms.length && Number.isFinite(terms[targetIdx])) {
      const pt = pointsRef.current.find((pp: any) => {
        try { const coords = pp.coords; return Math.round(coords.usrCoords[1]) === n; } catch { return false; }
      }) || pointsRef.current[targetIdx]; // フォールバック
      if (pt) {
        try { pt.setAttribute({ size: 4, fillColor: '#0ea5e9', strokeColor: '#0284c7' }); } catch {}
      }
    }
    brd.update();
  }, [n, nMax, terms]);

  // ナレーション（手動時のみ）
  useEffect(() => {
    if (!narrationOn || playing) return;
    const val = terms[n - 1];
    if (!Number.isFinite(val)) return;
    const msg = kind === 'arithmetic'
      ? `等差数列。エイワンが ${a1}、公差 ディーが ${d}。エヌ が ${n} のとき、エイエヌ は ${val} です。`
      : `等比数列。エイワンが ${a1}、公比 アールが ${r}。エヌ が ${n} のとき、エイエヌ は ${val} です。`;
    speak(msg);
  }, [n, narrationOn, playing, terms, kind, a1, d, r, speak]);

  // ===== 数式（表示も安全に） =====
  const rTex = texNum(r);
  const a1Tex = texNum(a1);
  const dTex = texNum(d);

  const formulaAn = useMemo(() => (
    kind === 'arithmetic'
      ? String.raw`a_n = a_1 + (n-1)d`
      : String.raw`a_n = a_1 \cdot r^{\,n-1}`
  ), [kind]);

  const formulaSn = useMemo(() => (
    kind === 'arithmetic'
      ? String.raw`S_n = \frac{n}{2}\,\bigl(2a_1 + (n-1)d\bigr)`
      : (Math.abs(r - 1) < EPS
          ? String.raw`S_n = n\,a_1`
          : String.raw`S_n = a_1 \,\frac{1 - r^{\,n}}{1-r}`)
  ), [kind, r]);

  const substitutedAn = useMemo(() => (
    kind === 'arithmetic'
      ? String.raw`a_n = ${a1Tex} + (n-1)\cdot ${dTex}`
      : String.raw`a_n = ${a1Tex}\cdot ${rTex}^{\,n-1}`
  ), [kind, a1Tex, dTex, rTex]);

  const substitutedAnAtN = useMemo(() => {
    const val = terms[n - 1];
    return Number.isFinite(val)
      ? String.raw`a_{${n}} = ${+val.toFixed(6)}`
      : String.raw`a_{${n}} = \text{未定義}`;
  }, [terms, n]);

  const substitutedSnAtN = useMemo(() => (
    Number.isFinite(sumN)
      ? String.raw`S_{${n}} = ${+sumN.toFixed(6)}`
      : String.raw`S_{${n}} = \text{未定義}`
  ), [sumN, n]);

  // ===== テーブル =====
  const tableRows = useMemo(() => {
    const rows: Array<{ k: number; ak: number | null; Sk: number | null }> = [];
    for (let k = 1; k <= nMax; k++) {
      const ak = termAt(k);
      let Sk: number;
      if (kind === 'arithmetic') {
        Sk = k * 0.5 * (2 * a1 + (k - 1) * d);
      } else {
        if (Math.abs(r - 1) < EPS) Sk = a1 * k;
        else {
          const denom = 1 - r;
          if (Math.abs(denom) < EPS) Sk = NaN as unknown as number;
          else Sk = a1 * (1 - Math.pow(r, k)) / denom;
        }
      }
      const akOk = Number.isFinite(ak) && Math.abs(ak) <= MAX_DRAW_MAG ? ak : null;
      const SkOk = Number.isFinite(Sk) && Math.abs(Sk) <= MAX_DRAW_MAG ? Sk : null;
      rows.push({ k, ak: akOk, Sk: SkOk });
    }
    return rows;
  }, [nMax, kind, a1, d, r, termAt]);

  // ===== 注意・警告メッセージ =====
  const warnings: string[] = [];
  if (kind === 'geometric' && Math.abs(r - 1) < EPS) warnings.push('r = 1 のときは S_n = n a_1 を使用しています。');
  if (kind === 'geometric' && Math.abs(r) < EPS)    warnings.push('r = 0 のとき a₁, 0, 0, ... となります。');
  const skippedCount = terms.filter(v => !Number.isFinite(v)).length;
  if (skippedCount > 0) warnings.push(`発散または描画範囲外の値を ${skippedCount} 個スキップしています（|値| > ${MAX_DRAW_MAG} など）。`);

  // ===== JSX =====
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">数列（等差・等比）のステッパー</h2>
        <div className="text-sm text-gray-500">0 や 1、負の値でも安全に動作</div>
      </div>

      {/* コントロール */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setKind('arithmetic')}
              className={`px-3 py-1 rounded border transition ${kind === 'arithmetic' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
              等差数列
            </button>
            <button type="button" onClick={() => setKind('geometric')}
              className={`px-3 py-1 rounded border transition ${kind === 'geometric' ? 'bg-gray-900 text-white' : 'bg-white'}`}>
              等比数列
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPlaying(v => !v)}
              className={`px-3 py-1 rounded border transition ${playing ? 'bg-sky-600 text-white' : 'bg-white'}`} title="自動で n を進める">
              {playing ? '⏸︎ 一時停止' : '▶ 再生'}
            </button>
            <button type="button" onClick={() => setN(1)} className="px-3 py-1 rounded border" title="n を 1 に戻す">↺ リセット</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">初項 a₁</span>
            <NumInput value={a1} onChange={safeSetA1} />
          </label>

          {kind === 'arithmetic' ? (
            <label className="text-sm">
              <span className="block mb-1 text-gray-600">公差 d</span>
              <NumInput value={d} onChange={safeSetD} />
            </label>
          ) : (
            <label className="text-sm">
              <span className="block mb-1 text-gray-600">公比 r</span>
              <NumInput value={r} onChange={safeSetR} />
            </label>
          )}

          <label className="text-sm">
            <span className="block mb-1 text-gray-600">最大項 nₘₐₓ</span>
            <NumInput value={nMax} onChange={safeSetNMax} />
          </label>

          <label className="col-span-2 text-sm">
            <span className="block mb-1 text-gray-600">現在の n</span>
            <input type="range" min={1} max={nMax} value={n} onChange={e => setN(parseInt(e.target.value, 10) || 1)} className="w-full" />
            <div className="text-xs text-gray-600 mt-1">n = {n}</div>
          </label>

          <label className="text-sm">
            <span className="block mb-1 text-gray-600">再生スピード(ms)</span>
            <NumInput value={speedMs} onChange={(v) => setSpeedMs(clamp(isFiniteNum(v) ? v : 900, 100, 5000))} />
          </label>
        </div>

        {/* 表示オプション */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <input id="opt-autofit" type="checkbox" checked={autoFit} onChange={e => setAutoFit(e.target.checked)} />
            <label htmlFor="opt-autofit" className="text-sm text-gray-700">グラフ自動フィット</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="opt-sticks" type="checkbox" checked={showSticks} onChange={e => setShowSticks(e.target.checked)} />
            <label htmlFor="opt-sticks" className="text-sm text-gray-700">x軸から棒（スティック）を描く</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="opt-poly" type="checkbox" checked={showPolyline} onChange={e => setShowPolyline(e.target.checked)} />
            <label htmlFor="opt-poly" className="text-sm text-gray-700">点を折れ線で結ぶ</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="opt-narr" type="checkbox" checked={narrationOn} onChange={e => setNarrationOn(e.target.checked)} />
            <label htmlFor="opt-narr" className="text-sm text-gray-700">ナレーション（手動操作時）</label>
          </div>
          <label className="text-sm flex items-center gap-3">
            <span className="text-gray-700">グラフ高さ</span>
            <input type="range" min={220} max={800} value={graphH} onChange={e => setGraphH(parseInt(e.target.value, 10) || 360)} className="w-56" />
            <span className="text-xs text-gray-500 w-10">{graphH}px</span>
          </label>
        </div>

        {/* 注意表示 */}
        {warnings.length > 0 && (
          <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 space-y-1">
            {warnings.map((w, i) => <div key={i}>・{w}</div>)}
          </div>
        )}
      </div>

      {/* 数式カード */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-2">一般項</div>
            <KaTeXBlock tex={formulaAn} />
            <div className="mt-2 text-sm text-gray-500">代入形</div>
            <KaTeXBlock tex={substitutedAn} />
            <div className="mt-2 text-sm text-gray-500">n を入れた値</div>
            <KaTeXBlock tex={substitutedAnAtN} />
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-2">和 Sₙ</div>
            <KaTeXBlock tex={formulaSn} />
            <div className="mt-2 text-sm text-gray-500">n を入れた値</div>
            <KaTeXBlock tex={substitutedSnAtN} />
          </div>
        </div>
      </div>

      {/* 値一覧 */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-gray-500 mb-3">値一覧（1 〜 nₘₐₓ）</div>
        <div className="overflow-x-auto">
          <table className="min-w-[480px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3">n</th>
                <th className="py-2 pr-3">aₙ</th>
                <th className="py-2">Sₙ</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.k} className={row.k === n ? 'bg-sky-50' : ''}>
                  <td className="py-2 pr-3">{row.k}</td>
                  <td className="py-2 pr-3">{row.ak == null ? '—' : +row.ak.toFixed(6)}</td>
                  <td className="py-2">{row.Sk == null ? '—' : +row.Sk.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* グラフ */}
      <div className="rounded-xl border p-2 bg-white">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="text-sm text-gray-500">グラフ</div>
          <div className="flex gap-2">
            <ExportSvgButton targetRef={exportWrapRef} filename="sequence.svg" />
            <ExportPngButton targetRef={exportWrapRef} filename="sequence.png" />
          </div>
        </div>
        <div ref={exportWrapRef}>
          <div id={domId} className="w-full" style={{ height: `${graphH}px` }} />
        </div>
        {!autoFit && (
          <div className="text-xs text-gray-500 mt-2 px-1">
            ヒント：自動フィットをオフにすると、グラフ上でホイールズーム・ドラッグで自在に調整できます
          </div>
        )}
      </div>
    </div>
  );
}
