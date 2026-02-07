// src/components/animations/SystemSolveStepper.tsx
'use client';

import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv, negRat,
  texRat, normalizeTeXSigns,
  texVarLead, texVarMid,
} from '@/lib/tex/format';

type Props = {
  a1?: number; b1?: number; c1?: number;
  a2?: number; b2?: number; c2?: number;
};

function lcmInt(a: number, b: number) {
  const A = Math.abs(a), B = Math.abs(b);
  const g = (x: number, y: number): number => (y ? g(y, x % y) : x);
  if (A === 0 && B === 0) return 1;
  if (A === 0) return B;
  if (B === 0) return A;
  return (A / g(A, B)) * B;
}
const lcm3 = (a: number, b: number, c: number) => lcmInt(lcmInt(a, b), c);
const denOf = (r: Rat) => Math.abs(r.d || 1);
const numOf = (r: Rat) => r.n;
const mulInt = (r: Rat, k: number): Rat => simplifyFrac(r.n * k, r.d);
const divInt = (r: Rat, k: number): Rat => simplifyFrac(r.n, r.d * k);

export default function SystemSolveStepper(initial: Props) {
  const [a1, setA1] = useState(initial.a1 ?? 1);
  const [b1, setB1] = useState(initial.b1 ?? 1);
  const [c1, setC1] = useState(initial.c1 ?? 5);
  const [a2, setA2] = useState(initial.a2 ?? 1);
  const [b2, setB2] = useState(initial.b2 ?? -1);
  const [c2, setC2] = useState(initial.c2 ?? 1);
  const [step, setStep] = useState(0); // 0..4

  const slides = useMemo(() => {
    // 0) 入力を厳密分数へ
    const A = toRat(a1), B = toRat(b1), C = toRat(c1);
    const D = toRat(a2), E = toRat(b2), F = toRat(c2);

    // 1) 分母を払って整数化
    const L1 = lcm3(denOf(A), denOf(B), denOf(C));
    const L2 = lcm3(denOf(D), denOf(E), denOf(F));
    const Ai = ratMul(A, { n: L1, d: 1 });
    const Bi = ratMul(B, { n: L1, d: 1 });
    const Ci = ratMul(C, { n: L1, d: 1 });
    const Di = ratMul(D, { n: L2, d: 1 });
    const Ei = ratMul(E, { n: L2, d: 1 });
    const Fi = ratMul(F, { n: L2, d: 1 });

    // 2) 各式のGCDで約分（最簡比）
    const g = (x: number, y: number): number => (y ? g(y, x % y) : Math.abs(x) || 1);
    const g1 = g(g(Math.abs(numOf(Ai)), Math.abs(numOf(Bi))), Math.abs(numOf(Ci)));
    const g2 = g(g(Math.abs(numOf(Di)), Math.abs(numOf(Ei))), Math.abs(numOf(Fi)));
    let A0 = divInt(Ai, g1), B0 = divInt(Bi, g1), C0 = divInt(Ci, g1);
    let D0 = divInt(Di, g2), E0 = divInt(Ei, g2), F0 = divInt(Fi, g2);

    // 先頭係数が負なら -1 を掛けて整形
    if (A0.n < 0) { A0 = negRat(A0); B0 = negRat(B0); C0 = negRat(C0); }
    if (D0.n < 0) { D0 = negRat(D0); E0 = negRat(E0); F0 = negRat(F0); }

    // 3) 消去する変数を自動選択（少ない係数倍）
    const Lx = lcmInt(Math.abs(A0.n), Math.abs(D0.n)) || 1;
    const Ly = lcmInt(Math.abs(B0.n), Math.abs(E0.n)) || 1;
    const costX = (Lx / Math.max(1, Math.abs(A0.n))) + (Lx / Math.max(1, Math.abs(D0.n)));
    const costY = (Ly / Math.max(1, Math.abs(B0.n))) + (Ly / Math.max(1, Math.abs(E0.n)));
    const eliminate: 'x' | 'y' = (costY < costX) ? 'y' : 'x';

    // 倍数（符号調整込み）— 計算は m1,m2 そのまま使う／表示は abs と ± を分離
    let m1 = { n: 1, d: 1 }, m2 = { n: 1, d: 1 };
    if (eliminate === 'x') {
      const k1 = Lx / Math.max(1, Math.abs(A0.n));
      const k2 = Lx / Math.max(1, Math.abs(D0.n));
      m1 = { n: k1 * Math.sign(D0.n), d: 1 };
      m2 = { n: -k2 * Math.sign(A0.n), d: 1 };
    } else {
      const k1 = Ly / Math.max(1, Math.abs(B0.n));
      const k2 = Ly / Math.max(1, Math.abs(E0.n));
      m1 = { n: k1 * Math.sign(E0.n), d: 1 };
      m2 = { n: -k2 * Math.sign(B0.n), d: 1 };
    }
    const m1abs = { n: Math.abs(m1.n), d: m1.d };
    const m2abs = { n: Math.abs(m2.n), d: m2.d };
    const op = (m2.n >= 0) ? '+' : '−'; // 表示用の演算子（加算/減算）

    // 倍数後（計算用：符号付き）
    const A1 = ratMul(A0, m1), B1 = ratMul(B0, m1), C1 = ratMul(C0, m1);
    const A2 = ratMul(D0, m2), B2 = ratMul(E0, m2), C2 = ratMul(F0, m2);

    // 表示用：括弧内は |m1|, |m2| を掛けた式をそのまま（減算は括弧の外で表現）
    const A1p = ratMul(A0, m1abs), B1p = ratMul(B0, m1abs), C1p = ratMul(C0, m1abs);
    const A2p = ratMul(D0, m2abs), B2p = ratMul(E0, m2abs), C2p = ratMul(F0, m2abs);

    // 加算（計算結果）
    const A_sum = ratAdd(A1, A2);
    const B_sum = ratAdd(B1, B2);
    const C_sum = ratAdd(C1, C2);

    // 解
    let xR: Rat, yR: Rat;
    if (eliminate === 'x') {
      yR = ratDiv(C_sum, B_sum);
      xR = ratDiv(ratSub(C0, ratMul(B0, yR)), A0);
    } else {
      xR = ratDiv(C_sum, A_sum);
      yR = ratDiv(ratSub(C0, ratMul(A0, xR)), B0);
    }

    // 連立の1枚：先頭は texVarLead、途中は texVarMid で + / - を必ず明示
    const sys = (AA: Rat, BB: Rat, CC: Rat, DD: Rat, EE: Rat, FF: Rat) => normalizeTeXSigns(String.raw`
\left\{
\begin{aligned}
  ${texVarLead(AA,'x')} ${texVarMid(BB,'y')} &= ${texRat(CC)} \\
  ${texVarLead(DD,'x')} ${texVarMid(EE,'y')} &= ${texRat(FF)}
\end{aligned}
\right.
    `);

    // 「掛けて加算/減算」の1枚（≒括弧外で ± を表し、括弧内は |m| 倍の式）
    const combineBody = normalizeTeXSigns(String.raw`
\begin{aligned}
  &(${texVarLead(A1p,'x')} ${texVarMid(B1p,'y')})\ ${op}\ (${texVarLead(A2p,'x')} ${texVarMid(B2p,'y')}) \\
  &= ${texRat(C1p)}\ ${op}\ ${texRat(C2p)}
\end{aligned}
\Rightarrow\ ${eliminate === 'x' ? `${texRat(B_sum)}y` : `${texRat(A_sum)}x`} = ${texRat(C_sum)}
    `);

    return [
      {
        title: '入力（分数化前）',
        body: sys(toRat(a1), toRat(b1), toRat(c1), toRat(a2), toRat(b2), toRat(c2)),
      },
      {
        title: `分母を払って整数化：式(1)に ${L1}、式(2)に ${L2}`,
        body: sys(Ai, Bi, Ci, Di, Ei, Fi),
      },
      {
        title: '各式の最大公約数で約分（最も簡単な整数比）',
        body: sys(A0, B0, C0, D0, E0, F0),
      },
      {
        title: `${(op === '+') ? (eliminate === 'x' ? 'x を消去（加法）' : 'y を消去（加法）')
                            : (eliminate === 'x' ? 'x を消去（減法）' : 'y を消去（減法）')}：式(1)に ${texRat(m1abs)}、式(2)に ${(op === '+') ? '+ ' : '− '}${texRat(m2abs)} を掛けて ${op === '+' ? '加算' : '減算'}`,
        body: combineBody,
      },
      {
        title: '解を求める',
        body: normalizeTeXSigns(
          eliminate === 'x'
            ? String.raw`y = ${texRat(yR)}\quad,\quad x = \dfrac{${texRat(C0)} - ${texRat(B0)}\cdot ${texRat(yR)}}{${texRat(A0)}} = ${texRat(xR)}
\qquad \boxed{(x, y) = \left(${texRat(xR)},\ ${texRat(yR)}\right)}`
            : String.raw`x = ${texRat(xR)}\quad,\quad y = \dfrac{${texRat(C0)} - ${texRat(A0)}\cdot ${texRat(xR)}}{${texRat(B0)}} = ${texRat(yR)}
\qquad \boxed{(x, y) = \left(${texRat(xR)},\ ${texRat(yR)}\right)}`
        ),
      },
    ];
  }, [a1, b1, c1, a2, b2, c2]);

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">ステップ {step + 1}/5</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.max(0, s - 1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.min(4, s + 1))}>次へ</button>
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
