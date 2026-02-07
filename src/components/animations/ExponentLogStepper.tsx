// src/components/animations/ExponentLogStepper.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import {
  type Rat,
  toRat, simplifyFrac,
  texRat, normalizeTeXSigns,
} from '@/lib/tex/format';

// JSXGraph はクライアントのみ
const JXG = typeof window !== 'undefined' ? require('jsxgraph') : null;

const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;
const isOne  = (r: Rat) => { const s=simplifyFrac(r.n,r.d); return s.n===1 && s.d===1; };
const isPos  = (r: Rat) => simplifyFrac(r.n, r.d).n > 0;

/** a を数値に：toRat → fraction → numeric */
const toNum = (r: Rat) => {
  const s = simplifyFrac(r.n, r.d);
  return s.n / s.d;
};

// 0 を下回らないようにする（log の定義域確保）
const clampPositive = (x: number, eps=1e-6) => (x > eps ? x : eps);

export default function ExponentLogStepper() {
  // 底 a（>0, a≠1）
  const [a, setA] = useState<number>(2);

  // 点Q（指数側）の x 座標
  const [xQ, setXQ] = useState<number>(1);

  // 点Q'（対数側）の x 座標（要 x>0）
  const [xQp, setXQp] = useState<number>(1);

  // 表示トグル
  const [showLog, setShowLog] = useState<boolean>(true);
  const [showMirror, setShowMirror] = useState<boolean>(true);
  const [showPoint, setShowPoint] = useState<boolean>(true);
  const [showEquations, setShowEquations] = useState<boolean>(true);

  const [step, setStep] = useState(0);

  // ===== 代数表示（性質・定義・鏡映） =====
  const algebra = useMemo(() => {
    const aR = toRat(a);
    // a>0, a≠1 のバリデーション
    if (!isPos(aR) || isOne(aR)) {
      const cond = normalizeTeXSigns(String.raw`\text{底 }a \text{ は } a>0,\ a\neq1 \text{ が必要です。 現在 } a=${texRat(aR)}`);
      return {
        valid: false,
        titles: ['バリデーション'],
        views: [cond],
        aR,
      };
    }

    // 性質・定義
    const law1 = normalizeTeXSigns(String.raw`a^{x+y} = a^x a^y,\quad a^{x-y} = \dfrac{a^x}{a^y},\quad (a^x)^y = a^{xy}`);
    const law2 = normalizeTeXSigns(String.raw`\log_a(xy)=\log_a x + \log_a y,\quad \log_a\!\left(\dfrac{x}{y}\right)=\log_a x - \log_a y,\quad \log_a(x^k)=k\log_a x`);
    const def  = normalizeTeXSigns(String.raw`\text{指数 }y=a^x \ (a>0,a\neq1);\quad \text{対数 }y=\log_a x \ (x>0)`);
    const inv  = normalizeTeXSigns(String.raw`y=a^x \ \text{と}\ y=\log_a x \ \text{は直線 }y=x\ \text{に関して鏡映}`);

    const titles = ['指数の性質', '対数の性質', '定義・変域', '鏡映関係'];
    const views  = [law1, law2, def, inv];

    return { valid: true, titles, views, aR };
  }, [a]);

  // ===== Graph (JSXGraph) =====
  const boardRef = useRef<any>(null);
  const objsRef  = useRef<any>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('exp-log-board');
    if (!el) return;

    let brd = boardRef.current;
    if (!brd) {
      brd = JXG.JSXGraph.initBoard('exp-log-board', {
        boundingbox: [-6, 6, 6, -6],
        axis: true,
        showNavigation: false,
        keepaspectratio: true,
      });
      boardRef.current = brd;

      // y = a^x
      const exp = brd.create('functiongraph', [
        (x: number) => {
          const A = objsRef.current._a ?? 2;
          return Math.pow(A, x);
        }
      ], { strokeColor: '#111', strokeWidth: 2 });

      // y = log_a x（ドメイン x>0）
      const log = brd.create('functiongraph', [
        (x: number) => {
          const A = objsRef.current._a ?? 2;
          if (x <= 0) return NaN;
          return Math.log(x) / Math.log(A);
        }
      ], { strokeColor: '#c00', strokeWidth: 2, visible: true });

      // y = x（鏡映ライン）
      const mirror = brd.create('line', [[0,0],[1,1]], { strokeColor: '#999', dash: 2, visible: true, name: 'y=x' });

      // Q on y = a^x
      const Q = brd.create('glider', [1, 2, exp], { name: 'Q', size: 3, strokeColor: '#06c', fillColor: '#06c', visible: true });
      // Q' on y = log_a x（glider）
      const Qp = brd.create('glider', [1, 0, log], { name: "Q'", size: 3, strokeColor: '#c00', fillColor: '#c00', visible: true });

      objsRef.current = { exp, log, mirror, Q, Qp, _a: 2 };

      const onResize = () => {
        const bb = brd.getBoundingBox();
        const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
        const half = Math.max((bb[2] - bb[0]) / 2, (bb[1] - bb[3]) / 2);
        brd.setBoundingBox([cx-half, cy+half, cx+half, cy-half], true);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  // 表示トグル反映
  const refreshVisibility = useCallback(() => {
    if (!boardRef.current) return;
    const { log, mirror, Q, Qp } = objsRef.current;
    log.setAttribute({ visible: showLog });
    mirror.setAttribute({ visible: showMirror });
    Q.setAttribute({ visible: showPoint });
    Qp.setAttribute({ visible: showPoint && showLog }); // 対数非表示なら Q' も消す
    boardRef.current.update();
  }, [showLog, showMirror, showPoint]);

  // a, xQ, xQp の変化 → Q/Q' 位置更新
  useEffect(() => {
    if (!boardRef.current) return;
    const brd = boardRef.current;

    const A = Math.max(1e-9, Math.abs(a)); // a>0 保証
    objsRef.current._a = A;

    // Q（指数）
    const { Q, Qp } = objsRef.current;
    const yQ = Math.pow(A, xQ);
    Q.moveTo([xQ, yQ], 0);

    // Q'（対数）… xQp を採用、ドメイン確保
    const xLp = clampPositive(xQp);
    const yLp = Math.log(xLp) / Math.log(A);
    Qp.moveTo([xLp, yLp], 0);

    refreshVisibility();
    brd.update();
  }, [a, xQ, xQp, refreshVisibility]);

  // Q ドラッグ → xQ の同期
  useEffect(() => {
    if (!boardRef.current) return;
    const { Q } = objsRef.current || {};
    if (!Q) return;
    const onDrag = () => setXQ(Q.X());
    Q.off && Q.off('drag');
    Q.on && Q.on('drag', onDrag);
  }, []);

  // Q' ドラッグ → xQp の同期
  useEffect(() => {
    if (!boardRef.current) return;
    const { Qp } = objsRef.current || {};
    if (!Qp) return;
    const onDrag = () => setXQp(Qp.X());
    Qp.off && Qp.off('drag');
    Qp.on && Qp.on('drag', onDrag);
  }, []);

  return (
    <div className="space-y-6">
      {/* Algebra */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
          <div>ステップ {step + 1}/{algebra.titles.length} — {algebra.titles[step]}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.max(0,s-1))}>戻る</button>
            <button className="px-3 py-1 rounded-lg border" onClick={()=>setStep(s=>Math.min(algebra.titles.length-1,s+1))}>次へ</button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-white p-6 min-h-[180px]">
          {!algebra.valid ? (
            <div className="text-red-600 text-sm">
              <KaTeXBlock tex={algebra.views[0]} />
            </div>
          ) : (
            algebra.views.map((v, i) => (
              <div key={i} className={`absolute inset-0 transition-all duration-500 ${step === i ? 'opacity-100' : 'opacity-0'}`}>
                <KaTeXBlock tex={v} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Graph */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="text-sm text-gray-600 mb-2">
          指数（黒）・対数（赤）・鏡映線（灰）
        </div>
        <div id="exp-log-board" className="w-full aspect-square rounded-xl border bg-white" />
        {!algebra.valid && (
          <div className="mt-2 text-xs text-red-600">
            底 a は <code>{String.raw`a>0, a\neq 1`}</code> にしてください。
          </div>
        )}
      </div>

      {/* Equations (optional) */}
      {showEquations && algebra.valid && (
        <div className="rounded-xl border p-4 bg-white space-y-2">
          <div className="text-sm text-gray-600">補足</div>
          <KaTeXBlock tex={normalizeTeXSigns(String.raw`a=${texRat(algebra.aR)}\ \Rightarrow\ y=a^x\ \text{は }${toNum(algebra.aR)>1?String.raw`\text{増加関数}`:String.raw`\text{減少関数}`}`)} />
          <KaTeXBlock tex={normalizeTeXSigns(String.raw`\text{定義域： }a^x:\ \mathbb{R},\ \ \log_a x:\ (0,\infty)\quad \text{値域： }a^x:\ (0,\infty),\ \ \log_a x:\ \mathbb{R}`)} />
        </div>
      )}

      {/* Controls */}
      <div className="rounded-xl border p-4 bg-white grid md:grid-cols-6 gap-3">
        <label className="text-sm">底 a（a&gt;0, a≠1）
          <NumInput value={a} onChange={setA} />
        </label>
        <label className="text-sm">点Qの x 座標（指数）
          <NumInput value={xQ} onChange={setXQ} />
        </label>
        <label className="text-sm">点Q&apos;の x 座標（対数；x&gt;0）
          <NumInput value={xQp} onChange={(v)=>setXQp(clampPositive(v))} />
        </label>

        <label className="flex items-center gap-2 text-sm col-span-2">
          <input type="checkbox" checked={showLog} onChange={e=>setShowLog(e.target.checked)} />
          <span>対数 <code>{String.raw`y=\log_a x`}</code> を表示</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showMirror} onChange={e=>setShowMirror(e.target.checked)} />
          <span>鏡映線 <code>{String.raw`y=x`}</code> を表示</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showPoint} onChange={e=>setShowPoint(e.target.checked)} />
          点Q / Q&apos; を表示
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showEquations} onChange={e=>setShowEquations(e.target.checked)} />
          補足テキストを表示
        </label>
      </div>

      <div className="text-xs text-gray-500">
        ※ 底 a の入力は分数でもOK（表示は常に分数）。±1 は省略、0は表示しません。<br/>
        ※ 点Q は指数グラフ上のみ、点Q&apos; は対数グラフ上のみドラッグ可能（入力の x も同期更新）。<br/>
        ※ a≤0 / a=1 のときはバリデーション表示になります。
      </div>
    </div>
  );
}
