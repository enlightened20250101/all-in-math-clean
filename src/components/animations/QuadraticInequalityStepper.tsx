// src/components/animations/QuadraticInequalityStepper.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv,
  texRat, normalizeTeXSigns, texLinearLead,
  texFracWithPosDen, sqrtAsCoefRad, negRat, isOneAbs,
} from '@/lib/tex/format';

// JSXGraph はクライアントのみ
const JXG = typeof window !== 'undefined' ? require('jsxgraph') : null;

const isZeroRat = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;
const isZero    = isZeroRat;
const signOf = (r: Rat) => {
  const s = simplifyFrac(r.n, r.d);
  return s.n === 0 ? 0 : (s.n > 0 ? 1 : -1);
};

/* --- ルートを「分母正・可能なら約分済み」で返す --- */
/*  k===1（√Dが純有理）なら完全に割り算まで実行し texRat で返す。
    k>1 なら (-b ± coef√k)/(2a) を「二項の共通因子」で約分し、分母正で分数表示。 */
function rootFormulaTexReduced(aR: Rat, bR: Rat, D_Rat: Rat, pm: '+' | '-') {
  const two = { n: 2, d: 1 };
  const denom = ratMul(two, aR);              // 2a
  const { coef, k } = sqrtAsCoefRad(D_Rat);   // √D = coef * √k（kは整数）

  if (k === 1) {
    // 純有理 → 分子を有理数で合成してから完全に割る
    const minusB = negRat(bR);                       // -b
    const numR   = (pm === '+') ? ratAdd(minusB, coef) : ratSub(minusB, coef);
    const r      = ratDiv(numR, denom);              // texRat が既約・分母正を保証
    return texRat(r);
  }

  // √D が残る：(-b ± coef√k)/(2a) を、二項・分母で“共通因子”約分（整数化→gcd）
  const L = lcmMany([bR.d, coef.d, denom.d]);
  let B = bR.n * (L / bR.d);      // -b の分子側にするので先に符号反転
  B = -B;
  let C = coef.n * (L / coef.d);
  let D = denom.n * (L / denom.d);

  let g = gcdMany([Math.abs(B), Math.abs(C), Math.abs(D)]);
  if (g === 0) g = 1;
  B /= g; C /= g; D /= g; // 共通因子で割る
  // 分母は正に統一
  if (D < 0) { B = -B; C = -C; D = -D; }

  const Bred: Rat = simplifyFrac(B, L);  // B/L
  const Cred: Rat = simplifyFrac(C, L);  // C/L
  const Dred: Rat = simplifyFrac(D, L);  // D/L  …この分母を付ける

  // 分子テキスト（±1 の省略、0係数除去はここで調整）
  const Btex = isZero(Bred) ? '' : texRat(Bred);
  const Cabs = simplifyFrac(Math.abs(Cred.n), Cred.d);
  const Ctex = isOneAbs(Cred) ? '' : texRat(Cabs);

  const op = (pm === '+') ? '+ ' : '- ';
  const sqrtTerm = `\\sqrt{${k}}`;
  let numTex = '';
  if (Btex) {
    numTex = `${Btex} ${op}${Ctex}${sqrtTerm}`;
  } else {
    // B が 0 のときは ±coef√k のみ
    numTex = (pm === '+') ? `${Ctex}${sqrtTerm}` : `-${Ctex}${sqrtTerm}`;
    numTex = numTex.replace(/^-\s*$/, '-1').replace(/^\+\s*$/, '1'); // 念のため
  }
  numTex = normalizeTeXSigns(numTex.replace(/\s+/g, ' '));

  // 分母1なら分子だけ
  const Dsimp = simplifyFrac(Dred.n, Dred.d);
  if (Dsimp.d === 1 && Dsimp.n === 1) return numTex;
  return texFracWithPosDen(numTex, Dred);
}
const gcd = (a:number,b:number)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a||1;};
const gcdMany = (xs:number[]) => xs.reduce((g,x)=>gcd(g,x),0);
const lcm = (a:number,b:number)=> (a===0||b===0)?Math.abs(a*b):Math.abs(a/gcd(a,b))*Math.abs(b);
const lcmMany = (xs:number[]) => xs.reduce((L,x)=>lcm(L,x),1);

/* ===== コンポーネント ===== */
export default function QuadraticInequalityStepper() {
  // f(x) = ax^2 + bx + c
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(-2);
  const [c, setC] = useState<number>(-3);

  // 不等式の種類： >, >=, <, <=
  const [comp, setComp] = useState<'gt'|'ge'|'lt'|'le'>('gt');

  const [step, setStep] = useState(0);

  /* ===== 代数（分数統一・±1省略・0項除去・分母正・平方根簡約） ===== */
  const algebra = useMemo(() => {
    const aR = toRat(a), bR = toRat(b), cR = toRat(c);

    // a=0 → 二次不等式ではない
    if (isZero(aR)) {
      return {
        valid: false,
        titles: ['バリデーション', '代替案'],
        views: [
          normalizeTeXSigns(String.raw`\textbf{検査対象}\quad ax^2 + bx + c \ \Rightarrow\ a=0`),
          normalizeTeXSigns(String.raw`\text{a を 0 以外に設定してください（二次不等式ではありません）。}`)
        ],
        aR, bR, cR,
        D_R: { n: 0, d: 1 },
        interval: String.raw`\varnothing`,
        rootsTex: '',
      };
    }

    const poly = texLinearLead(
      [{ coeff: aR, varName: 'x^2' }, { coeff: bR, varName: 'x' }],
      cR
    );

    // 判別式 D = b^2 - 4ac
    const b2 = ratMul(bR, bR);
    const four = { n: 4, d: 1 };
    const fourac = ratMul(four, ratMul(aR, cR));
    const D_R = ratSub(b2, fourac);
    const Dsign = signOf(D_R);
    const aSign = signOf(aR);

    // ルートと範囲（TeX）
    let rootsTex = '';
    let interval = '';

    // D と a の符号による分岐
    if (Dsign > 0) {
      // 2解
      const r1 = rootFormulaTexReduced(aR, bR, D_R, '-');
      const r2 = rootFormulaTexReduced(aR, bR, D_R, '+');
      rootsTex = normalizeTeXSigns(String.raw`r_1 = ${r1}\ ,\ \ r_2 = ${r2}`);

      // （表示は r1<r2 だが、式は文字列なのでそのまま配置）
      // comp ごとに端点の含みを変更
      if (comp === 'gt' || comp === 'ge') {
        if (aSign > 0) {
          interval = (comp === 'gt')
            ? normalizeTeXSigns(String.raw`(-\infty,\ ${r1})\ \cup\ (${r2},\ \infty)`)
            : normalizeTeXSigns(String.raw`(-\infty,\ ${r1}]\ \cup\ [${r2},\ \infty)`);
        } else {
          interval = (comp === 'gt')
            ? normalizeTeXSigns(String.raw`(${r1},\ ${r2})`)
            : normalizeTeXSigns(String.raw`[${r1},\ ${r2}]`);
        }
      } else { // lt / le
        if (aSign > 0) {
          interval = (comp === 'lt')
            ? normalizeTeXSigns(String.raw`(${r1},\ ${r2})`)
            : normalizeTeXSigns(String.raw`[${r1},\ ${r2}]`);
        } else {
          interval = (comp === 'lt')
            ? normalizeTeXSigns(String.raw`(-\infty,\ ${r1})\ \cup\ (${r2},\ \infty)`)
            : normalizeTeXSigns(String.raw`(-\infty,\ ${r1}]\ \cup\ [${r2},\ \infty)`);
        }
      }
    } else if (Dsign === 0) {
      // 重解 r = -b/2a
      const two = { n: 2, d: 1 };
      const r = ratDiv({ n: -bR.n, d: bR.d }, ratMul(two, aR));
      rootsTex = normalizeTeXSigns(String.raw`r = \dfrac{-${texRat(bR)}}{2\cdot ${texRat(aR)}} = ${texRat(r)}`);

      if (aSign > 0) {
        // a>0: f(x) >= 0 : ℝ、 f(x) > 0 : ℝ\{r}、 f(x) <= 0 : {r}、 f(x) < 0 : ∅
        interval = (comp === 'ge') ? String.raw`\mathbb{R}`
                 : (comp === 'gt') ? normalizeTeXSigns(String.raw`(-\infty,\ ${texRat(r)})\ \cup\ (${texRat(r)},\ \infty)`)
                 : (comp === 'le') ? normalizeTeXSigns(String.raw`\{\,${texRat(r)}\,\}`)
                 : String.raw`\varnothing`;
      } else {
        // a<0: f(x) <= 0 : ℝ、 f(x) < 0 : ℝ\{r}、 f(x) >= 0 : {r}、 f(x) > 0 : ∅
        interval = (comp === 'le') ? String.raw`\mathbb{R}`
                 : (comp === 'lt') ? normalizeTeXSigns(String.raw`(-\infty,\ ${texRat(r)})\ \cup\ (${texRat(r)},\ \infty)`)
                 : (comp === 'ge') ? normalizeTeXSigns(String.raw`\{\,${texRat(r)}\,\}`)
                 : String.raw`\varnothing`;
      }
    } else {
      // 実数解なし：f の符号は a の符号に一致
      if (aSign > 0) {
        interval = (comp === 'gt' || comp === 'ge') ? String.raw`\mathbb{R}` : String.raw`\varnothing`;
      } else {
        interval = (comp === 'lt' || comp === 'le') ? String.raw`\mathbb{R}` : String.raw`\varnothing`;
      }
      rootsTex = String.raw`\text{実数解なし（ }D<0\text{ ）}`;
    }

    const compTex = (comp==='gt')? '>' : (comp==='ge')? '\\ge 0' : (comp==='lt')? '<' : '\\le 0';
    const titles = ['元の式', '判別式', '解の公式', `範囲（ f(x) ${compTex} ）`];
    const views  = [
      normalizeTeXSigns(String.raw`${poly}`),
      normalizeTeXSigns(String.raw`D = b^2 - 4ac = ${texRat(b2)} - 4\cdot ${texRat(aR)}\cdot ${texRat(cR)} = ${texRat(D_R)}`),
      rootsTex,
      interval,
    ];
    return { valid: true, titles, views, aR, bR, cR, D_R, comp };
  }, [a, b, c, comp]);

  /* ===== グラフ（JSXGraph） ===== */
  const boardRef = useRef<any>(null);
  const objsRef  = useRef<any>({});

  // 帯を塗る（strict/inclusive の端点はポイントの塗りつぶしで表現）
  const updateBands = useCallback(() => {
    const brd = boardRef.current;
    if (!brd) return;
    const { bands } = objsRef.current;
    (bands || []).forEach((poly: any) => { try { brd.removeObject(poly); } catch {} });
    objsRef.current.bands = [];

    if (!algebra.valid) { brd.update(); return; }

    const aNum = algebra.aR.n / algebra.aR.d;
    const bNum = algebra.bR.n / algebra.bR.d;
    const cNum = algebra.cR.n / algebra.cR.d;
    const Dnum = bNum*bNum - 4*aNum*cNum;

    const bb = brd.getBoundingBox(); // [xmin, ymax, xmax, ymin]
    const Xmin = bb[0], Xmax = bb[2];
    const bandH = 0.25;

    const rect = (xL: number, xR: number, color: string) => {
      if (!Number.isFinite(xL) || !Number.isFinite(xR)) return;
      if (xR <= xL) return;
      const poly = brd.create('polygon', [
        [xL, bandH], [xR, bandH], [xR, -bandH], [xL, -bandH]
      ], { borders: { strokeColor: color, strokeOpacity: 0.3 }, fillColor: color, fillOpacity: 0.15, withLines: false });
      objsRef.current.bands.push(poly);
    };

    const { R1, R2 } = objsRef.current;
    R1.setAttribute({ visible: false });
    R2.setAttribute({ visible: false });

    // 端点の塗りつぶし（inclusive：黒丸、strict：白丸）
    const setEndpointStyle = (pt: any, inclusive: boolean) => {
      pt.setAttribute({ visible: true });
      pt.setAttribute({ fillColor: inclusive ? '#c00' : '#fff' });
      pt.setAttribute({ strokeColor: '#c00' });
    };

    if (Dnum > 0) {
      let r1 = (-bNum - Math.sqrt(Dnum)) / (2*aNum);
      let r2 = (-bNum + Math.sqrt(Dnum)) / (2*aNum);
      if (r1 > r2) [r1, r2] = [r2, r1];

      const isLowerInc = (algebra.comp === 'ge' && aNum > 0) || (algebra.comp === 'le' && aNum < 0);
      const isUpperInc = isLowerInc;

      R1.moveTo([r1, 0], 0); setEndpointStyle(R1, isLowerInc);
      R2.moveTo([r2, 0], 0); setEndpointStyle(R2, isUpperInc);

      if (algebra.comp === 'gt' || algebra.comp === 'ge') {
        if (aNum > 0) { rect(Xmin, r1, '#c00'); rect(r2, Xmax, '#c00'); }
        else           { rect(r1,  r2, '#c00'); }
      } else {
        if (aNum > 0) { rect(r1,  r2, '#06c'); }
        else           { rect(Xmin, r1, '#06c'); rect(r2, Xmax, '#06c'); }
      }
    } else if (Math.abs(Dnum) < 1e-14) {
      const r = -bNum / (2*aNum);
      const inclusive =
        (algebra.comp === 'ge' && aNum > 0) || (algebra.comp === 'le' && aNum < 0) ||
        (algebra.comp === 'le' && aNum > 0) === false && (algebra.comp === 'ge' && aNum < 0) === false
          ? false : false; // 端点可視は下で分岐

      // a>0 のとき：ge → ℝ（帯は全体）、gt → 両側、le → {r}（点のみ）、lt → ∅
      if (aNum > 0) {
        if (algebra.comp === 'ge') {
          rect(Xmin, Xmax, '#c00'); R1.setAttribute({ visible:false });
        } else if (algebra.comp === 'gt') {
          rect(Xmin, r, '#c00'); rect(r, Xmax, '#c00'); setEndpointStyle(R1, false); R1.moveTo([r,0],0);
        } else if (algebra.comp === 'le') {
          R1.moveTo([r,0],0); setEndpointStyle(R1, true);
        } else { // lt
          // 何もしない（空集合）
        }
      } else {
        // a<0：le → ℝ、lt → 両側、ge → {r}、gt → ∅
        if (algebra.comp === 'le') {
          rect(Xmin, Xmax, '#06c'); R1.setAttribute({ visible:false });
        } else if (algebra.comp === 'lt') {
          rect(Xmin, r, '#06c'); rect(r, Xmax, '#06c'); setEndpointStyle(R1, false); R1.moveTo([r,0],0);
        } else if (algebra.comp === 'ge') {
          R1.moveTo([r,0],0); setEndpointStyle(R1, true);
        } else {
          // 何もしない（空集合）
        }
      }
    } else { // Dnum < 0
      if (aNum > 0) {
        if (algebra.comp === 'gt' || algebra.comp === 'ge') { rect(Xmin, Xmax, '#c00'); }
      } else {
        if (algebra.comp === 'lt' || algebra.comp === 'le') { rect(Xmin, Xmax, '#06c'); }
      }
    }

    brd.update();
  }, [algebra]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('qi-board');
    if (!el) return;

    let brd = boardRef.current;
    if (!brd) {
      brd = JXG.JSXGraph.initBoard('qi-board', {
        boundingbox: [-8, 6, 8, -6],
        axis: true,
        showNavigation: false,
        keepaspectratio: true,
      });
      boardRef.current = brd;

      const curve = brd.create('functiongraph', [
        (x: number) => {
          const A = objsRef.current._a ?? 1;
          const B = objsRef.current._b ?? 0;
          const C = objsRef.current._c ?? 0;
          return A * x * x + B * x + C;
        }
      ], { strokeColor: '#111', strokeWidth: 2 });

      const R1 = brd.create('point', [0,0], { name: 'r₁', size: 3, strokeColor: '#c00', fillColor: '#fff', visible: false });
      const R2 = brd.create('point', [0,0], { name: 'r₂', size: 3, strokeColor: '#c00', fillColor: '#fff', visible: false });

      objsRef.current = { curve, R1, R2, bands: [], _a: 1, _b: 0, _c: 0 };

      const onResize = () => updateBands();
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, [updateBands]);

  // パラメータ変更 → 曲線・帯更新
  useEffect(() => {
    if (!boardRef.current) return;
    const brd = boardRef.current;

    const aNum = algebra.aR.n / algebra.aR.d;
    const bNum = algebra.bR.n / algebra.bR.d;
    const cNum = algebra.cR.n / algebra.cR.d;
    objsRef.current._a = aNum;
    objsRef.current._b = bNum;
    objsRef.current._c = cNum;

    updateBands();
    brd.update();
  }, [algebra, updateBands]);

  /* ===== UI ===== */
  return (
    <div className="space-y-6">
      {/* Algebra steps */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <div>ステップ {step + 1}/{algebra.titles.length} — {algebra.titles[step]}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.max(0, s - 1))}>戻る</button>
            <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.min(algebra.titles.length - 1, s + 1))}>次へ</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[180px]">
          {algebra.views.map((v, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-500 ${step === i ? 'opacity-100' : 'opacity-0'}`}>
              <KaTeXBlock tex={v} />
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-gray-600 mb-2">
          グラフ（赤：f(x)≻0、青：f(x)≺0） — 比較： 
          <select
            className="ml-2 rounded border px-2 py-1 text-sm"
            value={comp}
            onChange={e=>setComp(e.target.value as any)}
          >
            <option value="gt"> &gt; 0 </option>
            <option value="ge"> ≥ 0 </option>
            <option value="lt"> &lt; 0 </option>
            <option value="le"> ≤ 0 </option>
          </select>
        </div>
        <div id="qi-board" className="w-full aspect-square rounded-xl border bg-white" />
        {!algebra.valid && (
          <div className="mt-2 text-xs text-red-600">a=0 のため二次不等式ではありません。a を 0 以外にしてください。</div>
        )}
      </div>

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white grid md:grid-cols-3 gap-3">
        <label className="text-sm">a<NumInput value={a} onChange={setA} /></label>
        <label className="text-sm">b<NumInput value={b} onChange={setB} /></label>
        <label className="text-sm">c<NumInput value={c} onChange={setC} /></label>
      </div>

      <div className="text-xs text-gray-500">
        ※ 数式は分数（整数/整数）で統一、±1 は省略、0項は表示されません。<br/>
        ※ 判別式に応じて範囲の記述が自動分岐します（<code>{String.raw`\mathbb{R}`}</code> / <code>{String.raw`\varnothing`}</code> を含む）。<br/>
        ※ グラフの塗りは x 軸付近の帯で範囲を強調表示しています。端点の含みは点（白丸/黒丸）で区別しています。
      </div>
    </div>
  );
}
