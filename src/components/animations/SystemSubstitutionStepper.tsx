// src/components/animations/SystemSubstitutionStepper.tsx
'use client';

import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import type { Rat } from "@/lib/tex/format";
import {
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv, negRat,
  texRat, normalizeTeXSigns,
  texVarLead, texVarMid,
  texConstMid,               // ← これを追加
} from "@/lib/tex/format";


type Props = {
  a1?: number; b1?: number; c1?: number;
  a2?: number; b2?: number; c2?: number;
};

// lcm/gcd helpers（整数化・約分用）
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
const mulInt=(r:Rat,k:number):Rat=>simplifyFrac(r.n*k,r.d);
const divInt=(r:Rat,k:number):Rat=>simplifyFrac(r.n,r.d*k);

export default function SystemSubstitutionStepper(initial: Props){
  const[a1,setA1]=useState(initial.a1 ?? 1);
  const[b1,setB1]=useState(initial.b1 ?? 1);
  const[c1,setC1]=useState(initial.c1 ?? 5);
  const[a2,setA2]=useState(initial.a2 ?? 1);
  const[b2,setB2]=useState(initial.b2 ?? -1);
  const[c2,setC2]=useState(initial.c2 ?? 1);
  const[step,setStep]=useState(0); // 0..4

  const slides = useMemo(()=>{
    // 0) 入力を厳密分数に
    const A = toRat(a1), B = toRat(b1), C = toRat(c1);
    const D = toRat(a2), E = toRat(b2), F = toRat(c2);

    // 1) 分母払いで整数化 → 各式のGCDで約分（最簡比）
    const L1=lcm3(denOf(A),denOf(B),denOf(C));
    const L2=lcm3(denOf(D),denOf(E),denOf(F));
    const Ai=ratMul(A,{n:L1,d:1}), Bi=ratMul(B,{n:L1,d:1}), Ci=ratMul(C,{n:L1,d:1});
    const Di=ratMul(D,{n:L2,d:1}), Ei=ratMul(E,{n:L2,d:1}), Fi=ratMul(F,{n:L2,d:1});
    const g=(x:number,y:number):number=>y?g(y,x%y):Math.abs(x)||1;
    const g1=g(g(Math.abs(numOf(Ai)),Math.abs(numOf(Bi))),Math.abs(numOf(Ci)));
    const g2=g(g(Math.abs(numOf(Di)),Math.abs(numOf(Ei))),Math.abs(numOf(Fi)));
    let A0=divInt(Ai,g1), B0=divInt(Bi,g1), C0=divInt(Ci,g1);
    let D0=divInt(Di,g2), E0=divInt(Ei,g2), F0=divInt(Fi,g2);
    // 先頭係数が負なら -1 を掛けて整形（見やすさ優先）
    if(A0.n<0){A0=negRat(A0); B0=negRat(B0); C0=negRat(C0);}
    if(D0.n<0){D0=negRat(D0); E0=negRat(E0); F0=negRat(F0);}

    // 2) どちらを解くか（|係数|が1に近い方を優先。同点なら y 優先）
    const scoreX = Math.min(Math.abs(A0.n), Math.abs(D0.n));
    const scoreY = Math.min(Math.abs(B0.n), Math.abs(E0.n));
    const solveVar: 'x'|'y' = (scoreY <= scoreX) ? 'y' : 'x';
    const preferEq1ForX = Math.abs(A0.n) <= Math.abs(D0.n);
    const preferEq1ForY = Math.abs(B0.n) <= Math.abs(E0.n);
    const useEq1 = (solveVar === 'x') ? preferEq1ForX : preferEq1ForY;

    // 2') 解いた式（表示用）と代入右辺（TeX文字列）
    let isoText = '';    // 例： y = -(a/b)x + c/b
    let subExpr = '';    // 代入するときの右辺（TeX; 括弧内にそのまま入れる）
    // ゼロ判定 & 非ゼロ定数だけを中間に出すユーティリティ
    const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;
    const constMidNZ = (r: Rat) => isZero(r) ? '' : ` ${texConstMid(r)}`.trim();

    // 先頭用: （例）-1*(...) -> "- (...)";  +1*(...) -> "(...)"（先頭は + を出さない）
    const texParenMulLead = (coef: Rat, inner: string) => {
      const s = simplifyFrac(coef.n, coef.d);
      const sign = s.n < 0 ? '-' : '';
      const abs = { n: Math.abs(s.n), d: s.d };
      const coeff = (abs.n === 1 && abs.d === 1) ? '' : texRat(abs);
      return `${sign} ${coeff}\\left(${inner}\\right)`.trim();
    };

    // 途中用: （例）-1*(...) -> "- (...)"、+1*(...) -> "+ (...)"（途中は必ず ± を明示）
    const texParenMulMid = (coef: Rat, inner: string) => {
      const s = simplifyFrac(coef.n, coef.d);
      const pm = s.n < 0 ? '- ' : '+ ';
      const abs = { n: Math.abs(s.n), d: s.d };
      const coeff = (abs.n === 1 && abs.d === 1) ? '' : texRat(abs);
      return `${pm}${coeff}\\left(${inner}\\right)`;
    };
    
    // y または x を slope⋅var + intercept で表示（±1 の省略・/1 の除去は texVarLead/texRat 側）
    const setSolvedForm = (
      solveVar: 'x'|'y',
      coefVar: Rat,   // 分子側の係数（例：-A0 など）
      denom:   Rat,   // 分母（例：B0 など）
      interceptNum: Rat, // 切片の分子（例：C0 など）
    ) => {
      const slope     = ratDiv(coefVar, denom);     // 係数/分母
      const intercept = ratDiv(interceptNum, denom);
      if (solveVar === 'y') {
        // y = (係数/分母) x + (切片/分母)
        const lead = texVarLead(slope, 'x');        // 1x→x, -1x→-x
        const tail = constMidNZ(intercept);         // 0 のときは出さない
        isoText = normalizeTeXSigns(String.raw`y = ${lead}${tail ? ' ' + tail : ''}`.trim());
        subExpr = isoText.replace(/^y\s*=\s*/, ''); // 右辺だけ
      } else {
        // x = (係数/分母) y + (切片/分母)
        const lead = texVarLead(slope, 'y');
        const tail = constMidNZ(intercept);
        isoText = normalizeTeXSigns(String.raw`x = ${lead}${tail ? ' ' + tail : ''}`.trim());
        subExpr = isoText.replace(/^x\s*=\s*/, '');
      }
    };
    
    // どの式から何を解くか（±を slope に吸収）
    if (useEq1) {
      if (solveVar === 'y') {
        // y = (C0 - A0 x)/B0 → y = ( -A0/B0 ) x + ( C0/B0 )
        setSolvedForm('y', negRat(A0), B0, C0);
      } else {
        // x = (C0 - B0 y)/A0 → x = ( -B0/A0 ) y + ( C0/A0 )
        setSolvedForm('x', negRat(B0), A0, C0);
      }
    } else {
      if (solveVar === 'y') {
        // y = (F0 - D0 x)/E0 → y = ( -D0/E0 ) x + ( F0/E0 )
        setSolvedForm('y', negRat(D0), E0, F0);
      } else {
        // x = (F0 - E0 y)/D0 → x = ( -E0/D0 ) y + ( F0/D0 )
        setSolvedForm('x', negRat(E0), D0, F0);
      }
    }

    // 3) もう片方に代入（表現は：元の式を示して → その y or x を括弧で置換）
    const subTitle = useEq1 ? '式(1)の結果を式(2)に代入' : '式(2)の結果を式(1)に代入';
    const subBody  = useEq1
      ? (solveVar==='y'
          ? normalizeTeXSigns(String.raw`
\begin{aligned}
  &${texVarLead(D0,'x')} ${texVarMid(E0,'y')} = ${texRat(F0)} \\
  &y \ \to \ \left( ${subExpr} \right) \\
  \Rightarrow\ &${texVarLead(D0,'x')} ${texParenMulMid(E0, subExpr)} = ${texRat(F0)}
\end{aligned}
          `)
          : normalizeTeXSigns(String.raw`
\begin{aligned}
  &${texVarLead(D0,'x')} ${texVarMid(E0,'y')} = ${texRat(F0)} \\
  &x \ \to \ \left( ${subExpr} \right) \\
  \Rightarrow\ &${texParenMulLead(D0, subExpr)} ${texVarMid(E0,'y')} = ${texRat(F0)}
\end{aligned}
          `)
        )
      : (solveVar==='y'
          ? normalizeTeXSigns(String.raw`
\begin{aligned}
  &${texVarLead(A0,'x')} ${texVarMid(B0,'y')} = ${texRat(C0)} \\
  &y \ \to \ \left( ${subExpr} \right) \\
  \Rightarrow\ &${texVarLead(A0,'x')} ${texParenMulMid(B0, subExpr)} = ${texRat(C0)}
\end{aligned}
          `)
          : normalizeTeXSigns(String.raw`
\begin{aligned}
  &${texVarLead(A0,'x')} ${texVarMid(B0,'y')} = ${texRat(C0)} \\
  &x \ \to \ \left( ${subExpr} \right) \\
  \Rightarrow\ &${texParenMulLead(A0, subExpr)} ${texVarMid(B0,'y')} = ${texRat(C0)}
\end{aligned}
          `)
        );

    // 3') 実計算：1文字の係数と右辺を厳密有理で求める（L * var = R）
    let loneVar: 'x'|'y', coefL: Rat, rhs: Rat;
    if (solveVar === 'y') {
      // y を右辺にして代入 → x の一次方程式
      loneVar = 'x';
      if (useEq1) {
        const term1 = D0;
        const term2 = ratDiv(negRat(ratMul(E0, A0)), B0);
        coefL = ratAdd(term1, term2);
        rhs   = ratSub(F0, ratDiv(ratMul(E0, C0), B0));
      } else {
        const term1 = A0;
        const term2 = ratDiv(negRat(ratMul(B0, D0)), E0);
        coefL = ratAdd(term1, term2);
        rhs   = ratSub(C0, ratDiv(ratMul(B0, F0), E0));
      }
    } else {
      // x を右辺にして代入 → y の一次方程式
      loneVar = 'y';
      if (useEq1) {
        const term1 = E0;
        const term2 = ratDiv(negRat(ratMul(D0, B0)), A0);
        coefL = ratAdd(term1, term2);
        rhs   = ratSub(F0, ratDiv(ratMul(D0, C0), A0));
      } else {
        const term1 = B0;
        const term2 = ratDiv(negRat(ratMul(A0, E0)), D0);
        coefL = ratAdd(term1, term2);
        rhs   = ratSub(C0, ratDiv(ratMul(A0, F0), D0));
      }
    }
    const loneSolution = ratDiv(rhs, coefL);

    // 4) もう一方も代入で厳密に
    const finalX = (loneVar === 'x')
      ? loneSolution
      : ratDiv(ratSub(C0, ratMul(B0, loneSolution)), A0);
    const finalY = (loneVar === 'y')
      ? loneSolution
      : ratDiv(ratSub(C0, ratMul(A0, finalX)), B0);

    // 連立（見出し＋式）と結果
    const sys = (AA:Rat,BB:Rat,CC:Rat, DD:Rat,EE:Rat,FF:Rat) => normalizeTeXSigns(String.raw`
\left\{
\begin{aligned}
  ${texVarLead(AA,'x')} ${texVarMid(BB,'y')} &= ${texRat(CC)} \\
  ${texVarLead(DD,'x')} ${texVarMid(EE,'y')} &= ${texRat(FF)}
\end{aligned}
\right.
    `);

    return [
      { title: '入力（分数化前）', body: sys(toRat(a1),toRat(b1),toRat(c1), toRat(a2),toRat(b2),toRat(c2)) },
      { title: '分母を払って整数化 → 各式の最大公約数で約分（最簡比）', body: sys(A0,B0,C0, D0,E0,F0) },
      { title: `${solveVar==='x'?'x':'y'} について解く（${useEq1?'式(1)':'式(2)'}）`, body: isoText },
      { title: subTitle, body: subBody },
      { title: '解を求める', body: normalizeTeXSigns(String.raw`
${loneVar} = ${texRat(loneSolution)}
\quad\Rightarrow\quad
x = ${texRat(finalX)}\ ,\ y = ${texRat(finalY)}
\qquad \boxed{(x, y) = \left(${texRat(finalX)},\ ${texRat(finalY)}\right)}
      `) },
    ];
  },[a1,b1,c1,a2,b2,c2]);

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">ステップ {step+1}/5</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.max(0,s-1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.min(4,s+1))}>次へ</button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-3 min-h-[240px]">
        <div className="text-sm text-gray-600">{slides[step].title}</div>
        <KaTeXBlock tex={slides[step].body} />
      </div>

      <div className="grid md:grid-cols-6 gap-3">
        <label className="text-sm">a₁<NumInput value={a1} onChange={setA1} /></label>
        <label className="text-sm">b₁<NumInput value={b1} onChange={setB1} /></label>
        <label className="text-sm">c₁<NumInput value={c1} onChange={setC1} /></label>
        <label className="text-sm">a₂<NumInput value={a2} onChange={setA2} /></label>
        <label className="text-sm">b₂<NumInput value={b2} onChange={setB2} /></label>
        <label className="text-sm">c₂<NumInput value={c2} onChange={setC2} /></label>
      </div>
    </div>
  );
}
