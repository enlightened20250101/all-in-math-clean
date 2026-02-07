'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import { toRat, texRat, type Rat, simplifyFrac, normalizeTeXSigns } from '@/lib/tex/format';

const clamp = (x:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, x));
const gcdInt = (a:number,b:number)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a||1; };
const isZero = (r:Rat)=> simplifyFrac(r.n,r.d).n===0;

// 係数（先頭/中間）
const texCoeffLead = (r:Rat)=>{
  const s=simplifyFrac(r.n,r.d); if (s.n===0) return '0';
  if (s.n===1 && s.d===1) return '1';
  if (s.n===-1 && s.d===1) return '-1';
  return texRat(s);
};
const texCoeffMid = (r:Rat)=>{
  const s=simplifyFrac(r.n,r.d); if (s.n===0) return '';
  const sign = s.n>0?'+ ':'- ';
  const abs = texRat({n:Math.abs(s.n),d:s.d});
  return `${sign}${abs}`;
};
// 単項 a x^k（先頭/中間）
const monoLead = (a:Rat,k:number)=>{
  const as = simplifyFrac(a.n,a.d);
  if (as.n===0) return '';
  const abs1=(Math.abs(as.n)===1 && as.d===1);
  const mag = abs1? '' : texRat({n:Math.abs(as.n),d:as.d});
  const sgn = as.n<0?'- ':'';
  return normalizeTeXSigns(`${sgn}${mag}${k===0?'':k===1?'x':`x^{${k}}`}`.trim());
};
const monoMid  = (a:Rat,k:number)=>{
  const as=simplifyFrac(a.n,a.d);
  if (as.n===0) return '';
  const sign = as.n>0?'+ ':'- ';
  const abs1=(Math.abs(as.n)===1 && as.d===1);
  const mag  = abs1? '' : texRat({n:Math.abs(as.n),d:as.d});
  return normalizeTeXSigns(`${sign}${mag}${k===0?'':k===1?'x':`x^{${k}}`}`.trim());
};

type S = {
  A1:number; e1:number; A2:number; e2:number; A3:number; e3:number;
  step:number; playing:boolean;
};

const CommonFactorHeader = React.memo(function CommonFactorHeader({
  s,
  setS,
  hydrated,
  original,
}: {
  s: S;
  setS: React.Dispatch<React.SetStateAction<S>>;
  hydrated: boolean;
  original: string;
}) {
  const [local,setLocal] = useState({ A1:String(s.A1), e1:String(s.e1), A2:String(s.A2), e2:String(s.e2), A3:String(s.A3), e3:String(s.e3) });
  useEffect(()=>{ setLocal({ A1:String(s.A1), e1:String(s.e1), A2:String(s.A2), e2:String(s.e2), A3:String(s.A3), e3:String(s.e3) }); }, [s.A1, s.A2, s.A3, s.e1, s.e2, s.e3]);

  const parseIntLoose=(t:string)=>{ const u=t.trim(); if(u===''||u==='+'||u==='-') return null; const v=Number(u); return Number.isFinite(v)?Math.trunc(v):null; };
  const commit=(k:keyof typeof local, raw:string)=> setS(v=>{
    const val = parseIntLoose(raw); if (val===null) return v;
    return {...v, [k]: val, step:0, playing:false} as S;
  });

  return (
    <div className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {(['A1','e1','A2','e2','A3','e3'] as const).map((key)=>(
            <label key={key} className="text-sm">
              <span className="block mb-1 text-gray-600">{key}</span>
              <input
                type="text" inputMode="decimal" className="w-full rounded border px-3 py-2 text-base"
                value={local[key]} onChange={e=>setLocal(v=>({...v,[key]:e.target.value}))}
                onBlur={e=>commit(key,e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ const t=e.currentTarget; commit(key,t.value); t.blur(); }}}
                onKeyDownCapture={(e)=>{ /* ホットキー遮断 */ // @ts-ignore
                  if(!e.isComposing && !(e.metaKey||e.ctrlKey||e.altKey)) e.stopPropagation();
                }}
                onFocus={()=>{ if(s.playing) setS(v=>({...v, playing:false })); }}
                autoCorrect="off" autoCapitalize="none" spellCheck={false}
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm flex-1">
            <span className="block mb-1 text-gray-600">ステップ</span>
            <input type="range" min={0} max={3} step={1} value={s.step} onChange={e=>setS(v=>({...v, step:parseInt(e.target.value,10), playing:false}))} className="w-full"/>
          </label>
          <div className="flex gap-2">
            <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:0, playing:false}))}>最初</button>
            <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:clamp(v.step-1,0,3), playing:false}))}>戻る</button>
            <button className="px-2 py-1 rounded border disabled:opacity-50" onClick={()=>setS(v=>({...v, playing:true}))} disabled={s.playing || s.step>=3}>▶ アニメ</button>
            <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, playing:false}))} disabled={!s.playing}>■ 停止</button>
            <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:clamp(v.step+1,0,3), playing:false}))} disabled={s.playing}>次へ</button>
          </div>
        </div>

        {/* 元の式（常時） */}
        <div className="overflow-x-auto">
          <div className="text-[18px] leading-[1.7] pointer-events-none">
            {hydrated ? <KaTeXBlock tex={original}/> : <span>&nbsp;</span>}
          </div>
        </div>
      </div>
    </div>
  );
});

export default function CommonFactor_StickyTop(){
  // StickyヘッダのSSR差異を避ける
  const [hydrated,setHydrated]=useState(false); useEffect(()=>{ setHydrated(true); },[]);

  const [s,setS]=useState<S>({ A1:12, e1:5, A2:18, e2:3, A3:-6, e3:1, step:0, playing:false });

  // Rat化
  const rA1 = useMemo(()=>toRat(s.A1), [s.A1]);
  const rA2 = useMemo(()=>toRat(s.A2), [s.A2]);
  const rA3 = useMemo(()=>toRat(s.A3), [s.A3]);

  // GCF（係数と指数）
  const gCoeff = useMemo(()=> gcdInt(gcdInt(s.A1,s.A2), s.A3) , [s.A1,s.A2,s.A3]);
  const minExp = useMemo(()=> Math.min(s.e1,s.e2,s.e3), [s.e1,s.e2,s.e3]);

  // くくった後の係数（整数除算想定でOK）
  const A1p = useMemo(()=> toRat(s.A1 / gCoeff), [s.A1,gCoeff]);
  const A2p = useMemo(()=> toRat(s.A2 / gCoeff), [s.A2,gCoeff]);
  const A3p = useMemo(()=> toRat(s.A3 / gCoeff), [s.A3,gCoeff]);
  const e1p = useMemo(()=> s.e1 - minExp, [s.e1,minExp]);
  const e2p = useMemo(()=> s.e2 - minExp, [s.e2,minExp]);
  const e3p = useMemo(()=> s.e3 - minExp, [s.e3,minExp]);

  // 元の式（常時表示）
  const original = useMemo(()=>{
    const t1 = monoLead(rA1, s.e1);
    const t2 = monoMid (rA2, s.e2);
    const t3 = monoMid (rA3, s.e3);
    return normalizeTeXSigns(String.raw`\displaystyle ${t1} ${t2} ${t3}`);
  }, [rA1,rA2,rA3,s.e1,s.e2,s.e3]);

  // 各ステップの数式
  const block = useMemo(()=>{
    const gStr   = String(gCoeff);
    const mStr   = minExp===0 ? '' : (minExp===1?'x':`x^{${minExp}}`);
    const head   = `${gStr}${mStr?` ${mStr}`:''}`;
    const inside = [ monoLead(A1p,e1p), monoMid(A2p,e2p), monoMid(A3p,e3p) ].filter(Boolean).join(' ');
    return {
      s1: normalizeTeXSigns(String.raw`\text{係数の最大公約数 }g=\gcd(|${s.A1}|,|${s.A2}|,|${s.A3}|)=${gCoeff}`),
      s2: normalizeTeXSigns(String.raw`\text{指数の最小 }m=\min(${s.e1},${s.e2},${s.e3})=${minExp}`),
      s3: normalizeTeXSigns(String.raw`\text{共通因数でくくる：}\quad ${head}\,\Big( ${inside} \Big)`),
      final: normalizeTeXSigns(String.raw`\displaystyle ${head}\,\Big( ${inside} \Big)`),
    };
  }, [gCoeff,minExp,A1p,A2p,A3p,e1p,e2p,e3p,s.A1,s.A2,s.A3,s.e1,s.e2,s.e3]);

  // 自動再生
  const raf = useRef<number|null>(null), last = useRef<number|null>(null);
  useEffect(()=>{
    if (!s.playing || s.step>=3){
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current=null; last.current=null;
      if (s.playing && s.step>=3) setS(v=>({...v, playing:false}));
      return;
    }
    const dur=900;
    const loop=(ts:number)=>{
      if(!last.current) last.current=ts;
      if(ts-last.current>=dur){ last.current=ts; setS(v=>({...v, step: clamp(v.step+1,0,3)})); }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); raf.current=null; last.current=null; };
  }, [s.playing,s.step]);

  return (
    <div className="rounded-2xl border bg-white">
      <CommonFactorHeader s={s} setS={setS} hydrated={hydrated} original={original} />
      <div className="p-5 lg:p-6 space-y-6" style={{ paddingTop:'72px' }}>
        {s.step>=1 && (<><h3 className="font-semibold">1. 係数の最大公約数</h3><KaTeXBlock tex={block.s1}/></>)}
        {s.step>=2 && (<><h3 className="font-semibold">2. 指数の最小</h3><KaTeXBlock tex={block.s2}/></>)}
        {s.step>=3 && (<><h3 className="font-semibold">3. くくる</h3><KaTeXBlock tex={block.s3}/></>)}
        {s.step>=3 && (<>
          <h3 className="font-semibold">完成形</h3>
          <div className="text-[20px] leading-[1.8]"><KaTeXBlock tex={block.final}/></div>
        </>)}
      </div>
    </div>
  );
}
