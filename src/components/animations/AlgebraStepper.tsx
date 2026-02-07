// src/components/animations/AlgebraStepper.tsx
'use client';
import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  Rat, toRat, texRat, texLinearLead,
  ratSub, ratDiv, simplifyFrac
} from '@/lib/tex/format';

type Props = { a?: number; b?: number; c?: number };

// 0 判定のユーティリティ（format.ts に isZeroRat がなければローカルで）
const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;

export default function AlgebraStepper({ a: a0=2, b: b0=3, c: c0=11 }: Props) {
  const [a,setA]=useState(a0), [b,setB]=useState(b0), [c,setC]=useState(c0);
  const [step,setStep]=useState(0);

  const { views, labels } = useMemo(() => {
    // 厳密分数へ
    const A: Rat = toRat(a);
    const B: Rat = toRat(b);
    const C: Rat = toRat(c);

    // a = 0 のときは一次方程式ではない（0x + b = c）
    if (isZero(A)) {
      const eq = `${texRat(B)} = ${texRat(C)}`;
      const ident = isZero(ratSub(C, B)); // b=c ?
      const msg = ident
        ? String.raw`\text{恒等式：任意の }x\text{ で成り立つ}`
        : String.raw`\text{矛盾：解なし（ }${texRat(B)} \neq ${texRat(C)}\text{ ）}`;
      return {
        labels: ['バリデーション（一次方程式ではありません）', '判定'],
        views: [
          String.raw`\textbf{検査対象}:\quad ${eq}`,
          msg
        ],
      };
    }

    // ここから通常の一次方程式：ax + b = c
    // ステップ1: ax + b = c  （左辺は 0項排除・±1 を省略）
    const left0 = texLinearLead([{ coeff: A, varName: 'x' }], B);
    const t0 = `${left0} = ${texRat(C)}`;

    // ステップ2: ax = c - b
    const CminusB = ratSub(C, B);
    const left1 = texLinearLead([{ coeff: A, varName: 'x' }]); // "ax"
    const t1 = `${left1} = ${texRat(C)} - ${texRat(B)} \\ = \\ ${texRat(CminusB)}`;

    // ステップ3: x = (c - b) / a   （未約分→既約分）
    const X = ratDiv(CminusB, A);
    const t2 = `x = \\dfrac{${texRat(CminusB)}}{${texRat(A)}} \\ = \\ ${texRat(X)}`;

    // ステップ4: 解
    const t3 = `x = ${texRat(X)}`;

    return {
      labels: ['元の方程式', 'b を右辺へ移項', 'a で両辺を割る', '解を表示'],
      views: [t0, t1, t2, t3],
    };
  }, [a,b,c]);

  const total = views.length;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <div>ステップ {step+1}/{total} — {labels[step]}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg border"
              onClick={()=>setStep(s=>Math.max(0,s-1))}
            >戻る</button>
            <button
              className="px-3 py-1 rounded-lg border"
              onClick={()=>setStep(s=>Math.min(total-1,s+1))}
            >次へ</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[220px]">
          {views.map((v, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-500 ${step===i?'opacity-100':'opacity-0'}`}>
              <KaTeXBlock tex={v} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="text-sm font-semibold mb-2">パラメータ（分数保持＋矢印微調整対応）</div>
        <label className="block text-sm">a<NumInput value={a} onChange={setA} /></label>
        <label className="block text-sm mt-3">b<NumInput value={b} onChange={setB} /></label>
        <label className="block text-sm mt-3">c<NumInput value={c} onChange={setC} /></label>
      </div>
    </div>
  );
}
