// src/components/animations/RationalizeStepper.tsx
'use client';

import { useMemo, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv, negRat,
  texRat, normalizeTeXSigns,
} from '@/lib/tex/format';

type Mode = 'simple' | 'poly2';

type Props = {
  mode?: Mode;
  // simple
  p?: number; q?: number;
  // poly2（分子・分母とも最大2項の根号: √d と √e）
  r?: number; s?: number; t?: number; d?: number; e?: number;
  u?: number; v?: number; w?: number;
};

/* ---------- 基本ヘルパ ---------- */
const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;
const absRat = (r: Rat): Rat => {
  const s = simplifyFrac(r.n, r.d);
  return { n: Math.abs(s.n), d: s.d };
};
const isOneAbs = (r: Rat) => {
  const a = absRat(r);
  return a.n === 1 && a.d === 1;
};
const igcd = (a:number,b:number) => { a=Math.abs(a); b=Math.abs(b); while(b){const t=b; b=a%b; a=t;} return a||1; };
const ilcm = (a:number,b:number) => a===0||b===0 ? Math.abs(a*b) : Math.abs(a/igcd(a,b))*Math.abs(b);
const eqRat = (x: Rat, y: Rat) => isZero(simplifyFrac(x.n*y.d - y.n*x.d, x.d*y.d));

/* ---------- 表示ヘルパ（根号をきれいに出す：±1省略・0項除去） ---------- */
const texSqrtLead = (coef: Rat, rad: Rat) => {
  if (isZero(coef)) return '';
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const body = isOneAbs(coef) ? '' : texRat(absRat(coef));
  return `${sign}${body}\\sqrt{${texRat(rad)}}`.trim();
};
const texSqrtMid = (coef: Rat, rad: Rat) => {
  if (isZero(coef)) return '';
  const s = simplifyFrac(coef.n, coef.d);
  const pm = s.n < 0 ? '- ' : '+ ';
  const body = isOneAbs(coef) ? '' : texRat(absRat(coef));
  return `${pm}${body}\\sqrt{${texRat(rad)}}`;
};
const texConstLead = (c: Rat) => {
  if (isZero(c)) return '';
  const s = simplifyFrac(c.n, c.d);
  const sign = s.n < 0 ? '- ' : '';
  return `${sign}${texRat(absRat(c))}`.trim();
};
const texConstMid = (c: Rat) => {
  if (isZero(c)) return '';
  const s = simplifyFrac(c.n, c.d);
  const pm = s.n < 0 ? '- ' : '+ ';
  return `${pm}${texRat(absRat(c))}`;
};

/* ---------- a + b√d + c√e を連結（0/±1 省略） ---------- */
function texPolySqrt3(A: Rat, B: Rat, dR: Rat, C: Rat, eR: Rat) {
  const chunks: string[] = [];
  const cA = texConstLead(A);
  if (cA) chunks.push(cA);
  const sB = chunks.length ? texSqrtMid(B, dR) : texSqrtLead(B, dR);
  if (sB) chunks.push(sB);
  const sC = chunks.length ? texSqrtMid(C, eR) : texSqrtLead(C, eR);
  if (sC) chunks.push(sC);
  return chunks.length ? normalizeTeXSigns(chunks.join(' ')) : '0';
}
function texConstPlusSqrt(A: Rat, B: Rat, R: Rat) {
  const cA = texConstLead(A);
  const sB = cA ? texSqrtMid(B, R) : texSqrtLead(B, R);
  if (cA && sB) return normalizeTeXSigns(`${cA} ${sB}`);
  if (cA) return normalizeTeXSigns(cA);
  if (sB) return normalizeTeXSigns(sB);
  return '0';
}

/* ---------- √d * √e = √(de) の基数 ---------- */
const mulSqrtRad = (rad1: Rat, rad2: Rat) => ratMul(rad1, rad2);

/* ---------- (a + b√d + c√e) * (A + B√d + C√e) を 1,√d,√e,√(de) の基底で返す ---------- */
function mulPolySqrt3(
  a: Rat, b: Rat, dR: Rat, c: Rat, eR: Rat,
  A: Rat, B: Rat,     _d: Rat, C: Rat,     _e: Rat
) {
  const const1 = ratAdd(ratMul(a, A),
                   ratAdd(ratMul(ratMul(b, B), dR),
                          ratMul(ratMul(c, C), eR)));
  const sqrt_d  = ratAdd(ratMul(a, B), ratMul(b, A));
  const sqrt_e  = ratAdd(ratMul(a, C), ratMul(c, A));
  const sqrt_de = ratAdd(ratMul(b, C), ratMul(c, B));
  return { const1, sqrt_d, sqrt_e, sqrt_de };
}

/* ---------- 2段目で使う U = u^2 - v^2 d - w^2 e ---------- */
const denomU = (u: Rat, v: Rat, dR: Rat, w: Rat, eR: Rat) => {
  const u2  = ratMul(u, u);
  const vd2 = ratMul(ratMul(v, v), dR);
  const we2 = ratMul(ratMul(w, w), eR);
  return ratSub(ratSub(u2, vd2), we2);
};

/* ---------- 分子(4係数)と分母を“同時に”約分（最大公約数で割る） ---------- */
function reduceWhole(
  coeffs: Rat[], // [A, B, C, D] for 1, √d, √e, √(de)
  den: Rat
) {
  const dens = coeffs.map(r => simplifyFrac(r.n, r.d).d).concat(simplifyFrac(den.n, den.d).d);
  let L = 1;
  for (const d of dens) L = ilcm(L, d);

  const ints = coeffs.map(r => {
    const s = simplifyFrac(r.n, r.d);
    return s.n * (L / s.d);
  });
  const denInt = simplifyFrac(den.n, den.d);
  const denScaled = denInt.n * (L / denInt.d);

  let G = Math.abs(denScaled);
  for (const n of ints) G = igcd(G, Math.abs(n));
  if (G === 0) G = 1;

  const sign = denScaled < 0 ? -1 : 1;

  const outCoeffs = ints.map(n => simplifyFrac(sign * (n / G), L / G));
  const outDen    = simplifyFrac(sign * (denScaled / G), 1);

  return { outCoeffs, outDen };
}

/* ---------- 分子＝分母の「恒等1」チェック（0/±1 省略後の係数で厳密比較） ---------- */
function equalPoly3(
  r: Rat, s: Rat, t: Rat, dR: Rat, eR: Rat,
  u: Rat, v: Rat, w: Rat, dR2: Rat, eR2: Rat
) {
  return eqRat(r,u) && eqRat(s,v) && eqRat(t,w) && eqRat(dR,dR2) && eqRat(eR,eR2);
}

export default function RationalizeStepper({
  mode: mode0 = 'simple',
  p: p0 = 1, q: q0 = 2,
  r: r0 = 1, s: s0 = 1, t: t0 = 0, d: d0 = 2, e: e0 = 3,
  u: u0 = 1, v: v0 = 1, w: w0 = 0,
}: Props) {
  const [mode, setMode] = useState<Mode>(mode0);
  const [p, setP] = useState(p0);
  const [q, setQ] = useState(q0);
  const [r, setR] = useState(r0);
  const [s, setS] = useState(s0);
  const [t, setT] = useState(t0);
  const [d, setD] = useState(d0);
  const [e, setE] = useState(e0);
  const [u, setU] = useState(u0);
  const [v, setV] = useState(v0);
  const [w, setW] = useState(w0);

  const slides = useMemo(() => {
    if (mode === 'simple') {
      const pR = toRat(p);
      const qR = toRat(q);

      if (isZero(qR) || simplifyFrac(qR.n, qR.d).n < 0) {
        return [{ title: 'バリデーション', body: String.raw`\text{分母の }q\text{ は }q>0\text{ が必要です。 }q=${texRat(qR)}`}];
      }

      const t0 = normalizeTeXSigns(String.raw`\dfrac{${texRat(pR)}}{\sqrt{${texRat(qR)}}}`);
      const t1 = normalizeTeXSigns(String.raw`\text{分子・分母に } \sqrt{${texRat(qR)}} \text{ を掛ける}`);

      const num = isZero(pR)
        ? '0'
        : (isOneAbs(pR)
            ? normalizeTeXSigns(String.raw`\sqrt{${texRat(qR)}}`)
            : normalizeTeXSigns(String.raw`${texRat(pR)}\sqrt{${texRat(qR)}}`));

      const denRat = simplifyFrac(qR.n, qR.d);
      const t2 = (denRat.d === 1 && denRat.n === 1)
        ? normalizeTeXSigns(String.raw`${num}`)
        : normalizeTeXSigns(String.raw`\dfrac{${num}}{${texRat(denRat)}}`);

      return [{ title: '元の形', body: t0 }, { title: '操作', body: t1 }, { title: '有理化', body: t2 }];
    }

    const rR = toRat(r), sR = toRat(s), tR = toRat(t);
    const dR = toRat(d), eR = toRat(e);
    const uR = toRat(u), vR = toRat(v), wR = toRat(w);

    // まずは「分子＝分母なら恒等的に 1」を最優先で判定
    if (equalPoly3(rR,sR,tR,dR,eR, uR,vR,wR, dR,eR)) {
      return [{ title: '恒等的に 1', body: normalizeTeXSigns(String.raw`1`) }];
    }

    if (isZero(dR) || simplifyFrac(dR.n, dR.d).n < 0 || isZero(eR) || simplifyFrac(eR.n, eR.d).n < 0) {
      return [{ title: 'バリデーション', body: String.raw`\text{ }d>0,\ e>0\text{ が必要です。 }d=${texRat(dR)},\ e=${texRat(eR)}`}];
    }
    if (isZero(uR) && isZero(vR) && isZero(wR)) {
      return [{ title: 'バリデーション', body: String.raw`\text{分母 }(u+v\sqrt{d}+w\sqrt{e})\text{ が }0\text{ になっています。 }u,v,w\text{ を調整してください。}`}];
    }

    const num0 = texPolySqrt3(rR, sR, dR, tR, eR);
    const den0 = texPolySqrt3(uR, vR, dR, wR, eR);
    const t0 = normalizeTeXSigns(String.raw`\dfrac{${num0}}{${den0}}`);

    const conj1Str = texPolySqrt3(uR, negRat(vR), dR, negRat(wR), eR);
    const t1 = normalizeTeXSigns(String.raw`\text{分子・分母に } \left(${conj1Str}\right) \text{ を掛ける}`);

    const num1 = mulPolySqrt3(rR, sR, dR, tR, eR, uR, negRat(vR), dR, negRat(wR), eR);

    const U  = denomU(uR, vR, dR, wR, eR);
    const S  = mulSqrtRad(dR, eR);
    const two= { n: 2, d: 1 };
    const vw = ratMul(vR, wR);
    const coefS = ratMul(two, vw);

    const conj2Str = texConstPlusSqrt(U, coefS, S);
    const t2 = normalizeTeXSigns(String.raw`\text{さらに分子・分母に } \left(${conj2Str}\right) \text{ を掛ける}`);

    const A = num1.const1, B = num1.sqrt_d, C = num1.sqrt_e, D = num1.sqrt_de;
    const N2_const = ratAdd(ratMul(A, U), ratMul(ratMul(coefS, D), S));
    const N2_d     = ratAdd(ratMul(B, U), ratMul(ratMul(coefS, C), eR));
    const N2_e     = ratAdd(ratMul(C, U), ratMul(ratMul(coefS, B), dR));
    const N2_S     = ratAdd(ratMul(D, U), ratMul(coefS, A));

    const den2 = ratSub(ratMul(U, U), ratMul(ratMul(coefS, coefS), S));

    const { outCoeffs, outDen } = reduceWhole([N2_const, N2_d, N2_e, N2_S], den2);
    const [R_const, R_d, R_e, R_S] = outCoeffs;

    const num2Tex =
      texPolySqrt3(R_const, R_d, dR, R_e, eR) +
      (isZero(R_S) ? '' :
        normalizeTeXSigns(
          `${(isZero(R_const)&&isZero(R_d)&&isZero(R_e))?'':' '}`
          + `${simplifyFrac(R_S.n, R_S.d).n<0?'- ':'+ '}${texRat(absRat(R_S))}\\sqrt{${texRat(S)}}`
        )
      );

    const outDenS = simplifyFrac(outDen.n, outDen.d);
    const t3 = (outDenS.d === 1 && outDenS.n === 1)
      ? normalizeTeXSigns(String.raw`${num2Tex}`)
      : normalizeTeXSigns(String.raw`\dfrac{${num2Tex}}{${texRat(outDenS)}}`);

    return [
      { title: '元の形', body: t0 },
      { title: '1段目：共役を掛ける', body: t1 },
      { title: '2段目：もう一つの共役を掛ける', body: t2 },
      { title: '完全有理化（最終形・約分済み）', body: t3 },
    ];
  }, [mode, p, q, r, s, t, d, e, u, v, w]);

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">分母の有理化 — ステップ {slides.length>0?1:0}/{slides.length}</h2>
        <div className="flex gap-2">
          <button className={`px-3 py-1 rounded-lg border ${mode==='simple'?'bg-gray-900 text-white':''}`} onClick={()=>setMode('simple')}>単項根</button>
          <button className={`px-3 py-1 rounded-lg border ${mode==='poly2'?'bg-gray-900 text-white':''}`} onClick={()=>setMode('poly2')}>二項根（最大2項）</button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 space-y-3 min-h-[260px]">
        {slides.map((s, i)=>(
          <div key={i}>
            <div className="text-sm text-gray-600">{s.title}</div>
            <KaTeXBlock tex={s.body} />
          </div>
        ))}
      </div>

      {mode === 'simple' ? (
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm">p<NumInput value={p} onChange={setP} /></label>
          <label className="text-sm">q（&gt;0）<NumInput value={q} onChange={setQ} /></label>
        </div>
      ) : (
        <div className="grid md:grid-cols-7 gap-3">
          <label className="text-sm">r<NumInput value={r} onChange={setR} /></label>
          <label className="text-sm">s（√d の係数）<NumInput value={s} onChange={setS} /></label>
          <label className="text-sm">t（√e の係数）<NumInput value={t} onChange={setT} /></label>
          <label className="text-sm">d（&gt;0）<NumInput value={d} onChange={setD} /></label>
          <label className="text-sm">e（&gt;0）<NumInput value={e} onChange={setE} /></label>
          <label className="text-sm">u<NumInput value={u} onChange={setU} /></label>
          <label className="text-sm">v（√d の係数）<NumInput value={v} onChange={setV} /></label>
          <label className="text-sm">w（√e の係数）<NumInput value={w} onChange={setW} /></label>
        </div>
      )}

      <div className="text-xs text-gray-500">
        ※ 係数は分数入力（例：<code>-5/2</code>）も可。表示は常に分数（整数/整数）。±1 は省略、0項は表示されません。<br/>
        ※ 二項根は分子・分母ともに √d と √e の 2 項まで対応。必要になれば分子と分母で異なる平方根にも拡張できます。
      </div>
    </div>
  );
}
