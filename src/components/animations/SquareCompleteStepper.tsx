// src/components/animations/SquareCompleteStepper.tsx
'use client';
import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  // 有理演算 & TeX 整形
  texRat, toRat, ratMul, ratDiv, ratSub, normalizeTeXSigns,
  texShiftSquare, simplifyFrac, type Rat,
  // 変数項/定数の表示（±1省略、±の明示、0項除去）
  texVarLead, texVarMid, texConstMid, texLinearLead
} from '@/lib/tex/format';

// 0 判定（format.ts に isZeroRat があればそれを使ってOK）
const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;

// 係数 × ( … ) をきれいに出す（先頭用）
// 例:  2,(inner)  → "2(inner)"
//      1,(inner)  → "(inner)"
//     -1,(inner)  → "- (inner)"
//   -3/2,(inner)  → "- 3/2(inner)"
const texCoeffTimesParenLead = (coef: Rat, innerTeX: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  // 先頭なので + は出さない。二重カッコを避けるため outer を付けない
  return `${sign}${coeff}\\left(${innerTeX}\\right)`.replace(/^\s+/, '').trim()
                 .replace(/\)\s*\\left\(/g, ')(') // 念のため "(...)\left(" が続いたら "(...)(" に
                 .replace(/^\+ /, '');
};

// 係数 × squareExpr (squareExpr = "(x±p)^2" など、すでに括弧を含む) を先頭で出す
// 例:  2 * "(x+1/4)^2"  → "2(x+1/4)^2"
//      1 * "(x+1/4)^2"  → "(x+1/4)^2"
//     -1 * "(x+1/4)^2"  → "- (x+1/4)^2"
const texCoeffTimesSquareLead = (coef: Rat, squareExpr: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  return `${sign}${coeff}${squareExpr}`.trim().replace(/^\+ /, '');
};

type Props = { a?: number; b?: number; c?: number };

export default function SquareCompleteStepper({ a: a0 = 1, b: b0 = 6, c: c0 = 5 }: Props) {
  const [a, setA] = useState(a0);
  const [b, setB] = useState(b0);
  const [c, setC] = useState(c0);
  const [step, setStep] = useState(0);

  const { views, titles } = useMemo(() => {
    const aR = toRat(a);
    const bR = toRat(b);
    const cR = toRat(c);

    // a = 0 は二次式ではない → バリデーション表示
    if (isZero(aR)) {
      const left = texLinearLead([{ coeff: bR, varName: 'x' }], cR); // "bx + c"（0項省略、±1省略）
      return {
        titles: ['バリデーション：二次係数 a = 0 は不可', '代替案'],
        views: [
          normalizeTeXSigns(String.raw`\textbf{検査対象}\quad ax^2 + bx + c \ \Rightarrow\ a=0 \ \Rightarrow\ ${left}`),
          normalizeTeXSigns(String.raw`\text{a を 0 以外に設定してください（二次でなくなります）。}`)
        ],
      };
    }

    // ---- 平方完成の手順 ----

    // 0) 元の式：ax^2 + bx + c  （0項除去、±1省略）
    const t0 = texLinearLead(
      [{ coeff: aR, varName: 'x^2' }, { coeff: bR, varName: 'x' }],
      cR
    );

    // 1) ax^2 + bx を a で括る： a( x^2 + (b/a) x ) + c
    const b_over_a = ratDiv(bR, aR);
    const inside1  = texLinearLead(
      [{ coeff: { n: 1, d: 1 }, varName: 'x^2' }, { coeff: b_over_a, varName: 'x' }]
    );
    // a が ±1 のときは係数を省略した "( ... )" のみにする
    const t1 = normalizeTeXSigns(
      texCoeffTimesParenLead(aR, inside1) + (isZero(cR) ? '' : ` ${cR.n>=0?'+ ':''}${texRat(cR)}`)
    );

    // 2) 括弧内で「足して引く」： a[ x^2 + (b/a)x + (b/2a)^2 ] + c − a (b/2a)^2
    const two  = { n: 2, d: 1 };
    const four = { n: 4, d: 1 };
    const p    = ratDiv(bR, ratMul(two, aR));             // p = b / (2a)
    const ap2  = ratMul(aR, ratMul(p, p));                // a p^2 = a*(b/2a)^2 = b^2/(4a)
    const inside2 = texLinearLead(
      [
        { coeff: { n: 1, d: 1 }, varName: 'x^2' },
        { coeff: b_over_a, varName: 'x' }
      ],
    );
    const inside2plus = normalizeTeXSigns(`${inside2} + \\left(${texRat(p)}\\right)^2`);
    // 右側： c - a p^2
    const right2 = normalizeTeXSigns(`${texRat(cR)} ${ap2.n>=0?'- ':'+ '}${texRat(absRat(ap2))}`);
    const t2 = normalizeTeXSigns(`${texCoeffTimesParenLead(aR, inside2plus)} + ${right2}`);

    // 3) (x + p)^2 に畳み込み： a(x+p)^2 + (c - a p^2)
    const squarePart = texShiftSquare('x', p.n, p.d);     // "(x ± p)^2"
    const constR     = ratSub(cR, ap2);                   // c - a p^2
    // 二重カッコを避けるため、a*( ... )^2 を "a(... )^2" の形で
    const leadSquare = texCoeffTimesSquareLead(aR, squarePart);
    const t3 = normalizeTeXSigns(
      `${leadSquare}${isZero(constR) ? '' : ` ${constR.n>=0?'+ ':''}${texRat(constR)}`}`
    );

    return {
      titles: ['元の式', 'a で一次の項まで括る', '足して引く（平方完成の準備）', '完成形（平方完成）'],
      views: [t0, t1, t2, t3],
    };
  }, [a, b, c]);

  const total = views.length;

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>ステップ {step + 1}/{total} — {titles[step]}</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.max(0, s - 1))}>戻る</button>
          <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.min(total - 1, s + 1))}>次へ</button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[220px]">
        {views.map((v, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-500 ${step === i ? 'opacity-100' : 'opacity-0'}`}>
            <KaTeXBlock tex={v} />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">a（二次の係数）
          <NumInput value={a} onChange={setA} />
        </label>
        <label className="text-sm">b（一次の係数）
          <NumInput value={b} onChange={setB} />
        </label>
        <label className="text-sm">c（定数項）
          <NumInput value={c} onChange={setC} />
        </label>
      </div>

      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <div>※ a = 0 は二次式ではないため、バリデーション表示になります。</div>
        <div>※ 係数は分数入力（例：<code>3/2</code>）もできます。表示はすべて分数（整数/整数）に統一しています。</div>
      </div>
    </div>
  );
}

// 補助: 絶対値 Rat
function absRat(r: Rat): Rat {
  const s = simplifyFrac(r.n, r.d);
  return { n: Math.abs(s.n), d: s.d };
}
