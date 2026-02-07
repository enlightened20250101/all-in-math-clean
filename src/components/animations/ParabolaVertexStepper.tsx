// src/components/animations/ParabolaVertexStepper.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  ratMul, ratAdd, ratSub, ratDiv, negRat,
  texRat, normalizeTeXSigns,
  texLinearLead,
} from '@/lib/tex/format';

// JSXGraph はクライアントのみ
const JXG = typeof window !== 'undefined' ? require('jsxgraph') : null;

const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;

/** 係数 × ( ... ) を先頭用に整形（±1省略、二重カッコを避ける） */
const texCoeffTimesParenLead = (coef: Rat, innerTeX: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  return normalizeTeXSigns(`${sign}${coeff}\\left(${innerTeX}\\right)`);
};

/** a * (squareExpr) 先頭用（squareExpr は "(x±p)^2" 等） */
const texCoeffTimesSquareLead = (coef: Rat, squareExpr: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  return normalizeTeXSigns(`${sign}${coeff}${squareExpr}`);
};

/** (x ± p)^2 の p を既約で整形（±1省略、0なら x^2） */
const texShiftSquare = (p: Rat) => {
  const s = simplifyFrac(p.n, p.d);
  if (s.n === 0) return 'x^2';
  const sign = s.n < 0 ? '-' : '+';
  const abs = { n: Math.abs(s.n), d: s.d };
  return normalizeTeXSigns(`(x ${sign} ${texRat(abs)})^2`);
};

export default function ParabolaVertexStepper() {
  // 頂点形 f(x) = a(x+p)^2 + q
  const [a, setA] = useState<number>(1);
  const [p, setP] = useState<number>(-1);  // 頂点座標は V(-p, q)
  const [q, setQ] = useState<number>(0);

  // 接点Pの x 座標（入力で指定、ドラッグでも更新）
  const [xPx, setXPx] = useState<number>(0);

  const [step, setStep] = useState(0);
  const [canDragVertex, setCanDragVertex] = useState<boolean>(false);

  // 表示トグル
  const [showP, setShowP] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [showNormal, setShowNormal] = useState(true);
  const [showEquations, setShowEquations] = useState(true);

  // 接線・法線の式
  const [tanTex, setTanTex] = useState<string>('');
  const [norTex, setNorTex] = useState<string>('');

  // 代数表示（分数で統一・±1省略・0項除去）
  const { titles, views, aRat, pRat, qRat } = useMemo(() => {
    const aR = toRat(a), pR = toRat(p), qR = toRat(q);

    if (isZero(aR)) {
      return {
        titles: ['バリデーション', '代替案'],
        views: [
          normalizeTeXSigns(String.raw`\textbf{検査対象}\quad f(x)=a(x+p)^2+q \ \Rightarrow\ a=0`),
          normalizeTeXSigns(String.raw`\text{a を 0 以外に設定してください（二次ではありません）。}`)
        ],
        aRat: aR, pRat: pR, qRat: qR
      };
    }

    // 展開形の係数：b = -2ap, c = q + ap^2
    const bR = ratMul(negRat(ratMul({ n: 2, d: 1 }, aR)), pR);
    const cR = ratAdd(qR, ratMul(aR, ratMul(pR, pR)));

    // 0) 展開形: ax^2 + bx + c
    const t0 = texLinearLead(
      [{ coeff: aR, varName: 'x^2' }, { coeff: bR, varName: 'x' }],
      cR
    );

    // 1) 頂点形: a(x+p)^2 + q
    const square = texShiftSquare(pR);
    const t1 = normalizeTeXSigns(
      `${texCoeffTimesSquareLead(aR, square)}${isZero(qR) ? '' : ` ${qR.n>=0?'+ ':''}${texRat(qR)}`}`
    );

    // 2) 頂点座標 V(-p,q)
    const t2 = normalizeTeXSigns(String.raw`\text{頂点 }V(-p, q) = \left(-${texRat(pR)},\ ${texRat(qR)}\right)`);

    return {
      titles: ['展開形', '頂点形', '頂点座標'],
      views : [t0, t1, t2],
      aRat  : aR, pRat: pR, qRat: qR
    };
  }, [a, p, q]);

  const total = views.length;

  // ===== Graph (JSXGraph) =====
  const boardRef = useRef<any>(null);
  const objsRef  = useRef<any>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('parabola-board');
    if (!el) return;

    let brd = boardRef.current;
    if (!brd) {
      brd = JXG.JSXGraph.initBoard('parabola-board', {
        boundingbox: [-8, 8, 8, -8],
        axis: true,
        showNavigation: false,
        keepaspectratio: true,
      });
      boardRef.current = brd;

      // f(x) = a(x+p)^2 + q
      const curve = brd.create('functiongraph', [
        (x: number) => {
          const A = objsRef.current._a ?? 1;
          const Pparam = objsRef.current._p ?? 0;
          const Q = objsRef.current._q ?? 0;
          return A * (x + Pparam) * (x + Pparam) + Q;
        }
      ], { strokeColor: '#111', strokeWidth: 2 });

      // 頂点 V（編集トグルで fixed 切替）
      const V = brd.create('point', [0, 0], {
        name: 'V', size: 4, strokeColor: '#c00', fillColor: '#c00', fixed: true
      });

      // 曲線上の glider P
      const P = brd.create('glider', [0, 0, curve], {
        name: 'P', size: 3, strokeColor: '#06c', fillColor: '#06c', visible: true
      });

      // 接線/法線 用の補助点と線
      const Tdir = brd.create('point', [0,0], { visible: false });
      const TLine = brd.create('line', [P, Tdir], { strokeColor: '#0a0', dash: 2, visible: true });

      const Ndir = brd.create('point', [0,0], { visible: false });
      const NLine = brd.create('line', [P, Ndir], { strokeColor: '#06c', dash: 1, visible: true });

      objsRef.current = { curve, V, P, Tdir, TLine, Ndir, NLine, _a: 1, _p: 0, _q: 0 };

      const onResize = () => {
        const bb = brd.getBoundingBox();
        const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
        const half = Math.max((bb[2] - bb[0]) / 2, (bb[1] - bb[3]) / 2);
        brd.setBoundingBox([cx - half, cy + half, cx + half, cy - half], true);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  // 接線・法線・式の再計算（P の位置から）
  const refreshLinesAndEquations = useCallback(() => {
    if (!boardRef.current) return;
    const brd = boardRef.current;
    const { P, Tdir, TLine, Ndir, NLine } = objsRef.current;

    const A = objsRef.current._a ?? 1;
    const Pparam = objsRef.current._p ?? 0;
    const Q = objsRef.current._q ?? 0;

    const xP = P.X(), yP = P.Y();
    // 接線の傾き m = f'(xP) = 2a(xP + p)
    const m = 2 * A * (xP + Pparam);

    // 接線方向補助
    Tdir.setPosition(JXG.COORDS_BY_USER, [xP + 1, yP + m]);

    // 法線方向補助（m=0 なら垂直）
    if (Math.abs(m) < 1e-12) {
      Ndir.setPosition(JXG.COORDS_BY_USER, [xP, yP + 1]);
    } else {
      const n = -1 / m;
      Ndir.setPosition(JXG.COORDS_BY_USER, [xP + 1, yP + n]);
    }

    // 可視切替
    P.setAttribute({ visible: showP });
    TLine.setAttribute({ visible: showTangent });
    NLine.setAttribute({ visible: showNormal });

    brd.update();

    // 式（分数で）
    if (!showEquations) {
      setTanTex('');
      setNorTex('');
      return;
    }
    const mR  = toRat(m);
    const xRR = toRat(xP);
    const yRR = toRat(yP);

    // 接線: y = m x + b
    const bR  = toRat(yP - m * xP);
    const tanEq = normalizeTeXSigns(String.raw`y = ${texRat(mR)}x ${bR.n>=0?'+ ':''}${texRat(bR)}`);

    // 法線
    let norEq = '';
    if (Math.abs(m) < 1e-12) {
      norEq = normalizeTeXSigns(String.raw`x = ${texRat(xRR)}`);
    } else {
      const nR = toRat(-1 / m);
      const bN = toRat(yP - (-1 / m) * xP);
      norEq = normalizeTeXSigns(String.raw`y = ${texRat(nR)}x ${bN.n>=0?'+ ':''}${texRat(bN)}`);
    }
    setTanTex(tanEq);
    setNorTex(norEq);
  }, [showEquations, showNormal, showP, showTangent]);

  // パラメータ変更時：内部値更新＆Vを移動。Pは xPx に従って曲線上へ
  useEffect(() => {
    if (!boardRef.current) return;

    const aNum = aRat.n / aRat.d, pNum = pRat.n / pRat.d, qNum = qRat.n / qRat.d;
    objsRef.current._a = aNum;
    objsRef.current._p = pNum;
    objsRef.current._q = qNum;

    const { V } = objsRef.current;
    V.setAttribute({ fixed: !canDragVertex });
    V.setPosition(JXG.COORDS_BY_USER, [-pNum, qNum]);

    // xPx の位置に P を移動（曲線上に拘束）
    const yAtXP = aNum * (xPx + pNum) * (xPx + pNum) + qNum;
    objsRef.current.P.moveTo([xPx, yAtXP], 0);

    refreshLinesAndEquations();
  }, [aRat, pRat, qRat, canDragVertex, xPx, refreshLinesAndEquations]);

  // 頂点 V ドラッグ → p,q 更新（編集ON のときのみ）
  useEffect(() => {
    if (!boardRef.current) return;
    const { V } = objsRef.current || {};
    if (!V) return;

    const onDrag = () => {
      if (!canDragVertex) return;
      const x = V.X(), y = V.Y(); // V = (-p, q)
      setP(-x);
      setQ(y);
    };
    V.off && V.off('drag');
    V.on && V.on('drag', onDrag);
  }, [canDragVertex]);

  // P ドラッグ → xPx を同期（式も更新）
  useEffect(() => {
    if (!boardRef.current) return;
    const { P } = objsRef.current || {};
    if (!P) return;
    const onDrag = () => {
      setXPx(P.X());
      refreshLinesAndEquations();
    };
    P.off && P.off('drag');
    P.on && P.on('drag', onDrag);
  }, [showP, showTangent, showNormal, showEquations, refreshLinesAndEquations]);

  return (
    <div className="space-y-6">
      {/* Algebra steps */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <div>ステップ {step + 1}/{titles.length} — {titles[step]}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.max(0, s - 1))}>戻る</button>
            <button className="px-3 py-1 rounded-lg border" onClick={() => setStep(s => Math.min(titles.length - 1, s + 1))}>次へ</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[180px]">
          {views.map((v, i) => (
            <div key={i} className={`absolute inset-0 transition-all duration-500 ${step === i ? 'opacity-100' : 'opacity-0'}`}>
              <KaTeXBlock tex={v} />
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-gray-600 mb-2">グラフ（頂点 V と glider P、接線・法線）</div>
        <div id="parabola-board" className="w-full aspect-square rounded-xl border bg-white" />
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={canDragVertex} onChange={e=>setCanDragVertex(e.target.checked)} />
            頂点Vをドラッグして編集
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showP} onChange={e=>setShowP(e.target.checked)} />
            点P（曲線上のglider）を表示
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showTangent} onChange={e=>setShowTangent(e.target.checked)} />
            接線を表示
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showNormal} onChange={e=>setShowNormal(e.target.checked)} />
            法線を表示
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={showEquations} onChange={e=>setShowEquations(e.target.checked)} />
            接線・法線の式を表示
          </label>
        </div>
      </div>

      {/* Equations */}
      {showEquations && (
        <div className="rounded-xl border p-4 bg-white space-y-2">
          <div className="text-sm text-gray-600">接線/法線の式（点Pを通る）</div>
          <div>{tanTex && <KaTeXBlock tex={tanTex} />}</div>
          <div>{norTex && <KaTeXBlock tex={norTex} />}</div>
        </div>
      )}

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white grid md:grid-cols-4 gap-3">
        <label className="text-sm">a（二次の係数）
          <NumInput value={a} onChange={setA} />
        </label>
        <label className="text-sm">p（頂点形 a(x+p)^2+q の p）
          <NumInput value={p} onChange={setP} />
        </label>
        <label className="text-sm">q（頂点形 a(x+p)^2+q の q）
          <NumInput value={q} onChange={setQ} />
        </label>
        <label className="text-sm">xₚ（接点Pの x 座標）
          <NumInput value={xPx} onChange={setXPx} />
        </label>
      </div>

      <div className="text-xs text-gray-500">
        ※ 表示は分数（整数/整数）で統一、±1 は省略、0項は表示されません。<br/>
        ※ a=0 は二次式ではないため警告表示になります。<br/>
        ※ glider P は常に曲線上のみドラッグ可能、V はトグルON時のみ編集可能（その際は関数を頂点形で再定義）。<br/>
        ※ xₚ を編集すると、P は曲線上のその x に即座に移動します（Y は f(xₚ) に自動設定）。
      </div>
    </div>
  );
}
