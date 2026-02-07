'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import { toRat, texRat, type Rat, simplifyFrac, normalizeTeXSigns } from '@/lib/tex/format';

// ========= 共通ユーティリティ =========
const clamp = (x:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, x));
const gcdInt = (x:number,y:number)=>{ x=Math.abs(x); y=Math.abs(y); while(y){ const t=y; y=x%y; x=t; } return x||1; };
const isZero = (r:Rat)=> simplifyFrac(r.n,r.d).n===0;

// 線形因子 (p x + q) TeX（p=±1 は省略、-は中に）
function texLinearFactor(p:Rat, q:Rat){
  const ps = simplifyFrac(p.n,p.d), qs = simplifyFrac(q.n,q.d);
  const neg = ps.n < 0;
  const absP = { n: Math.abs(ps.n), d: ps.d };
  const head = (absP.n===1 && absP.d===1) ? '' : texRat(absP);
  const xpart = `${head}x`;
  const qTerm = qs.n===0 ? '' : (qs.n>0 ? `+ ${texRat(qs)}` : `- ${texRat({n:-qs.n,d:qs.d})}`);
  return normalizeTeXSigns(`(${neg?'-':''}${xpart} ${qTerm})`.replace(/\s+/g,' ').replace('( -','(- '));
}

// 先頭の全体係数（±1省略、-1は「-」だけ）
function texGlobalCoef(r:Rat){
  const s = simplifyFrac(r.n, r.d);
  if (s.n===1 && s.d===1)  return '';
  if (s.n===-1 && s.d===1) return '-';
  return texRat(s);
}

/* =========================
   Header（モジュールスコープ + memo）
========================= */
const Header = React.memo(function Header({
  s0Tex, hydrated, playing, step,
  onPlay, onStop, onStepFirst, onStepPrev, onStepNext, onStepSlider,
  onCommit, headerRef, p1, q1, p2, q2,
}:{
  s0Tex:string; hydrated:boolean; playing:boolean; step:number;
  onPlay:()=>void; onStop:()=>void; onStepFirst:()=>void; onStepPrev:()=>void; onStepNext:()=>void; onStepSlider:(n:number)=>void;
  onCommit:(key:'p1'|'q1'|'p2'|'q2', val:number|null, raw:string)=>void;
  headerRef: React.RefObject<HTMLDivElement>;
  p1:number; q1:number; p2:number; q2:number;
}) {

  const [local, setLocal] = useState({ p1:String(p1), q1:String(q1), p2:String(p2), q2:String(q2) });

  useEffect(()=>{ setLocal({ p1:String(p1), q1:String(q1), p2:String(p2), q2:String(q2) }); }, [p1,q1,p2,q2]);

  const parseLoose = (t:string)=> {
    const s=t.trim(); if (s===''||s==='+'||s==='-') return null;
    const v=Number(s); return Number.isFinite(v)?v:null;
  };
  const commit = useCallback((key:'p1'|'q1'|'p2'|'q2', raw:string)=> onCommit(key, parseLoose(raw), raw), [onCommit]);

  return (
    <div ref={headerRef} className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
          {(['p1','q1','p2','q2'] as const).map((key)=>(
            <label key={key} className="text-sm sm:col-span-2">
              <span className="block mb-1 text-gray-600">{key}</span>
              <input
                type="text" inputMode="decimal" className="w-full rounded border px-3 py-2 text-base"
                value={local[key]} onChange={e=>setLocal(v=>({...v,[key]:e.target.value}))}
                onBlur={e=>commit(key, e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ const t=e.currentTarget; commit(key, t.value); t.blur(); }}}
                onKeyDownCapture={(e)=>{ // hotkey遮断
                  // @ts-ignore
                  if (!e.isComposing && !(e.metaKey||e.ctrlKey||e.altKey)) e.stopPropagation();
                }}
                onFocus={()=>{ if(playing) onStop(); }}
                autoCorrect="off" autoCapitalize="none" spellCheck={false}
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm flex-1">
            <span className="block mb-1 text-gray-600">ステップ</span>
            <input type="range" min={0} max={4} step={1} value={step} onChange={e=>onStepSlider(parseInt(e.target.value,10))} className="w-full" />
          </label>

          <div className="flex gap-2">
            <button className="px-2 py-1 rounded border" onClick={onStepFirst}>最初</button>
            <button className="px-2 py-1 rounded border" onClick={onStepPrev}>戻る</button>
            <button className="px-2 py-1 rounded border disabled:opacity-50" onClick={onPlay} disabled={playing || step>=4}>
              ▶ アニメ
            </button>
            <button className="px-2 py-1 rounded border" onClick={onStop} disabled={!playing}>■ 停止</button>
            <button className="px-2 py-1 rounded border" onClick={onStepNext} disabled={playing}>次へ</button>
          </div>
        </div>

        {/* 元の式（常時表示） */}
        <div className="overflow-x-auto">
          <div className="text-[18px] leading-[1.7] pointer-events-none">{hydrated ? <KaTeXBlock tex={s0Tex}/> : <span>&nbsp;</span>}</div>
        </div>
      </div>
    </div>
  );
});

/* =========================
   Flow（モジュールスコープ + memo）
========================= */
const Flow = React.memo(function Flow({
  step, p1,q1,p2,q2, block,
}:{
  step:number; p1:number; q1:number; p2:number; q2:number;
  block:{ s1:string; s2:string; s3:string; final:string };
}) {
  return (
    <div className="p-5 lg:p-6 space-y-6" style={{ paddingTop:'var(--sticky-h,72px)' }}>
      <p className="text-sm text-gray-600">平方差の公式を、一般の一次式 <b>L₁=p₁x+q₁</b>, <b>L₂=p₂x+q₂</b> に拡張して因数分解します。</p>

      {step>=1 && (<><h3 className="font-semibold">定義</h3><div className="overflow-x-auto"><KaTeXBlock tex={block.s1}/></div></>)}
      {step>=2 && (<><h3 className="font-semibold">公式の適用</h3><div className="overflow-x-auto"><KaTeXBlock tex={block.s2}/></div></>)}
      {step>=3 && (<><h3 className="font-semibold">整理</h3><div className="overflow-x-auto"><KaTeXBlock tex={block.s3}/></div></>)}
      {step>=4 && (<>
        <h3 className="font-semibold">完成形</h3>
        <div className="overflow-x-auto"><div className="text-[20px] leading-[1.8]"><KaTeXBlock tex={block.final}/></div></div>
      </>)}
    </div>
  );
});

/* =======================
   本体
======================= */
export default function DiffSquares_StickyTop(){
  const [hydrated, setHydrated] = useState(false);
  useEffect(()=>{ setHydrated(true); },[]);

  type S = { p1:number; q1:number; p2:number; q2:number; step:number; playing:boolean };
  const [s,setS] = useState<S>({ p1:2, q1:1, p2:1, q2:-3, step:0, playing:false });

  // 入力 → Rat
  const P1 = useMemo(()=>toRat(s.p1), [s.p1]);
  const Q1 = useMemo(()=>toRat(s.q1), [s.q1]);
  const P2 = useMemo(()=>toRat(s.p2), [s.p2]);
  const Q2 = useMemo(()=>toRat(s.q2), [s.q2]);

  // 自動再生
  const rafId = useRef<number|null>(null);
  const lastTs = useRef<number|null>(null);
  useEffect(()=>{
    if (!s.playing || s.step>=4){
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null; lastTs.current=null;
      if (s.playing && s.step>=4) setS(v=>({...v, playing:false}));
      return;
    }
    const dur=900;
    const loop=(ts:number)=>{
      if (!lastTs.current) lastTs.current=ts;
      if (ts-lastTs.current>=dur){ lastTs.current=ts; setS(v=>({...v, step: clamp(v.step+1,0,4)})); }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
    return ()=>{ if(rafId.current) cancelAnimationFrame(rafId.current); rafId.current=null; lastTs.current=null; };
  },[s.playing, s.step]);

  // 先頭係数（必要なら共通因子で前へ）
  const gFront = useMemo(()=> gcdInt(P1.n*Q2.d, P2.n*Q1.d), [P1,P2,Q1,Q2]); // 粗いが十分
  const global = useMemo<Rat>(()=> simplifyFrac(1,1), []); // 平方差は全体係数は基本 1

  // ベース式
  const L1 = texLinearFactor(P1,Q1), L2 = texLinearFactor(P2,Q2);
  const s0Tex = useMemo(()=> normalizeTeXSigns(String.raw`\displaystyle ${L1}^{2} - ${L2}^{2}`), [L1,L2]);

  // ステップ式
  const block = useMemo(()=>({
    s1: normalizeTeXSigns(String.raw`
      \text{平方差の公式：}\ a^2-b^2=(a-b)(a+b)\quad\Rightarrow\quad
      (L_1)^2-(L_2)^2=(L_1-L_2)(L_1+L_2)
    `),
    s2: normalizeTeXSigns(String.raw`
      \text{いま }L_1=${L1},\ L_2=${L2}\ \Rightarrow\ (L_1-L_2)=${texLinearFactor(
        {n:P1.n*P2.d-P2.n*P1.d,d:P1.d*P2.d}, {n:Q1.n*Q2.d-Q2.n*Q1.d,d:Q1.d*Q2.d}
      )}\ ,\ (L_1+L_2)=${texLinearFactor(
        {n:P1.n*P2.d+P2.n*P1.d,d:P1.d*P2.d}, {n:Q1.n*Q2.d+Q2.n*Q1.d,d:Q1.d*Q2.d}
      )}
    `),
    s3: normalizeTeXSigns(String.raw`\text{整理：}\ (L_1-L_2)(L_1+L_2)`),
    final: normalizeTeXSigns(String.raw`
      \displaystyle
      ${texGlobalCoef(global)}\,${texLinearFactor(
        {n:P1.n*P2.d-P2.n*P1.d,d:P1.d*P2.d}, {n:Q1.n*Q2.d-Q2.n*Q1.d,d:Q1.d*Q2.d}
      )}\,${texLinearFactor(
        {n:P1.n*P2.d+P2.n*P1.d,d:P1.d*P2.d}, {n:Q1.n*Q2.d+Q2.n*Q1.d,d:Q1.d*Q2.d}
      )}
    `),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [L1,L2,P1,P2,Q1,Q2]);

  // sticky 高さ vcss 連携
  const headerRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{
    if (!headerRef.current) return;
    const ro = new ResizeObserver(([en])=>{
      document.documentElement.style.setProperty('--sticky-h', `${Math.ceil(en.contentRect.height)}px`);
    });
    ro.observe(headerRef.current); return ()=>ro.disconnect();
  },[]);

  // ハンドラ
  const onPlay       = useCallback(()=> setS(v=>({ ...v, playing:true })), []);
  const onStop       = useCallback(()=> setS(v=> v.playing ? ({ ...v, playing:false }) : v), []);
  const onStepFirst  = useCallback(()=> setS(v=>({ ...v, step:0, playing:false })), []);
  const onStepPrev   = useCallback(()=> setS(v=>({ ...v, step: clamp(v.step-1,0,4), playing:false })), []);
  const onStepNext   = useCallback(()=> setS(v=>({ ...v, step: clamp(v.step+1,0,4), playing:false })), []);
  const onStepSlider = useCallback((n:number)=> setS(v=>({ ...v, step:n, playing:false })), []);
  const onCommit     = useCallback((key:'p1'|'q1'|'p2'|'q2', val:number|null)=> {
    setS(v=> (val===null ? v : ({ ...v, [key]:val, step:0, playing:false })));
  },[]);

  return (
    <div className="rounded-2xl border bg-white">
      <Header
        s0Tex={s0Tex}
        hydrated={hydrated}
        playing={s.playing}
        step={s.step}
        onPlay={onPlay} onStop={onStop}
        onStepFirst={onStepFirst} onStepPrev={onStepPrev} onStepNext={onStepNext} onStepSlider={onStepSlider}
        onCommit={onCommit} headerRef={headerRef}
        p1={s.p1} q1={s.q1} p2={s.p2} q2={s.q2}
      />
      <Flow step={s.step} p1={s.p1} q1={s.q1} p2={s.p2} q2={s.q2} block={block}/>
    </div>
  );
}
