// src/components/animations/FactorizationStepper.tsx
'use client';

import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv, negRat,
  texRat, normalizeTeXSigns,
  texVarLead, texVarMid, texConstMid,
} from '@/lib/tex/format';

type Props = { a?: number; b?: number; c?: number };

function lcmInt(a:number,b:number){
  const A=Math.abs(a),B=Math.abs(b);
  const g = (x:number,y:number):number => y ? g(y,x%y) : x;
  if(A===0&&B===0)return 1;
  if(A===0)return B;
  if(B===0)return A;
  return (A/g(A,B))*B;
}
const lcm3=(a:number,b:number,c:number)=>lcmInt(lcmInt(a,b),c);
const denOf=(r:Rat)=>Math.abs(r.d||1);
const numOf=(r:Rat)=>r.n;
function igcd(a:number,b:number){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b; b=a%b; a=t; } return a||1; }
const isSquare=(n:number)=> n>=0 && Math.floor(Math.sqrt(n))**2===n;

export default function FactorizationStepper({ a: a0 = 1, b: b0 = 0, c: c0 = 0 }: Props){
  const [a,setA]=useState(a0), [b,setB]=useState(b0), [c,setC]=useState(c0);
  const [step,setStep]=useState(0);

  const slides = useMemo(()=>{
    const A = toRat(a), B = toRat(b), C = toRat(c);
    const L = lcm3(denOf(A), denOf(B), denOf(C));
    let Ai = ratMul(A, {n:L,d:1}), Bi = ratMul(B, {n:L,d:1}), Ci = ratMul(C, {n:L,d:1});
    const g = igcd(igcd(Math.abs(numOf(Ai)), Math.abs(numOf(Bi))), Math.abs(numOf(Ci)));
    if (g>1){ Ai = {n:Ai.n/g, d:Ai.d}; Bi = {n:Bi.n/g, d:Bi.d}; Ci = {n:Ci.n/g, d:Ci.d}; }
    const Aint = Ai.n, Bint = Bi.n, Cint = Ci.n;

    const tHeader = normalizeTeXSigns(String.raw`
\textbf{入力}:\quad ${texRat(A)}x^2 ${B.n>=0?'+ ':''}${texRat(B)}x ${C.n>=0?'+ ':''}${texRat(C)}
\quad \Rightarrow\quad
\textbf{整数化}:\quad ${texRat(Ai)}x^2 ${Bi.n>=0?'+ ':''}${texRat(Bi)}x ${Ci.n>=0?'+ ':''}${texRat(Ci)}
    `);

    let common = igcd(igcd(Math.abs(Aint), Math.abs(Bint)), Math.abs(Cint));
    if (Aint<0 && common>0) common = -common;
    if (common===0) common = 1;
    let A1=Aint, B1=Bint, C1=Cint;
    let tCommon = '';
    if (Math.abs(common)>1){
      A1 = Aint/common; B1 = Bint/common; C1 = Cint/common;
      tCommon = normalizeTeXSigns(String.raw`
\textbf{共通因数をくくる}:\quad ${texRat({n:Aint,d:1})}x^2 ${Bint>=0?'+ ':''}${texRat({n:Bint,d:1})}x ${Cint>=0?'+ ':''}${texRat({n:Cint,d:1})}
= ${texRat({n:common,d:1})}\left( ${texRat({n:A1,d:1})}x^2 ${B1>=0?'+ ':''}${texRat({n:B1,d:1})}x ${C1>=0?'+ ':''}${texRat({n:C1,d:1})} \right)
      `);
    }

    const tDiffSquare = () => {
      const apos = A1>0, bzero = (B1===0), cneg = (C1<0);
      const aSq = isSquare(Math.abs(A1)), cSq = isSquare(Math.abs(C1));
      if (apos && bzero && cneg && aSq && cSq){
        const p = Math.floor(Math.sqrt(A1));
        const q = Math.floor(Math.sqrt(-C1));
        const inside1 = normalizeTeXSigns(String.raw`${texVarLead({n:p,d:1},'x')} ${texConstMid({n:-q,d:1})}`);
        const inside2 = normalizeTeXSigns(String.raw`${texVarLead({n:p,d:1},'x')} ${texConstMid({n:q,d:1})}`);
        return normalizeTeXSigns(String.raw`
\textbf{平方差}:\quad ${texRat({n:A1,d:1})}x^2 - ${texRat({n:-C1,d:1})}
= \left( ${inside1} \right)\left( ${inside2} \right)
        `);
      }
      return '';
    };

    const tTri = () => {
      if (A1===1){
        const pairs = [];
        for (let m=-Math.abs(Math.abs(C1))*2; m<=Math.abs(Math.abs(C1))*2; m++){
          const n = B1 - m;
          if (m*n === C1){ pairs.push([m,n]); break; }
        }
        if (pairs.length){
          const [m,n] = pairs[0]!;
          const f1in = normalizeTeXSigns(String.raw`${texVarLead({n:1,d:1},'x')} ${texConstMid({n:m,d:1})}`);
          const f2in = normalizeTeXSigns(String.raw`${texVarLead({n:1,d:1},'x')} ${texConstMid({n:n,d:1})}`);
          return normalizeTeXSigns(String.raw`
\textbf{因数分解（a=1）}:\quad x^2 ${B1>=0?'+ ':''}${texRat({n:B1,d:1})}x ${C1>=0?'+ ':''}${texRat({n:C1,d:1})}
= \left( ${f1in} \right)\left( ${f2in} \right)
          `);
        }
      }
      const AC = A1*C1;
      let found: [number,number]|null = null;
      const bound = Math.abs(AC)*2 + 10;
      for (let p=-bound; p<=bound; p++){
        const q = B1 - p;
        if (p*q === AC){ found = [p,q]; break; }
      }
      if (found){
        const [p,q] = found;
        const g1 = igcd(A1, p);
        const g2 = igcd(q, C1);
        const u = A1/g1, v = p/g1;
        const w = g1,   z = C1/g1;
        const fin1 = normalizeTeXSigns(String.raw`${texVarLead({n:u,d:1},'x')} ${texConstMid({n:v,d:1})}`);
        const fin2 = normalizeTeXSigns(String.raw`${texVarLead({n:w,d:1},'x')} ${texConstMid({n:z,d:1})}`);
        return normalizeTeXSigns(String.raw`
\textbf{AC法}:\quad p+q=${texRat({n:B1,d:1})},\ pq=${texRat({n:AC,d:1})}\ \Rightarrow\ p=${texRat({n:p,d:1})},\ q=${texRat({n:q,d:1})} \\
= \left( ${fin1} \right)\left( ${fin2} \right)
        `);
      }
      return '';
    };

    const parts: { title: string, body: string }[] = [];
    parts.push({ title: '入力 → 整数化', body: tHeader });
    if (tCommon){ parts.push({ title: '共通因数をくくる', body: tCommon }); }

    const diff = tDiffSquare();
    if (diff){ parts.push({ title: '平方差', body: diff }); return parts; }

    const tri = tTri();
    if (tri){ parts.push({ title: '三項式の因数分解', body: tri }); return parts; }

    parts.push({ title: '結果', body: normalizeTeXSigns(String.raw`
\text{整数係数では因数分解できません。必要なら平方完成や解の公式を用います。}
    `)});

    return parts;
  },[a,b,c]);

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">因数分解 — ステップ {step+1}/{slides.length}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.max(0,s-1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.min(slides.length-1,s+1))}>次へ</button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-3 min-h-[260px]">
        <div className="text-sm text-gray-600">{slides[step].title}</div>
        <KaTeXBlock tex={slides[step].body} />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">a（x²の係数）<NumInput value={a} onChange={setA} /></label>
        <label className="text-sm">b（xの係数）<NumInput value={b} onChange={setB} /></label>
        <label className="text-sm">c（定数項）<NumInput value={c} onChange={setC} /></label>
      </div>
    </div>
  );
}
