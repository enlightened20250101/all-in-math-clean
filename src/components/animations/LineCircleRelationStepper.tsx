'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, line, dashed, curve, point, fitFromPoints } from '@/components/graphs/jxgUtils';
// useRafAnim は未使用（静的）だが将来の拡張に備えて残せる

type State = {
  // 円
  h:number; k:number; r:number;
  // 直線 Ax + By + C = 0
  A:number; B:number; C:number;
  // 表示
  showFoot:boolean; showIntersections:boolean; showDistance:boolean;
};

const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
const EPS=1e-9;

/** 点 (h,k) と直線 Ax+By+C=0 の距離（符号なし）と垂足 */
function footAndDist(A:number,B:number,C:number, h:number,k:number){
  const d = Math.hypot(A,B);
  if (d<EPS) return { ok:false, F:[h,k] as [number,number], dist: NaN };
  const t = -(A*h + B*k + C) / (d*d);
  const x0 = h + A*t, y0 = k + B*t;
  const dist = Math.abs(A*h + B*k + C)/d;
  return { ok:true, F:[x0,y0] as [number,number], dist };
}

/** 直線パラメ（長い範囲に拡張） */
function lineEnds(A:number,B:number,C:number, L:number,R:number,Btm:number,Top:number){
  // 端点2つ（視野の端で交わる二点）
  if (Math.abs(B)>Math.abs(A)){ // y = -(Ax+C)/B
    const y1 = (-(A*L + C))/B, y2 = (-(A*R + C))/B;
    return [[L, y1],[R, y2]] as [number,number][];
  }else{ // x = -(By+C)/A
    const x1 = (-(B*Btm + C))/A, x2 = (-(B*Top + C))/A;
    return [[x1, Btm],[x2, Top]] as [number,number][];
  }
}

/** 円パラメ */
function circlePoly(cx:number,cy:number,r:number,n=360){
  const X:number[]=[], Y:number[]=[];
  for(let i=0;i<=n;i++){
    const t=2*Math.PI*i/n;
    X.push(cx + r*Math.cos(t));
    Y.push(cy + r*Math.sin(t));
  }
  return {X,Y};
}

export default function LineCircleRelationStepper(){
  const [s,setS] = useState<State>({
    h:0, k:0, r:2.4,
    A:1, B:-1, C:0,
    showFoot:true, showIntersections:true, showDistance:true,
  });
  const set = (p:Partial<State>)=>setS(v=>({...v,...p}));

  // 判別
  const {disc, rel, foot, d} = useMemo(()=>{
    const {ok,F,dist} = footAndDist(s.A,s.B,s.C,s.h,s.k);
    const disc = s.r - dist; // >0 交点2、=0 接点1、<0 離線
    const rel = disc> EPS ? 'intersect' : (Math.abs(disc)<=EPS ? 'tangent' : 'separate');
    return {disc, rel, foot: ok?F:[s.h,s.k] as [number,number], d:dist};
  },[s.A,s.B,s.C,s.h,s.k,s.r]);

  /* ===== 数式パネル ===== */
  const Formulas = ()=>{
    const lineTex = String.raw`${s.A===0?'':`${s.A.toFixed(3)}x`} ${s.B>=0?'+':'-'} ${Math.abs(s.B).toFixed(3)}y ${s.C>=0?'+':'-'} ${Math.abs(s.C).toFixed(3)} = 0`;
    const circleTex = String.raw`\bigl(x-${s.h.toFixed(3)}\bigr)^2 + \bigl(y-${s.k.toFixed(3)}\bigr)^2 = ${s.r.toFixed(3)}^{\,2}`;
    const dTex = Number.isFinite(d) ? d.toFixed(6) : '—';
    const verdict = rel==='intersect' ? '\\text{交点が2つ}' : rel==='tangent' ? '\\text{接点が1つ}' : '\\text{交点なし（離線）}';
    return (
      <div className="space-y-2">
        <KaTeXBlock tex={String.raw`\textbf{円と直線の位置関係}`} />
        <KaTeXBlock tex={String.raw`\text{直線 } ${lineTex}`} />
        <KaTeXBlock tex={String.raw`\text{円 } ${circleTex}`} />
        <KaTeXBlock tex={String.raw`\text{距離 } d=\dfrac{|Ah+Bk+C|}{\sqrt{A^2+B^2}} \approx ${dTex}`} />
        <KaTeXBlock tex={String.raw`\text{判定 } \quad d\ \begin{cases} 
< r & \Rightarrow\ \text{交点2つ} \\
= r & \Rightarrow\ \text{接する} \\
> r & \Rightarrow\ \text{離れる}
\end{cases}\quad\Rightarrow\ ${verdict}`} />
      </div>
    );
  };

  /* ===== 描画 ===== */
  const draw = (brd:any,_:State,ctx:any): DrawResult => {
    grid(ctx);

    const bb = brd?.getBoundingBox?.() ?? [-6,6,6,-6];
    const L=bb[0], Top=bb[1], R=bb[2], Btm=bb[3];

    const xs:number[]=[], ys:number[]=[];

    // 直線
    const [P,Q] = lineEnds(s.A,s.B,s.C,L,R,Btm,Top);
    line(ctx, P, Q, '#f97316'); xs.push(P[0],Q[0]); ys.push(P[1],Q[1]);

    // 円
    const {X,Y} = circlePoly(s.h,s.k,Math.max(1e-6,Math.abs(s.r)));
    curve(ctx, X, Y, '#0ea5e9'); xs.push(...X); ys.push(...Y);

    // 垂足・距離
    if (s.showFoot && Number.isFinite(d)){
      const Fp = foot as [number,number];
      dashed(ctx, [s.h,s.k], Fp, '#10b981');
      point(ctx, Fp, 'H', '#10b981', '#10b981', 8, true);
      xs.push(Fp[0]); ys.push(Fp[1]);
    }

    // 交点（解析）: 直線を正規化し、円中心からの座標系で解く
    if (s.showIntersections){
      const A=s.A, B=s.B, C=s.C; const h=s.h, k=s.k, r=s.r;
      const denom = A*A + B*B;
      if (denom>EPS){
        // 直線の垂足 H を起点・接ベクトル T = ( -B, A )/||.||
        const H = footAndDist(A,B,C,h,k).F;
        const nx = A/Math.sqrt(denom), ny = B/Math.sqrt(denom);
        const tx = -ny, ty = nx; // 単位接ベクトル
        // 円中心から H までの距離 d、弦長半分 = sqrt(r^2 - d^2)
        if (r>=d-EPS){
          const chord = Math.sqrt(Math.max(0, r*r - d*d));
          const P1:[number,number] = [ H[0] + tx*chord, H[1] + ty*chord ];
          const P2:[number,number] = [ H[0] - tx*chord, H[1] - ty*chord ];
          if (rel==='tangent'){
            point(ctx, H, 'T', '#ef4444', '#ef4444', 8, true);
          }else if (rel==='intersect'){
            point(ctx, P1, 'P₁', '#ef4444', '#ef4444', 8, true);
            point(ctx, P2, 'P₂', '#ef4444', '#ef4444', 8, true);
          }
        }
      }
    }

    // 中心（ドラッグ可）
    const pC = point(ctx, [s.h,s.k], 'O', '#111', '#fff', 9, false);
    try{ pC.on('drag',()=> set({ h:pC.X(), k:pC.Y() })); }catch{}

    // 返り値（AutoFit）
    return fitFromPoints(xs.length?xs:[-5,5], ys.length?ys:[-5,5]);
  };

  /* ===== UI ===== */
  return (
    <StepperBase<State>
      title="円と直線の位置関係（判別・交点・接点）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">円（中心と半径）</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">h</span>
              <NumInput value={st.h} onChange={(h)=>set({h})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">k</span>
              <NumInput value={st.k} onChange={(k)=>set({k})}/></label>
            <label className="text-sm md:col-span-1"><span className="block mb-1 text-gray-600">r</span>
              <NumInput value={st.r} onChange={(r)=>set({r:Math.max(0,Math.abs(r))})}/></label>
            <label className="text-sm flex items-center gap-2 md:col-span-2">
              <input type="checkbox" checked={st.showIntersections} onChange={e=>set({showIntersections:e.target.checked})}/>
              <span>交点/接点を表示</span>
            </label>
          </div>

          <div className="text-sm font-medium text-gray-700 mt-2">直線（Ax + By + C = 0）</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">A</span>
              <NumInput value={st.A} onChange={(A)=>set({A})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">B</span>
              <NumInput value={st.B} onChange={(B)=>set({B})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">C</span>
              <NumInput value={st.C} onChange={(C)=>set({C})}/></label>
            <label className="text-sm flex items-center gap-2 md:col-span-3">
              <input type="checkbox" checked={st.showFoot} onChange={e=>set({showFoot:e.target.checked})}/>
              <span>垂足 H と垂線を表示</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showDistance} onChange={e=>set({showDistance:e.target.checked})}/>
              <span>距離 d の式を表示（下パネル）</span>
            </label>
          </div>
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
