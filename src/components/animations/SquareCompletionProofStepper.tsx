'use client';

import React, { useEffect, useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, curve, dashed, point, fitFromPoints } from '@/components/graphs/jxgUtils';

// 分数＆TeX整形（既存の format.ts）
import {
  texRat, toRat, ratMul, ratDiv, ratSub, normalizeTeXSigns,
  texShiftSquare, simplifyFrac, type Rat,
  texLinearLead
} from '@/lib/tex/format';

type Goal = 'vertex'|'min'|'form';
type Props = { a?: number; b?: number; c?: number; goal?: Goal; initialStep?: number };

type State = {
  a: number; b: number; c: number; goal: Goal;
  step: number;        // 0..3
  anim: boolean; t: number; // 0..1
};

const clamp = (x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
const isZero = (r: Rat) => simplifyFrac(r.n, r.d).n === 0;

// 先頭： a×(…)（a=±1は省略）
const texCoeffTimesParenLead = (coef: Rat, innerTeX: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  return normalizeTeXSigns(`${sign}${coeff}\\left(${innerTeX}\\right)`);
};
// 先頭： a×(x±p)^2
const texCoeffTimesSquareLead = (coef: Rat, squareExpr: string) => {
  const s = simplifyFrac(coef.n, coef.d);
  const sign = s.n < 0 ? '- ' : '';
  const absn = Math.abs(s.n), absd = s.d;
  const coeff = (absn === 1 && absd === 1) ? '' : texRat({ n: absn, d: absd });
  return normalizeTeXSigns(`${sign}${coeff}${squareExpr}`);
};
const lerp = (a:number,b:number,t:number)=> a + (b-a)*t;

export default function SquareCompletionProofStepper(p: Props) {
  const [s,setS] = useState<State>({
    a: p.a ?? 1,
    b: p.b ?? 6,
    c: p.c ?? 5,
    goal: p.goal ?? 'vertex',
    step: clamp(p.initialStep ?? 0, 0, 3),
    anim: false,
    t: 0,
  });
  const set = (patch: Partial<State>)=>setS(v=>({ ...v, ...patch }));

  // --- 有理数系 ---
  const aR = useMemo(()=>toRat(s.a), [s.a]);
  const bR = useMemo(()=>toRat(s.b), [s.b]);
  const cR = useMemo(()=>toRat(s.c), [s.c]);
  const invalid = isZero(aR);

  const b_over_a = useMemo(()=> ratDiv(bR, aR), [bR, aR]);                 // b/a
  const pRat     = useMemo(()=> ratDiv(bR, ratMul({n:2,d:1}, aR)), [bR, aR]); // p=b/(2a)
  const ap2      = useMemo(()=> ratMul(aR, ratMul(pRat, pRat)), [aR, pRat]);  // a p^2
  const qRat     = useMemo(()=> ratSub(cR, ap2), [cR, ap2]);                 // q=c−ap²

  // 一般形（記号）
  const sym = useMemo(()=>({
    s0: normalizeTeXSigns(String.raw`ax^2 + b\,x + c`),
    s1: normalizeTeXSigns(String.raw`a\!\left(x^2 + \frac{b}{a}x\right) + c`),
    s2: normalizeTeXSigns(String.raw`a\!\left(x^2 + \frac{b}{a}x + \left(\frac{b}{2a}\right)^2\right) + c - a\!\left(\frac{b}{2a}\right)^2`),
    s3: normalizeTeXSigns(String.raw`a\!\left(x + \frac{b}{2a}\right)^2 + \left(c - a\!\left(\frac{b}{2a}\right)^2\right)`),
  }), []);

  // 具体形（厳密分数）
  const viewsNum = useMemo(()=>{
    if (invalid) {
      const left = texLinearLead([{ coeff: bR, varName: 'x' }], cR);
      return {
        titles: ['バリデーション', '代替案'],
        steps: [
          normalizeTeXSigns(String.raw`\textbf{a=0 は不可}\ \Rightarrow\ 二次式ではありません：\quad ${left}`),
          normalizeTeXSigns(String.raw`\text{a を 0 以外に設定してください}`)
        ],
        total: 2
      };
    }
    const t0 = texLinearLead([{ coeff: aR, varName: 'x^2' }, { coeff: bR, varName: 'x' }], cR);
    const inside1 = texLinearLead([{ coeff: {n:1,d:1}, varName:'x^2' }, { coeff: b_over_a, varName:'x' }]);
    const t1 = normalizeTeXSigns(`${texCoeffTimesParenLead(aR, inside1)} ${isZero(cR)?'':`+ ${texRat(cR)}`}`);
    const inside2 = normalizeTeXSigns(`${inside1} + \\left(${texRat(pRat)}\\right)^2`);
    const right2  = normalizeTeXSigns(`${texRat(cR)} - ${texRat(ap2)}`);
    const t2 = normalizeTeXSigns(`${texCoeffTimesParenLead(aR, inside2)} + ${right2}`);
    const square = texShiftSquare('x', pRat.n, pRat.d);
    const t3 = normalizeTeXSigns(`${texCoeffTimesSquareLead(aR, square)} ${isZero(qRat)?'':`+ ${texRat(qRat)}`}`);
    return {
      titles: ['元の式', 'a で括る', '足して引く（平方完成の準備）', '完成形（平方完成）'],
      steps: [t0, t1, t2, t3],
      total: 4
    };
  }, [invalid, aR, bR, cR, b_over_a, pRat, ap2, qRat]);

  // --- アニメ補間（p,q を滑らかに） ---
  useEffect(()=>{
    if(!s.anim || invalid) return;
    const start = performance.now(); const dur = 900;
    let raf = 0;
    const baseStep = s.step;
    const loop = (now:number)=>{
      const t = Math.min(1, (now-start)/dur);
      set({ t });
      if (t<1) raf = requestAnimationFrame(loop);
      else set({ anim:false, t:0, step: clamp(baseStep+1, 0, 3) });
    };
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  }, [s.anim, s.step, invalid]);

  const pReal = useMemo(()=>{
    const pTarget = (bR.n / bR.d) / (2 * (aR.n / aR.d));
    if (s.step===1 && s.anim) return lerp(0, pTarget, s.t);
    return pTarget;
  }, [aR, bR, s.step, s.anim, s.t]);

  const qReal = useMemo(()=>{
    const aNum = aR.n / aR.d, bNum = bR.n / bR.d, cNum = cR.n / cR.d;
    const qTarget = cNum - aNum * ( (bNum/(2*aNum))**2 );
    if (s.step===2 && s.anim) return lerp(cNum, qTarget, s.t);
    return qTarget;
  }, [aR, bR, cR, s.step, s.anim, s.t]);

  // ===== 数式パネル =====
  const Formulas = ()=>{
    if (invalid) {
      return (
        <div className="space-y-3">
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            {viewsNum.steps[0]}
          </div>
          <div className="text-sm">{viewsNum.steps[1]}</div>
        </div>
      );
    }

    // a の符号でラベル切替（1つだけ表示）
    const aNum = aR.n / aR.d;
    const extremumLabel = aNum > 0 ? '最小値' : '最大値';

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="font-medium text-sm mr-2">{viewsNum.titles[s.step]}</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="px-2 py-1 rounded border" onClick={()=>set({ step:0 })}>最初</button>
            <button className="px-2 py-1 rounded border" onClick={()=>set({ step: clamp(s.step-1,0,3) })}>戻る</button>
            <button className="px-2 py-1 rounded border" onClick={()=>set({ anim:true, t:0 })}>次へ（アニメ）</button>
            <button className="px-2 py-1 rounded border" onClick={()=>set({ step: clamp(s.step+1,0,3) })}>次へ</button>
          </div>
        </div>

        {/* 一般形（記号） */}
        <div className="rounded border p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">一般形（記号）</div>
          <KaTeXBlock tex={sym[`s${s.step}` as 's0'|'s1'|'s2'|'s3']}/>
        </div>

        {/* 具体値（厳密分数） */}
        <div className="rounded border p-3">
          <div className="text-xs text-gray-500 mb-1">具体値（分数）</div>
          <KaTeXBlock tex={viewsNum.steps[s.step]}/>
        </div>

        {/* 頂点座標（縦並びその1） */}
        <div className="border rounded p-2">
          <div className="text-gray-500 text-xs mb-1">頂点座標</div>
          <KaTeXBlock tex={normalizeTeXSigns(
            String.raw`\left(-\frac{b}{2a}\,,\, c - a\left(\frac{b}{2a}\right)^2\right) = \left(-${texRat(pRat)}\,,\, ${texRat(qRat)}\right)`
          )}/>
        </div>

        {/* 極値（縦並びその2） */}
        <div className="border rounded p-2">
          <div className="text-gray-500 text-xs mb-1">{extremumLabel}</div>
          <KaTeXBlock tex={normalizeTeXSigns(`${extremumLabel} = ${texRat(qRat)}`)}/>
        </div>
      </div>
    );
  };

  // ===== グラフ（放物線／軸／頂点） =====
  const draw = (_brd:any,_:State,ctx:any): DrawResult => {
    grid(ctx);

    // 放物線 y = a x^2 + b x + c（常に本来の式で描画）
    const aNum = aR.n / aR.d, bNum = bR.n / bR.d, cNum = cR.n / cR.d;
    const x0 = - bNum / (2*aNum);
    const y0 = qReal;                    // 補間済み極値
    const span = 6;
    const xa = x0 - span, xb = x0 + span;

    const N = 480, X:number[]=[], Y:number[]=[];
    for(let i=0;i<=N;i++){
      const x = xa + (xb-xa)*i/N;
      const y = aNum*x*x + bNum*x + cNum;
      X.push(x); Y.push(y);
    }
    curve(ctx, X, Y, '#0ea5e9');

    // 軸＆頂点＆極値ライン
    dashed(ctx, [x0, y0-5], [x0, y0+5], '#94a3b8');
    point(ctx, [x0, y0], 'V', '#f59e0b', '#f59e0b', 8, true);
    dashed(ctx, [x0-5, y0], [x0+5, y0], '#f59e0b');

    // ★ フィット：頂点を必ず含め、余白を持たせる
    const minX = Math.min(...X, x0);
    const maxX = Math.max(...X, x0);
    const minY = Math.min(...Y, y0);
    const maxY = Math.max(...Y, y0);
    const padX = Math.max(0.5, (maxX - minX) * 0.08);
    const padY = Math.max(0.5, (maxY - minY) * 0.12);
    return fitFromPoints([minX - padX, maxX + padX], [minY - padY, maxY + padY]);
  };

  // ===== コントロール =====
  const Controls = ()=>{
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-600">a（二次係数）</span>
            <NumInput value={s.a} onChange={(v)=>set({ a:v, step:0 })}/>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-600">b（一次係数）</span>
            <NumInput value={s.b} onChange={(v)=>set({ b:v, step:0 })}/>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-600">c（定数項）</span>
            <NumInput value={s.c} onChange={(v)=>set({ c:v, step:0 })}/>
          </label>
        </div>

        <div className="grid grid-cols-1">
          <label className="text-sm">
            <span className="block mb-1 text-gray-600">ステップ</span>
            <input type="range" min={0} max={3} step={1} value={s.step} onChange={e=>set({ step: parseInt(e.target.value,10) })} className="w-full"/>
          </label>
        </div>
      </div>
    );
  };

  // ===== URL 同期 =====
  const toQuery = (st:State)=>({ a:String(st.a), b:String(st.b), c:String(st.c), goal: st.goal, step: String(st.step) });
  const fromQuery = (qs:URLSearchParams)=>({
    a: (qs.get('a') ? Number(qs.get('a')) : undefined),
    b: (qs.get('b') ? Number(qs.get('b')) : undefined),
    c: (qs.get('c') ? Number(qs.get('c')) : undefined),
    goal: (qs.get('goal') as Goal) || undefined,
    step: (qs.get('step') ? Number(qs.get('step')) : undefined),
  } as Partial<State>);

  return (
    <StepperBase<State>
      title="平方完成（a≠0／式変形コマ送り＋直感図）"
      state={s}
      setState={set}
      renderControls={()=> <Controls/>}
      renderFormulas={()=> <Formulas/>}
      draw={draw}
      toQuery={toQuery}
      fromQuery={fromQuery}
    />
  );
}
