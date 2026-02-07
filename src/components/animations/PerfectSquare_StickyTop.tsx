'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import {
  toRat, texRat, type Rat, simplifyFrac,
  normalizeTeXSigns, ratDiv, ratMul, ratSub
} from '@/lib/tex/format';

const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
const isZero = (r:Rat)=> simplifyFrac(r.n,r.d).n===0;

export default function PerfectSquare_StickyTop(){
  const [hydrated,setHydrated]=useState(false); useEffect(()=>{ setHydrated(true); },[]);
  type S={ a:number;b:number;c:number; step:number; playing:boolean };
  const [s,setS]=useState<S>({ a:1,b:2,c:1, step:0, playing:false });

  const aR=useMemo(()=>toRat(s.a),[s.a]); const bR=useMemo(()=>toRat(s.b),[s.b]); const cR=useMemo(()=>toRat(s.c),[s.c]);
  const invalid=isZero(aR);

  // 完成平方： a(x + b/2a)^2 + (c - a(b/2a)^2)
  const p = useMemo(()=> ratDiv(bR, ratMul({n:2,d:1}, aR)), [bR,aR]);  // b/(2a)
  const ap2 = useMemo(()=> ratMul(aR, ratMul(p,p)), [aR,p]);           // a p^2
  const r  = useMemo(()=> ratSub(cR, ap2), [cR,ap2]);                  // 残差

  const original = useMemo(()=> normalizeTeXSigns(
    String.raw`\displaystyle ${texRat(aR)}x^2 + ${texRat(bR)}x + ${texRat(cR)}`
  ), [aR,bR,cR]);

  const block = useMemo(()=>({
    s1: normalizeTeXSigns(String.raw`\text{完成平方：}\quad a\left(x+\frac{b}{2a}\right)^2 + \Big(c - a\left(\frac{b}{2a}\right)^2\Big)`),
    s2: normalizeTeXSigns(String.raw`\text{具体化：}\quad ${texRat(aR)}\left(x+\frac{${texRat(bR)}}{2\,${texRat(aR)}}\right)^2 \;+\; \Big(${texRat(cR)} - ${texRat(ap2)}\Big)`),
    s3: normalizeTeXSigns(isZero(r)
      ? String.raw`\textbf{完全平方}\quad=\quad ${texRat(aR)}\left(x+\frac{${texRat(bR)}}{2\,${texRat(aR)}}\right)^2`
      : String.raw`\textbf{非該当}\quad（残差 } r = ${texRat(r)} \neq 0\text{）`
    ),
    final: normalizeTeXSigns(isZero(r)
      ? String.raw`\displaystyle ${texRat(aR)}\left(x+\frac{${texRat(bR)}}{2\,${texRat(aR)}}\right)^2`
      : String.raw`\displaystyle ${texRat(aR)}x^2 + ${texRat(bR)}x + ${texRat(cR)}\ \ (\text{完全平方ではない})`
    )
  }), [aR,bR,cR, ap2, r]);

  // 再生
  const raf=useRef<number|null>(null), last=useRef<number|null>(null);
  useEffect(()=>{
    if(!s.playing || s.step>=3 || invalid){
      if(raf.current) cancelAnimationFrame(raf.current);
      raf.current=null; last.current=null;
      if(s.playing && s.step>=3) setS(v=>({...v, playing:false}));
      return;
    }
    const dur=900;
    const loop=(ts:number)=>{
      if(!last.current) last.current=ts;
      if(ts-last.current>=dur){ last.current=ts; setS(v=>({...v, step:clamp(v.step+1,0,3)})); }
      raf.current=requestAnimationFrame(loop);
    };
    raf.current=requestAnimationFrame(loop);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); raf.current=null; last.current=null; };
  }, [s.playing,s.step, invalid]);

  // Stickyヘッダ
  const Header = React.memo(function Header(){
    const [local,setLocal]=useState({ a:String(s.a), b:String(s.b), c:String(s.c) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(()=>{ setLocal({ a:String(s.a), b:String(s.b), c:String(s.c) }); }, [s]);
    const parse=(t:string)=>{ const u=t.trim(); if(u===''||u==='+'||u==='-') return null; const v=Number(u); return Number.isFinite(v)?v:null; };
    const commit=(k:'a'|'b'|'c', raw:string)=> setS(v=> (parse(raw)===null ? v : ({...v, [k]:Number(raw), step:0, playing:false})));

    return (
      <div className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {(['a','b','c'] as const).map((k)=>(
              <label key={k} className="text-sm">
                <span className="block mb-1 text-gray-600">{k}</span>
                <input
                  type="text" inputMode="decimal" className="w-full rounded border px-3 py-2 text-base"
                  value={local[k]} onChange={e=>setLocal(v=>({...v, [k]:e.target.value}))}
                  onBlur={e=>commit(k,e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ const t=e.currentTarget; commit(k,t.value); t.blur(); }}}
                  onKeyDownCapture={(e)=>{ /* hotkey遮断 */ // @ts-ignore
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
              <button className="px-2 py-1 rounded border disabled:opacity-50" onClick={()=>setS(v=>({...v, playing:true}))} disabled={s.playing || s.step>=3 || invalid}>▶ アニメ</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, playing:false}))} disabled={!s.playing}>■ 停止</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:clamp(v.step+1,0,3), playing:false}))} disabled={s.playing}>次へ</button>
            </div>
          </div>

          {/* 元の式 */}
          <div className="overflow-x-auto">
            <div className="text-[18px] leading-[1.7] pointer-events-none">
              {hydrated ? <KaTeXBlock tex={original}/> : <span>&nbsp;</span>}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="rounded-2xl border bg-white">
      <Header />
      <div className="p-5 lg:p-6 space-y-6" style={{ paddingTop:'72px' }}>
        {invalid && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">a=0 は不可（一次になります）。</div>}

        {s.step>=1 && (<><h3 className="font-semibold">1. 完成平方の形</h3><KaTeXBlock tex={block.s1}/></>)}
        {s.step>=2 && (<><h3 className="font-semibold">2. 具体化</h3><KaTeXBlock tex={block.s2}/></>)}
        {s.step>=3 && (<><h3 className="font-semibold">3. 判定</h3><KaTeXBlock tex={block.s3}/></>)}

        <h3 className="font-semibold">完成形</h3>
        <div className="text-[20px] leading-[1.8]"><KaTeXBlock tex={block.final}/></div>
      </div>
    </div>
  );
}
