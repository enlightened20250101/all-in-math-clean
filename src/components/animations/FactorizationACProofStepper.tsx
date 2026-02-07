'use client';

import React, {
  useMemo, useState, useEffect, useRef, useCallback
} from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';

import {
  toRat, texRat, type Rat, simplifyFrac,
  normalizeTeXSigns, texLinearLead,
} from '@/lib/tex/format';

type Props = { a?: number; b?: number; c?: number; initialStep?: number };

// 共通ユーティリティ
const clamp = (x:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, x));
const isZero = (r:Rat)=> simplifyFrac(r.n,r.d).n===0;

// 整数 gcd/lcm
const gcdInt = (x:number,y:number)=>{ x=Math.abs(x); y=Math.abs(y); while(y){ const t=y; y=x%y; x=t; } return x||1; };
const lcmInt = (x:number,y:number)=> (x===0||y===0)?0 : (Math.abs(x)/gcdInt(x,y))*Math.abs(y);

// 分母クリア→共通因子→先頭符号正規化
function scaleToInteger(aR:Rat,bR:Rat,cR:Rat){
  const L = [aR.d,bR.d,cR.d].reduce((acc,d)=> acc===0?d:lcmInt(acc,d), 1);
  const A0 = aR.n*(L/aR.d);
  const B0 = bR.n*(L/bR.d);
  const C0 = cR.n*(L/cR.d);
  const gFront = gcdInt(gcdInt(A0,B0),C0);
  let A = A0/gFront, B = B0/gFront, C = C0/gFront;
  const leadSign = A<0?-1:1;
  A*=leadSign; B*=leadSign; C*=leadSign;
  return { A, B, C, L, gFront, leadSign };
}

// AC法：m+n=B, mn=AC
function findPair(ac:number, b:number): {m:number; n:number} | null {
  const T = Math.abs(ac);
  if (T===0) return { m:b, n:0 };
  for (let d=1; d*d<=T; d++){
    if (T % d) continue;
    const e = T/d;
    if (ac>0){
      if (d+e === Math.abs(b)) return { m: Math.sign(b)*d, n: Math.sign(b)*e };
    }else{
      if ( d - e === b) return { m:d,  n:-e };
      if (-d + e === b) return { m:-d, n: e };
    }
  }
  return null;
}

// 候補列挙（mn=AC）
function listMNpairs(ac:number): Array<{m:number;n:number}> {
  const res: Array<{m:number;n:number}> = [];
  const T = Math.abs(ac);
  if (T===0) return [{m:0,n:0},{m:1,n:0},{m:-1,n:0}];
  for (let d=1; d*d<=T; d++){
    if (T % d) continue;
    const e = T/d;
    if (ac>0){ res.push({m:d,n:e},{m:-d,n:-e}); }
    else     { res.push({m:d,n:-e},{m:-d,n:e}); }
  }
  return res;
}

// 線形因子 TeX
function texLinearFactor(p:Rat, q:Rat){
  const ps = simplifyFrac(p.n,p.d), qs = simplifyFrac(q.n,q.d);
  const neg = ps.n < 0;
  const absP = { n: Math.abs(ps.n), d: ps.d };
  const head = (absP.n===1 && absP.d===1) ? '' : texRat(absP);
  const xpart = `${head}x`;
  const qTerm = qs.n===0 ? '' : (qs.n>0 ? `+ ${texRat(qs)}` : `- ${texRat({n:-qs.n,d:qs.d})}`);
  return normalizeTeXSigns(`(${neg?'-':''}${xpart} ${qTerm})`.replace(/\s+/g,' ').replace('( -','(- '));
}

// 先頭の全体係数
function texGlobalCoef(r:Rat){
  const s = simplifyFrac(r.n, r.d);
  if (s.n===1 && s.d===1)  return '';
  if (s.n===-1 && s.d===1) return '-';
  return texRat(s);
}

/** たすき掛け図（SVG） */
function TasukiDiagram({ p1, q1, p2, q2, b }:{
  p1:number; q1:number; p2:number; q2:number; b:number;
}){
  const d1 = p1*q2, d2 = p2*q1, sum = d1+d2;
  const ok = sum===b;
  return (
    <svg viewBox="0 0 360 180" className="w-full max-w-md block">
      <rect x="20" y="20" width="120" height="50" rx="8" className="fill-white stroke-gray-300" />
      <rect x="20" y="110" width="120" height="50" rx="8" className="fill-white stroke-gray-300" />
      <rect x="220" y="20" width="120" height="50" rx="8" className="fill-white stroke-gray-300" />
      <rect x="220" y="110" width="120" height="50" rx="8" className="fill-white stroke-gray-300" />
      <text x="80" y="50" textAnchor="middle" fontSize="18">{p1}</text>
      <text x="80" y="140" textAnchor="middle" fontSize="18">{p2}</text>
      <text x="280" y="50" textAnchor="middle" fontSize="18">{q1}</text>
      <text x="280" y="140" textAnchor="middle" fontSize="18">{q2}</text>
      <line x1="140" y1="45"  x2="220" y2="135" className="stroke-gray-400" strokeWidth="2"/>
      <line x1="140" y1="135" x2="220" y2="45"  className="stroke-gray-400" strokeWidth="2"/>
      <text x="180" y="90" textAnchor="middle" fontSize="13" fill="#64748b">
        {d1} + {d2} = {sum} {ok ? ' = b ✓' : ` (b=${b})`}
      </text>
    </svg>
  );
}

/* =========================
   Header（モジュールスコープ + memo）
   入力はローカルstate。確定時のみ親に通知
   ========================= */
const Header = React.memo(function Header({
  s0Tex, hydrated, playing, invalid, step,
  onPlay, onStop, onStepFirst, onStepPrev, onStepNext, onStepSlider,
  onCommitABC, headerRef, a, b, c,
}:{
  s0Tex: string;
  hydrated: boolean;
  playing: boolean;
  invalid: boolean;
  step: number;
  onPlay: ()=>void;
  onStop: ()=>void;
  onStepFirst: ()=>void;
  onStepPrev: ()=>void;
  onStepNext: ()=>void;
  onStepSlider: (n:number)=>void;
  onCommitABC: (key:'a'|'b'|'c', val:number|null, raw:string)=>void;
  headerRef: React.RefObject<HTMLDivElement>;
  a:number; b:number; c:number;
}) {

  // 入力文字列のローカル保持
  const [local, setLocal] = useState<{a:string;b:string;c:string}>(()=>({
    a: String(a), b: String(b), c: String(c)
  }));

  // 親の数値が変わったときだけ同期（Enter/blur後など）
  useEffect(()=>{
    setLocal({ a:String(a), b:String(b), c:String(c) });
  }, [a,b,c]);

  const parseLoose = (txt:string): number | null => {
    const t = txt.trim();
    if (t === '' || t === '+' || t === '-') return null;
    const v = Number(t);
    return Number.isFinite(v) ? v : null;
  };

  const commit = useCallback((key:'a'|'b'|'c', raw:string)=>{
    onCommitABC(key, parseLoose(raw), raw);
  },[onCommitABC]);

  return (
    <div
      ref={headerRef}
      className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75"
    >
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {(['a','b','c'] as const).map((key)=>(
            <label key={key} className="text-sm sm:col-span-2">
              <span className="block mb-1 text-gray-600">{key}</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full rounded border px-3 py-2 text-base"
                value={local[key]}
                onChange={(e)=>setLocal(v=>({ ...v, [key]: e.target.value }))}
                onBlur={(e)=>commit(key, e.target.value)}
                onKeyDown={(e)=>{
                  if (e.key === 'Enter') {
                    const t = e.currentTarget;
                    commit(key, t.value);
                    t.blur();
                  }
                }}
                onKeyDownCapture={(e)=>{
                  // 入力中はグローバルホットキーに渡さない（IME/修飾は素通し）
                  // @ts-ignore
                  if (!e.isComposing && !(e.metaKey||e.ctrlKey||e.altKey)) {
                    e.stopPropagation();
                  }
                }}
                onFocus={()=>{
                  // playing のときだけ停止（無駄レンダー回避）
                  if (playing) onStop();
                }}
                autoCorrect="off" autoCapitalize="none" spellCheck={false}
                name={`coef-${key}`} aria-label={`係数 ${key}`}
                style={{ touchAction: 'auto', WebkitUserSelect: 'text' as any, userSelect: 'text' }}
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm flex-1">
            <span className="block mb-1 text-gray-600">ステップ</span>
            <input
              type="range" min={0} max={6} step={1} value={step}
              onChange={e=>onStepSlider(parseInt(e.target.value,10))}
              className="w-full" aria-label="ステップ"
            />
          </label>

          <div className="flex gap-2">
            <button type="button" className="px-2 py-1 rounded border" onClick={onStepFirst}>最初</button>
            <button type="button" className="px-2 py-1 rounded border" onClick={onStepPrev}>戻る</button>

            {/* ▶ 再生 */}
            <button
              type="button"
              className="px-2 py-1 rounded border disabled:opacity-50 inline-flex items-center gap-1"
              onClick={onPlay}
              disabled={playing || invalid || step>=6}
              title="最後まで自動再生"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              アニメ
            </button>

            {/* ■ 停止 */}
            <button
              type="button"
              className="px-2 py-1 rounded border inline-flex items-center gap-1"
              onClick={onStop}
              disabled={!playing}
              title="停止"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              停止
            </button>

            <button
              type="button"
              className="px-2 py-1 rounded border"
              onClick={onStepNext}
              disabled={playing}
              title="一つ進む"
            >
              次へ
            </button>
          </div>
        </div>

        {/* 元の式（常時表示） */}
        <div className="overflow-x-auto">
          <div className="text-[18px] leading-[1.7] pointer-events-none">
            {/* hydrated 前は空白を出して SSR 差異を避ける */}
            {hydrated ? <KaTeXBlock tex={s0Tex}/> : <span>&nbsp;</span>}
          </div>
        </div>
      </div>
    </div>
  );
});

/* =========================
   Flow（モジュールスコープ + memo）
   ========================= */
const Flow = React.memo(function Flow({
  step, A,B,C, ac, g1,g2, m, block,
}:{
  step:number; A:number; B:number; C:number; ac:number;
  g1:number; g2:number; m:number|null;
  block: { s1a:string; s1b:string; s2a:string; s2b:string; s3:string; s4a:string; s4b:string; s5:string; final:string };
}) {
  const mnCandidates = useMemo(()=>listMNpairs(ac).slice(0, 40), [ac]);
  const p1 = g1, q1 = g2, p2 = (A/g1)||A, q2 = m ? (m/g1) : 0;

  return (
    <div className="p-5 lg:p-6 space-y-6" style={{ paddingTop: 'var(--tasuki-header-h, 72px)' }}>
      <p className="text-sm text-gray-600">下では、同じ流れの中で式変形を順に追えます（スクロール学習）。</p>

      {step>=1 && (
        <>
          <h3 className="font-semibold">整数化</h3>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s1a}/></div>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s1b}/></div>
        </>
      )}

      {step>=2 && (
        <>
          <h3 className="font-semibold">AC と 条件</h3>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s2a}/></div>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s2b}/></div>

          <div className="mt-2">
            <TasukiDiagram p1={p1} q1={q1} p2={p2} q2={q2} b={B}/>
            <p className="text-xs text-gray-600 mt-1">
              左が <b>a</b> の因数、右が <b>c</b> の因数。斜めの積の<strong>和</strong>が <b>b</b> になる並べ方を探します。
            </p>
          </div>

          <div>
            <p className="text-sm mt-3 mb-1">候補 (m, n)（mn = AC）</p>
            <div className="flex flex-wrap gap-2">
              {mnCandidates.map(({m:mm,n:nn}, i)=>{
                const hit = (mm+nn===B);
                return (
                  <span key={i} className={`px-2 py-1 rounded border text-sm ${hit?'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium':'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    ({mm}, {nn}) {hit ? '← 和が b' : ''}
                  </span>
                );
              })}
              {!mnCandidates.length && <span className="text-sm text-gray-600">候補が見つかりません。</span>}
            </div>
          </div>
        </>
      )}

      {step>=3 && (
        <>
          <h3 className="font-semibold">b の分割</h3>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s3}/></div>
        </>
      )}

      { step>=4 && (
        <>
          <h3 className="font-semibold">グルーピング</h3>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s4a}/></div>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s4b}/></div>
        </>
      )}

      {step>=5 && (
        <>
          <h3 className="font-semibold">共通因子で括る</h3>
          <div className="overflow-x-auto"><KaTeXBlock tex={block.s5}/></div>
        </>
      )}

      {step>=6 && (
        <>
          <h3 className="font-semibold">完成形</h3>
          <div className="overflow-x-auto">
            <div className="text-[20px] leading-[1.8]">
              <KaTeXBlock tex={block.final}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

/* =======================
   本体コンポーネント
   ======================= */
export default function FactorizationTasuki_StickyTop(p:Props){
  // Hydrationフラグ（SSR差異回避用）
  const [hydrated, setHydrated] = useState(false);
  useEffect(()=>{ setHydrated(true); },[]);

  // 親 state：数値のみ（入力文字列はHeaderのローカルに保持）
  type State = {
    a: number; b: number; c: number;
    step: number;           // 0..6
    playing: boolean;       // 自動再生中か
  };

  const [s,setS] = useState<State>(()=>({
    a: p.a ?? 6, b: p.b ?? 11, c: p.c ?? 3,
    step: clamp(p.initialStep ?? 0, 0, 6),
    playing:false,
  }));

  // ---- 計算系 ----
  const aR = useMemo(()=>toRat(s.a), [s.a]);
  const bR = useMemo(()=>toRat(s.b), [s.b]);
  const cR = useMemo(()=>toRat(s.c), [s.c]);
  const invalid = isZero(aR);

  const scaled = useMemo(()=> scaleToInteger(aR,bR,cR), [aR,bR,cR]);
  const { A,B,C } = scaled;
  const ac = A*C;

  const pair = useMemo(()=> findPair(ac, B), [ac, B]);
  const m = pair?.m ?? null, n = pair?.n ?? null;

  const g1 = useMemo(()=> (pair ? gcdInt(A, m!) : 1), [pair, A, m]);
  const g2 = useMemo(()=> (pair ? gcdInt(n!, C) : 1), [pair, C, n]);

  const factInt = useMemo(() => {
    if (!pair) return null;
    const a1 = A / g1;
    const t1 = m! / g1;
    return { p1:g1, q1:g2, p2:a1, q2:t1 };
  }, [pair, A, g1, g2, m]);

  const globalCoef: Rat = useMemo(
    () => simplifyFrac(scaled.gFront*scaled.leadSign, scaled.L),
    [scaled.gFront, scaled.leadSign, scaled.L]
  );

  const factorsRat: {p1:Rat; q1:Rat; p2:Rat; q2:Rat} | null = useMemo(() => {
    if (!factInt) return null;
    return {
      p1: toRat(factInt.p1), q1: toRat(factInt.q1),
      p2: toRat(factInt.p2), q2: toRat(factInt.q2),
    };
  }, [factInt]);

  // ---- 自動再生エンジン ----
  const rafId = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);
  const STEP_INTERVAL_MS = 900;

  useEffect(()=>{
    if (!s.playing || invalid || s.step >= 6) {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastTs.current = null;
      if (s.playing && s.step >= 6) setS(v=>({ ...v, playing:false }));
      return;
    }

    const loop = (ts:number)=>{
      if (!lastTs.current) lastTs.current = ts;
      const elapsed = ts - lastTs.current;
      if (elapsed >= STEP_INTERVAL_MS) {
        lastTs.current = ts;
        setS(v=>({ ...v, step: clamp(v.step+1,0,6) }));
      }
      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);
    return ()=>{
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = null;
      lastTs.current = null;
    };
  }, [s.playing, s.step, invalid]);

  // ---------- TeX ----------
  const s0Tex = useMemo(()=> normalizeTeXSigns(
    String.raw`\displaystyle ${texLinearLead(
      [{ coeff: toRat(s.a), varName:'x^2' }, { coeff: toRat(s.b), varName:'x' }],
      toRat(s.c)
    )}`
  ), [s.a, s.b, s.c]);

  const block = useMemo(()=>({
    s1a: normalizeTeXSigns(String.raw`
      \text{分母クリア：}\quad
      \displaystyle \frac{1}{${scaled.L}}
      \Big(
        ${texLinearLead(
          [{ coeff: toRat(A*scaled.gFront*scaled.leadSign), varName:'x^2' },
           { coeff: toRat(B*scaled.gFront*scaled.leadSign), varName:'x' }],
          toRat(C*scaled.gFront*scaled.leadSign)
        )}
      \Big)
    `),
    s1b: normalizeTeXSigns(String.raw`
      \text{共通因子と先頭符号の調整：}\quad
      ${texGlobalCoef(globalCoef)}\cdot
      \Big(
        ${texLinearLead(
          [{ coeff: toRat(A), varName:'x^2' }, { coeff: toRat(B), varName:'x' }],
          toRat(C)
        )}
      \Big)
    `),
    s2a: normalizeTeXSigns(String.raw`
      \text{AC を作る：}\quad AC=a\cdot c = ${A}\cdot ${C} = ${ac}
    `),
    s2b: normalizeTeXSigns(String.raw`
      \text{条件：}\quad m+n=${B}\ ,\ \ mn=${ac}
    `),
    s3: pair
      ? normalizeTeXSigns(String.raw`\text{b の分割：}\quad ${B}x = ${pair!.m}x + ${pair!.n}x`)
      : normalizeTeXSigns(String.raw`\text{整数の }(m,n)\text{ は見つからず。}`),
    s4a: pair
      ? normalizeTeXSigns(String.raw`
          \text{グルーピング：}\ \
          ${A}x^2 + ${pair!.m}x\ +\ ${pair!.n}x + ${C}
        `)
      : normalizeTeXSigns(String.raw`\text{—}`),
    s4b: pair
      ? normalizeTeXSigns(String.raw`
          =\ (${g1}x)\big(${(A/g1)}x + ${(pair!.m/g1)}\big)\ +\ (${g2})\big(${(pair!.n/g2)}x + ${(C/g2)}\big)
        `)
      : normalizeTeXSigns(String.raw`\text{—}`),
    s5: pair
      ? normalizeTeXSigns(String.raw`\text{共通因子で括る：}\quad \big(${(A/g1)}x + ${(pair!.m/g1)}\big)\ \text{を共通因子に}`)
      : normalizeTeXSigns(String.raw`\text{—}`),
    final: (pair && factorsRat)
      ? normalizeTeXSigns(String.raw`
          \displaystyle
          ${texGlobalCoef(globalCoef)}\,
          ${texLinearFactor(factorsRat.p1, factorsRat.q1)}\,
          ${texLinearFactor(factorsRat.p2, factorsRat.q2)}
        `)
      : normalizeTeXSigns(String.raw`\text{判別式 } \Delta=b^2-4ac\ \text{で実数解の有無を判定。}`),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [A,B,C,ac,g1,globalCoef,pair,factorsRat,scaled.L,scaled.gFront,scaled.leadSign]);

  // ---------- ヘッダ（sticky） ----------
  const headerRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    if (!headerRef.current) return;
    const ro = new ResizeObserver(([entry])=>{
      const h = Math.ceil(entry.contentRect.height);
      document.documentElement.style.setProperty('--tasuki-header-h', `${h}px`);
    });
    ro.observe(headerRef.current);
    return ()=> ro.disconnect();
  },[]);

  // ---------- ハンドラ群（参照安定化） ----------
  const onPlay       = useCallback(()=> setS(v=>({ ...v, playing:true })), []);
  const onStop       = useCallback(()=> setS(v=> v.playing ? ({ ...v, playing:false }) : v), []);
  const onStepFirst  = useCallback(()=> setS(v=>({ ...v, step:0, playing:false })), []);
  const onStepPrev   = useCallback(()=> setS(v=>({ ...v, step: clamp(v.step-1,0,6), playing:false })), []);
  const onStepNext   = useCallback(()=> setS(v=>({ ...v, step: clamp(v.step+1,0,6), playing:false })), []);
  const onStepSlider = useCallback((n:number)=> setS(v=>({ ...v, step:n, playing:false })), []);

  const onCommitABC = useCallback((key:'a'|'b'|'c', val:number|null, _raw:string)=>{
    setS(v=>{
      if (val === null) return v; // 非数値 → 何もしない（Header側で保持）
      if (v[key] === val && v.step===0 && v.playing===false) return v;
      return { ...v, [key]: val, step:0, playing:false };
    });
  },[]);

  // レイアウト
  return (
    <div className="rounded-2xl border bg-white">
      <Header
        s0Tex={s0Tex}
        hydrated={hydrated}
        playing={s.playing}
        invalid={invalid}
        step={s.step}
        onPlay={onPlay}
        onStop={onStop}
        onStepFirst={onStepFirst}
        onStepPrev={onStepPrev}
        onStepNext={onStepNext}
        onStepSlider={onStepSlider}
        onCommitABC={onCommitABC}
        headerRef={headerRef}
        a={s.a} b={s.b} c={s.c}
      />
      <Flow
        step={s.step}
        A={A} B={B} C={C} ac={ac}
        g1={g1} g2={g2} m={m}
        block={{
          s1a:block.s1a, s1b:block.s1b,
          s2a:block.s2a, s2b:block.s2b,
          s3:block.s3, s4a:block.s4a, s4b:block.s4b,
          s5:block.s5, final:block.final
        }}
      />
    </div>
  );
}
