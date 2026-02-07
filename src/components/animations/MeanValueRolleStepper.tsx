// src/components/animations/MeanValueRolleStepper.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { useRafAnim } from '@/components/animations/_shared/useRafAnim';
import { grid, line, dashed, curve, point, fitFromPoints } from '@/components/graphs/jxgUtils';

/* ========================= Types ========================= */
type Mode = 'auto' | 'mvt' | 'rolle';
type FKey = 'poly3'|'poly2'|'sin'|'cos'|'exp'|'ln1p'|'abs_smooth';

type State = {
  mode: Mode;       // auto: f(a)=f(b) なら Rolle, そうでなければ MVT
  fkey: FKey;
  a: number; b: number;
  anim: boolean; speed: number; t: number;
  showTangent: boolean;
  aExpr: string; bExpr: string; // pi, sqrt 対応入力
};

/* ===================== Math / helpers ===================== */
const EPS = 1e-9;
const clamp = (x:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi,x));

/** 安全な式パーサ（pi, sqrt, ^） */
function parseExpr(s: string): number | null {
  if (typeof s !== 'string') return null;
  let expr = s.trim();
  if (!expr) return null;
  expr = expr.replace(/π|pi/gi, 'Math.PI');
  expr = expr.replace(/sqrt\s*\(/gi, 'Math.sqrt(');
  expr = expr.replace(/\^/g, '**');
  const safe = expr.replace(/Math\.PI|Math\.sqrt/g, '');
  if (!/^[0-9+\-*/().\s]*$/.test(safe)) return null;
  try {
    const val = Function(`"use strict"; return (${expr});`)();
    return (typeof val === 'number' && Number.isFinite(val)) ? val : null;
  } catch { return null; }
}

/* ===== 関数プリセット（f, f', tex） =====
   高校の範囲で滑らかなもの中心。abs_smooth は |x| を滑らか近似 */
const FSET: Record<FKey, {
  label: string;
  f:(x:number)=>number;
  df:(x:number)=>number;
  tex: string;
}> = {
  poly3: { label:'f(x)=x^3-3x', f:(x)=>x*x*x-3*x, df:(x)=>3*x*x-3, tex:String.raw`f(x)=x^3-3x` },
  poly2: { label:'f(x)=x^2',    f:(x)=>x*x,       df:(x)=>2*x,     tex:String.raw`f(x)=x^2` },
  sin:   { label:'f(x)=\sin x', f:Math.sin,       df:Math.cos,     tex:String.raw`f(x)=\sin x` },
  cos:   { label:'f(x)=\cos x', f:Math.cos,       df:(x)=>-Math.sin(x), tex:String.raw`f(x)=\cos x` },
  exp:   { label:'f(x)=e^x',    f:Math.exp,       df:Math.exp,     tex:String.raw`f(x)=\mathrm e^x` },
  ln1p:  { label:'f(x)=\ln(1+x)', f:(x)=>Math.log(1+x), df:(x)=>1/(1+x), tex:String.raw`f(x)=\ln(1+x)\ (x>-1)` },
  abs_smooth: { label:'f(x)\approx\sqrt{x^2+\varepsilon}', f:(x)=>Math.sqrt(x*x+1e-4), df:(x)=>x/Math.sqrt(x*x+1e-4), tex:String.raw`f(x)\approx\sqrt{x^2+\varepsilon}` },
};

/** f'(x)=m の解を [a,b] 内で1点探す。符号変化をスキャン→二分法、なければ最小値近傍 */
function findRootFpEqM(
  f:(x:number)=>number, df:(x:number)=>number, m:number, a:number, b:number
): number | null {
  const h = (x:number)=>df(x)-m;

  // まず粗い分割で符号変化を探す
  const N = 256;
  let lastx = a, last = h(a);
  for(let i=1;i<=N;i++){
    const x = a + (b-a)*i/N;
    const v = h(x);
    if (Number.isFinite(last) && Number.isFinite(v) && last*v <= 0){
      // 二分法
      let lo = lastx, hi = x, flo = last, fhi = v;
      for(let k=0;k<50;k++){
        const mid = 0.5*(lo+hi);
        const fm = h(mid);
        if (!Number.isFinite(fm)) break;
        if (flo*fm <= 0){ hi=mid; fhi=fm; } else { lo=mid; flo=fm; }
      }
      return 0.5*(lastx + x);
    }
    lastx = x; last = v;
  }
  // 符号変化なし→サンプルで |h| が最小の x
  let bestX = a, bestV = Math.abs(h(a));
  for(let i=1;i<=N;i++){
    const x = a + (b-a)*i/N;
    const v = Math.abs(h(x));
    if (v < bestV){ bestV = v; bestX = x; }
  }
  return bestX;
}

/* ========================= Component ========================= */
export default function MeanValueRolleStepper(){
  const [s,setS] = useState<State>({
    mode: 'auto',
    fkey: 'poly3',
    a: -2, b: 2,
    anim: true, speed: 0.6, t: 0,
    showTangent: true,
    aExpr: '-2', bExpr: '2',
  });
  const set = (p:Partial<State>)=>setS(v=>({...v,...p}));

  // 入力式 → 数値
  useEffect(()=>{
    const A=parseExpr(s.aExpr); if (A!==null) set({a:A});
  }, [s.aExpr]);
  useEffect(()=>{
    const B=parseExpr(s.bExpr); if (B!==null) set({b:B});
  }, [s.bExpr]);

  // アニメ
  useRafAnim(s, setS, 0.25);

  const a = Math.min(s.a, s.b);
  const b = Math.max(s.a, s.b);
  const F = FSET[s.fkey];
  const fa = F.f(a), fb = F.f(b);
  const mSec = (Math.abs(b-a)<EPS) ? 0 : (fb-fa)/(b-a);  // 割線の傾き
  const rolleLike = Math.abs(fa - fb) < 1e-6;            // f(a)=f(b) ならロル条件
  const modeResolved: 'mvt'|'rolle' = s.mode==='auto' ? (rolleLike ? 'rolle' : 'mvt') : s.mode;

  // c の探索
  const targetSlope = modeResolved==='rolle' ? 0 : mSec;
  const c = useMemo(()=> findRootFpEqM(F.f, F.df, targetSlope, a, b), [F, targetSlope, a, b]);

  // t で c をハイライト（0→1 で a→c→b に滑らかに）
  const xT = useMemo(()=>{
    if (!Number.isFinite(c!)) return a;
    const u = clamp(s.t, 0, 1);
    // 前半で a→c、後半で c→b（目で追いやすい）
    if (u<=0.5) return a + (c!-a)*(u/0.5);
    return c! + (b-c!)*((u-0.5)/0.5);
  }, [a,b,c,s.t]);

  /* ========== 数式パネル ========== */
  const Formulas = ()=>{
    const base = modeResolved==='rolle'
      ? String.raw`\textbf{ロルの定理}\quad f(a)=f(b),\ f\ \text{連続・微分可能}\ \Rightarrow\ \exists c\in(a,b):\ f'(c)=0`
      : String.raw`\textbf{平均値の定理}\quad \exists c\in(a,b):\ f'(c)=\dfrac{f(b)-f(a)}{\,b-a\,}`;
    const sec = String.raw`\text{割線の傾き}\ m=\dfrac{f(b)-f(a)}{b-a} \approx ${mSec.toFixed(6)}`;
    const rolleBadge = rolleLike ? String.raw`\quad(\text{今回 } f(a)\approx f(b)\Rightarrow\ \text{ロル条件})` : '';
    const cTex = (c && a<c && c<b) ? String.raw`c\approx ${c.toFixed(6)},\quad f'(c)\approx ${F.df(c).toFixed(6)}` : String.raw`\text{有効な }c\ \text{が見つかりませんでした}`;

    return (
      <div className="space-y-2">
        <KaTeXBlock tex={F.tex}/>
        <KaTeXBlock tex={base + rolleBadge}/>
        {modeResolved==='mvt' && <KaTeXBlock tex={sec}/>}
        <KaTeXBlock tex={String.raw`a=${a.toFixed(3)},\ b=${b.toFixed(3)},\ f(a)=${fa.toFixed(3)},\ f(b)=${fb.toFixed(3)}`} />
        <KaTeXBlock tex={cTex}/>
      </div>
    );
  };

  /* ========== 描画 ========== */
  const draw = (_brd:any,_:State,ctx:any): DrawResult => {
    grid(ctx);

    const xs:number[]=[], ys:number[]=[];
    // 曲線
    const N=480, X:number[]=[], Y:number[]=[];
    for(let i=0;i<=N;i++){
      const x = a + (b-a)*i/N;
      const y = F.f(x);
      X.push(x); Y.push(y);
    }
    curve(ctx, X, Y, '#0ea5e9'); xs.push(...X); ys.push(...Y);

    // 割線
    const secant = [[a,fa],[b,fb]] as [number,number][];
    line(ctx, secant[0], secant[1], rolleLike ? '#94a3b8' : '#f97316'); // ロル時は灰色化

    // ===== ここから修正ポイント =====

    // まず「解となる c の接線」を薄い色で描いて目標を明示（c が有効な時）
    if (s.showTangent && c && a < c && c < b) {
      const x0 = c;
      const y0 = F.f(x0);
      const slope = F.df(x0);
      const xL = a, xR = b;
      const yL = y0 + slope * (xL - x0);
      const yR = y0 + slope * (xR - x0);
      // 目標接線（薄めの赤）
      dashed(ctx, [xL, yL], [xR, yR], '#fca5a5');
      xs.push(xL, xR); ys.push(yL, yR);
      // 目標点 c も薄めに
      point(ctx, [c, y0], 'c', '#f59e0b', '#f59e0b', 7, true);
      xs.push(c); ys.push(y0);
    }

    // アニメ中は xT の位置で「動く接線」を太めの赤で描く
    // アニメ OFF のときは従来通り c 位置で太めの赤を描く
    const xTan = (s.anim ? xT : (c && a < c && c < b ? c : null));
    if (s.showTangent && xTan!==null) {
      const y0 = F.f(xTan);
      const slope = F.df(xTan);
      const xL = a, xR = b;
      const yL = y0 + slope * (xL - xTan);
      const yR = y0 + slope * (xR - xTan);
      // 動く（または固定の）主接線（はっきりした赤）
      dashed(ctx, [xL, yL], [xR, yR], '#ef4444');
      xs.push(xL, xR); ys.push(yL, yR);
      // 動く点（または c と同じ場合でも強調）
      point(ctx, [xTan, y0], ' ', '#ef4444', '#ef4444', 6, true);
      xs.push(xTan); ys.push(y0);
    }

    // ===== 修正ここまで =====

    // a,b の点
    point(ctx, [a,fa], 'a', '#111', '#fff', 9, false);
    point(ctx, [b,fb], 'b', '#111', '#fff', 9, false);
    xs.push(a,b); ys.push(fa,fb);

    return fitFromPoints(xs,ys);
  };

  /* ========== UI ========== */
  return (
    <StepperBase<State>
      title="平均値の定理 & ロルの定理"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          {/* モード */}
          <div className="flex flex-wrap gap-2">
            {(['auto','mvt','rolle'] as Mode[]).map(m=>(
              <button key={m} onClick={()=>set({mode:m})}
                className={`px-3 py-1 rounded border ${st.mode===m?'bg-gray-900 text-white':'bg-white'}`}>
                {m==='auto'?'自動判定':m==='mvt'?'平均値の定理':'ロルの定理'}
              </button>
            ))}
          </div>

          {/* 関数 */}
          <div className="text-sm">
            <div className="mb-1 text-gray-600">関数</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FSET) as FKey[]).map(k=>(
                <button key={k} onClick={()=>set({fkey:k, t:0, anim:true})}
                  className={`px-3 py-1 rounded border ${st.fkey===k?'bg-gray-900 text-white':'bg-white'}`}>
                  {FSET[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* 区間 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">a（pi, sqrt 可）</span>
              <input value={st.aExpr} onChange={e=>set({aExpr:e.target.value})} className="w-full rounded border px-2 py-1"/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">b（pi, sqrt 可）</span>
              <input value={st.bExpr} onChange={e=>set({bExpr:e.target.value})} className="w-full rounded border px-2 py-1"/></label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showTangent} onChange={e=>set({showTangent:e.target.checked})}/>
              <span>接線も表示</span>
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.anim} onChange={e=>set({anim:e.target.checked, t:0})}/>
              <span>アニメ</span>
            </label>
          </div>

          {/* 速度 */}
          <label className="text-sm flex items-center gap-2">
            <span>速度</span>
            <input type="range" min={0.3} max={3} step={0.1} value={st.speed}
                   onChange={e=>set({speed:parseFloat(e.target.value)})}/>
            <span>{st.speed.toFixed(1)}×</span>
          </label>
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
