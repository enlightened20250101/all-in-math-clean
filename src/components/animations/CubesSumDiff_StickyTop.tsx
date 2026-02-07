'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import {
  toRat, texRat, type Rat, simplifyFrac,
  normalizeTeXSigns, ratAdd, ratSub, ratMul
} from '@/lib/tex/format';

const clamp = (x:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, x));

/* =========================
   TeX helpers（分数・省略ルール込み）
========================= */

// 先頭：係数×変数（±1は省略）
const texVarLead = (coef:Rat, v:'x'|'y'|'x^2'|'y^2'|'xy')=>{
  const s = simplifyFrac(coef.n, coef.d);
  if (s.n===0) return '';
  const abs1 = (Math.abs(s.n)===1 && s.d===1);
  const mag  = abs1 ? '' : texRat({n:Math.abs(s.n), d:s.d});
  return normalizeTeXSigns(`${s.n<0?'- ':''}${mag}${v}`);
};
// 中間：符号付き
const texVarMid  = (coef:Rat, v:'x'|'y'|'x^2'|'y^2'|'xy')=>{
  const s = simplifyFrac(coef.n, coef.d);
  if (s.n===0) return '';
  const sign = s.n>0 ? '+ ' : '- ';
  const abs1 = (Math.abs(s.n)===1 && s.d===1);
  const mag  = abs1 ? '' : texRat({n:Math.abs(s.n), d:s.d});
  return normalizeTeXSigns(`${sign}${mag}${v}`);
};
// 定数（先頭/中間）
const texConstLead = (c:Rat)=>{
  const s = simplifyFrac(c.n, c.d);
  if (s.n===0) return '';
  return normalizeTeXSigns(s.n<0 ? `- ${texRat({n:Math.abs(s.n), d:s.d})}` : texRat(s));
};
const texConstMid  = (c:Rat)=>{
  const s = simplifyFrac(c.n, c.d);
  if (s.n===0) return '';
  return normalizeTeXSigns(`${s.n>0?'+ ':'- '}${texRat({n:Math.abs(s.n), d:s.d})}`);
};

// (p·var + q)：p=±1 は省略、内部のマイナスは因子内で処理
function texLinearOne(p:Rat, q:Rat, varName:'x'|'y'){
  const ps = simplifyFrac(p.n,p.d), qs = simplifyFrac(q.n,q.d);
  const neg = ps.n < 0;
  const absP = { n: Math.abs(ps.n), d: ps.d };
  const head = (absP.n===1 && absP.d===1) ? '' : texRat(absP);
  const vpart = `${head}${varName}`;
  const qTerm = qs.n===0 ? '' : (qs.n>0 ? `+ ${texRat(qs)}` : `- ${texRat({n:-qs.n,d:qs.d})}`);
  return normalizeTeXSigns(`(${neg?'-':''}${vpart} ${qTerm})`.replace(/\s+/g,' ').replace('( -','(- '));
}

/* =========================
   1次式の和差／立方の展開
========================= */

// 1次式の和/差（厳密分数）: (ax+b) ± (cy+d) → {p,q} で p·var + q
const addLin = (p1:Rat,q1:Rat,p2:Rat,q2:Rat)=>({
  p: simplifyFrac(p1.n*p2.d + p2.n*p1.d, p1.d*p2.d),
  q: simplifyFrac(q1.n*q2.d + q2.n*q1.d, q1.d*q2.d)
});
const subLin = (p1:Rat,q1:Rat,p2:Rat,q2:Rat)=>({
  p: simplifyFrac(p1.n*p2.d - p2.n*p1.d, p1.d*p2.d),
  q: simplifyFrac(q1.n*q2.d - q2.n*q1.d, q1.d*q2.d)
});

// (a·u + b)^3 = a^3 u^3 + 3 a^2 b u^2 + 3 a b^2 u + b^3
function cubeLinear(p:Rat, q:Rat){
  const a=p, b=q;
  const a2 = ratMul(a,a), a3=ratMul(a2,a);
  const b2 = ratMul(b,b), b3=ratMul(b2,b);
  const c3 = simplifyFrac(a3.n,a3.d);
  const c2 = simplifyFrac(ratMul({n:3,d:1}, ratMul(a2,b)).n, ratMul({n:3,d:1}, ratMul(a2,b)).d);
  const c1 = simplifyFrac(ratMul({n:3,d:1}, ratMul(a,b2)).n, ratMul({n:3,d:1}, ratMul(a,b2)).d);
  const c0 = simplifyFrac(b3.n,b3.d);
  return { c3,c2,c1,c0 }; // u^3, u^2, u, const の係数
}

// 1変数3次 a3 u^3 + a2 u^2 + a1 u + a0 の TeX（u=x or y）
function texPoly3_u(c3:Rat,c2:Rat,c1:Rat,c0:Rat, u:'x'|'y'){
  const parts:string[]=[];
  const s3=simplifyFrac(c3.n,c3.d);
  if (s3.n!==0){
    const abs1=(Math.abs(s3.n)===1 && s3.d===1);
    const mag=abs1?'':texRat({n:Math.abs(s3.n),d:s3.d});
    parts.push(`${s3.n<0?'- ':''}${mag}${u}^{3}`);
  }
  const t2=texVarMid(c2, u==='x'?'x^2':'y^2'); if (t2) parts.push(t2);
  const t1=texVarMid(c1, u);                    if (t1) parts.push(t1);
  const t0=texConstMid(c0);                     if (t0) parts.push(t0);
  return normalizeTeXSigns(parts.length? parts.join(' ') : '0');
}

/* =========================
   2変数二次（因数の二次側） A^2 ∓ AB + B^2 の完全展開
   A=ax+b（xの式）, B=cy+d（yの式）
========================= */
function quadFactorExpanded(a:Rat,b:Rat,c:Rat,d:Rat, isSum:boolean){
  // sum: A^2 − AB + B^2, diff: A^2 + AB + B^2
  const a2 = ratMul(a,a), c2=ratMul(c,c);
  const ab = ratMul(a,b), cd=ratMul(c,d);
  const b2 = ratMul(b,b), d2=ratMul(d,d);
  const ac = ratMul(a,c);
  const kx2 = simplifyFrac(a2.n,a2.d);    // x^2
  const ky2 = simplifyFrac(c2.n,c2.d);    // y^2
  const kxy = isSum ? simplifyFrac(-ac.n, ac.d) : simplifyFrac(ac.n,ac.d);
  const kx  = simplifyFrac(
    ratAdd( ratMul({n:2,d:1},ab), isSum? ratMul({n:-1,d:1}, ratMul(b,c)) : ratMul({n:1,d:1}, ratMul(b,c)) ).n,
    ratAdd( ratMul({n:2,d:1},ab), isSum? ratMul({n:-1,d:1}, ratMul(b,c)) : ratMul({n:1,d:1}, ratMul(b,c)) ).d
  );
  const ky  = simplifyFrac(
    ratAdd( isSum? ratMul({n:-1,d:1}, ratMul(a,d)) : ratMul({n:1,d:1}, ratMul(a,d)), ratMul({n:2,d:1},cd) ).n,
    ratAdd( isSum? ratMul({n:-1,d:1}, ratMul(a,d)) : ratMul({n:1,d:1}, ratMul(a,d)), ratMul({n:2,d:1},cd) ).d
  );
  const k0  = simplifyFrac(
    ratAdd( ratAdd(b2, d2), isSum? ratMul({n:-1,d:1}, ratMul(b,d)) : ratMul({n:1,d:1}, ratMul(b,d)) ).n,
    ratAdd( ratAdd(b2, d2), isSum? ratMul({n:-1,d:1}, ratMul(b,d)) : ratMul({n:1,d:1}, ratMul(b,d)) ).d
  );

  const parts:string[]=[];
  const lead = texVarLead(kx2,'x^2'); if (lead) parts.push(lead);
  const xy   = texVarMid(kxy,'xy');   if (xy)   parts.push(xy);
  const y2   = texVarMid(ky2,'y^2');  if (y2)   parts.push(y2);
  const x    = texVarMid(kx,'x');     if (x)    parts.push(x);
  const y    = texVarMid(ky,'y');     if (y)    parts.push(y);
  const cst  = texConstMid(k0);       if (cst)  parts.push(cst);
  return parts.length ? parts.join(' ') : '0';
}

/* =======================
   本体（Sticky ヘッダ + フル操作）
======================= */
export default function CubesSumDiff_XY_StickyTop(){
  // Sticky header hydration
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>{ setHydrated(true); },[]);

  type S = {
    a:number;b:number; c:number; d:number;   // A=ax+b, B=cy+d
    mode:'sum'|'diff';                       // A^3 ± B^3
    display:'factor'|'expand';               // 因数 or 展開
    step:number; playing:boolean;
  };
  const [s,setS] = useState<S>({
    a:1,b:0, c:1,d:1,
    mode:'diff',
    display:'factor',
    step:0, playing:false
  });

  // Rat
  const A1 = useMemo(()=>toRat(s.a), [s.a]);   // ax
  const B1 = useMemo(()=>toRat(s.b), [s.b]);   // b
  const C1 = useMemo(()=>toRat(s.c), [s.c]);   // cy
  const D1 = useMemo(()=>toRat(s.d), [s.d]);   // d

  // A,B の TeX
  const Atex = useMemo(()=> texLinearOne(A1,B1,'x'), [A1,B1]);
  const Btex = useMemo(()=> texLinearOne(C1,D1,'y'), [C1,D1]);

  // 元の式
  const sign = s.mode==='sum' ? '+' : '−';
  const s0   = useMemo(()=> normalizeTeXSigns(String.raw`\displaystyle ${Atex}^{3} ${sign} ${Btex}^{3}`), [Atex,Btex,sign]);

  // 自動再生（step 自動前進）
  const raf = useRef<number|null>(null), last=useRef<number|null>(null);
  useEffect(()=>{
    if(!s.playing || s.step>=3){
      if(raf.current) cancelAnimationFrame(raf.current);
      raf.current=null; last.current=null;
      if(s.playing && s.step>=3) setS(v=>({...v, playing:false}));
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
  },[s.playing, s.step]);

  // 因数分解（括弧最小）：(ax ± cy + (b ± d)) · [二次因子の完全展開]
  const lin = useMemo(()=> (s.mode==='sum' ? addLin(A1,B1,C1,D1) : subLin(A1,B1,C1,D1)), [A1,B1,C1,D1,s.mode]);
  const factorLin  = useMemo(()=>{
    // 括弧を最小化：ax ± cy + (b ± d) を “括弧なし”の1本に整形
    const sx = simplifyFrac(lin.p.n, lin.p.d);
    const sy = { n: lin.p.n>=0? (s.mode==='sum'? C1.n:C1.n) : (s.mode==='sum'? C1.n:C1.n), d: C1.d }; // 係数の取り回しは lin の p,qに集約済み
    // → ここはすでに lin.p が x, lin.q が定数。y の係数は C1 or -C1 は add/sub に吸収されているため、
    //    シンプルに“x項”“y項”“定数”で再構成する:
    const parts:string[]=[];
    // x 項
    if (sx.n!==0) parts.push(texVarLead({n:sx.n, d:sx.d}, 'x'));
    // y 項（lin.p は x の係数なので、y の係数は sub/add のときの p でなく C1 側から生成）
    const py = s.mode==='sum' ? C1 : { n:-C1.n, d:C1.d };
    if (py.n!==0) parts.push(parts.length? texVarMid(py,'y') : texVarLead(py,'y'));
    // 定数
    const c0 = s.mode==='sum' ? lin.q : lin.q; // 既に add/sub で（b±d）になっている
    if (c0.n!==0) parts.push(parts.length? texConstMid(c0) : texConstLead(c0));
    const body = parts.length? parts.join(' ') : '0';
    return normalizeTeXSigns(body);
  }, [lin, C1, s.mode]);

  const factorQuad = useMemo(()=> quadFactorExpanded(A1,B1,C1,D1, s.mode==='sum'), [A1,B1,C1,D1,s.mode]);

  // 展開（x 側 3次 ± y 側 3次）
  const X3 = useMemo(()=> cubeLinear(A1,B1), [A1,B1]);
  const Y3 = useMemo(()=> cubeLinear(C1,D1), [C1,D1]);
  const expanded = useMemo(()=>{
    const xp = texPoly3_u(X3.c3,X3.c2,X3.c1,X3.c0,'x');
    const yp = texPoly3_u(Y3.c3,Y3.c2,Y3.c1,Y3.c0,'y');
    return normalizeTeXSigns( s.mode==='sum' ? String.raw`${xp}\ +\ ${yp}` : String.raw`${xp}\ -\ ${yp}` );
  }, [X3,Y3,s.mode]);

  // Sticky Header（ローカル入力／フォーカス保持）
  const HeaderBar = React.memo(function Header(){
    const [local, setLocal] = useState({ a:String(s.a), b:String(s.b), c:String(s.c), d:String(s.d), mode:s.mode, display:s.display });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(()=>{ setLocal({ a:String(s.a), b:String(s.b), c:String(s.c), d:String(s.d), mode:s.mode, display:s.display }); }, [s]);
    const parseLoose=(t:string)=>{ const k=t.trim(); if(k===''||k==='+'||k==='-') return null; const v=Number(k); return Number.isFinite(v)?v:null; };
    const commit=(k:'a'|'b'|'c'|'d', raw:string)=> setS(v=> (parseLoose(raw)===null ? v : ({ ...v, [k]: Number(raw), step:0, playing:false })));
    return (
      <div className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm"><span className="block mb-1 text-gray-600">表示</span>
              <select value={local.display} onChange={e=>setS(v=>({...v, display:e.target.value as 'factor'|'expand', step:0, playing:false }))} className="rounded border px-2 py-1">
                <option value="factor">因数分解（括弧最小）</option>
                <option value="expand">展開（x側 + y側）</option>
              </select>
            </label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">モード</span>
              <select value={local.mode} onChange={e=>setS(v=>({...v, mode:e.target.value as 'sum'|'diff', step:0, playing:false }))} className="rounded border px-2 py-1">
                <option value="sum">A^3 + B^3</option>
                <option value="diff">A^3 − B^3</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
            {(['a','b','c','d'] as const).map((key)=>(
              <label key={key} className="text-sm sm:col-span-2">
                <span className="block mb-1 text-gray-600">{key}</span>
                <input
                  type="text" inputMode="decimal" className="w-full rounded border px-3 py-2 text-base"
                  value={local[key]} onChange={(e)=>setLocal(v=>({...v,[key]:e.target.value}))}
                  onBlur={(e)=>commit(key,e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==='Enter'){ const t=e.currentTarget; commit(key,t.value); t.blur(); }}}
                  onKeyDownCapture={(e)=>{ // ホットキー遮断
                    // @ts-ignore
                    if(!e.isComposing && !(e.metaKey||e.ctrlKey||e.altKey)) e.stopPropagation();
                  }}
                  onFocus={()=>{ if(s.playing) setS(v=>({...v, playing:false })); }}
                  autoCorrect="off" autoCapitalize="none" spellCheck={false}
                />
              </label>
            ))}
          </div>

          {/* ステップ＆再生 */}
          <div className="flex items-center gap-3">
            <label className="text-sm flex-1">
              <span className="block mb-1 text-gray-600">ステップ</span>
              <input type="range" min={0} max={3} step={1} value={s.step} onChange={e=>setS(v=>({...v, step: parseInt(e.target.value,10), playing:false }))} className="w-full" />
            </label>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:0, playing:false }))}>最初</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:clamp(v.step-1,0,3), playing:false }))}>戻る</button>
              <button className="px-2 py-1 rounded border disabled:opacity-50" onClick={()=>setS(v=>({...v, playing:true }))} disabled={s.playing || s.step>=3}>▶ アニメ</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, playing:false }))} disabled={!s.playing}>■ 停止</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setS(v=>({...v, step:clamp(v.step+1,0,3), playing:false }))} disabled={s.playing}>次へ</button>
            </div>
          </div>

          {/* 元の式（常時表示） */}
          <div className="overflow-x-auto">
            <div className="text-[18px] leading-[1.7] pointer-events-none">
              {hydrated ? <KaTeXBlock tex={s0}/> : <span>&nbsp;</span>}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="rounded-2xl border bg-white">
      <HeaderBar />
      <div className="p-5 lg:p-6 space-y-6" style={{ paddingTop:'72px' }}>
        {/* コマ送り */}
        {s.step>=1 && (<>
          <h3 className="font-semibold">公式</h3>
          <KaTeXBlock tex={normalizeTeXSigns(String.raw`A^3\pm B^3=(A\pm B)\big(A^2\mp AB+B^2\big)`)} />
        </>)}

        {s.step>=2 && s.display==='factor' && (<>
          <h3 className="font-semibold">因数分解（一次因子は括弧最小）</h3>
          <KaTeXBlock tex={normalizeTeXSigns(String.raw`
            ${s0} \;=\; \bigl(${factorLin}\bigr)\,\Bigl(${factorQuad}\Bigr)
          `)} />
        </>)}

        {s.step>=2 && s.display==='expand' && (<>
          <h3 className="font-semibold">展開（x 側 3次 ± y 側 3次）</h3>
          <KaTeXBlock tex={normalizeTeXSigns(expanded)} />
        </>)}

        {s.step>=3 && (<>
          <h3 className="font-semibold">完成形</h3>
          <div className="text-[20px] leading-[1.8]">
            <KaTeXBlock tex={normalizeTeXSigns(
              s.display==='factor'
                ? String.raw`\bigl(${factorLin}\bigr)\,\Bigl(${factorQuad}\Bigr)`
                : expanded
            )}/>
          </div>
        </>)}
      </div>
    </div>
  );
}
