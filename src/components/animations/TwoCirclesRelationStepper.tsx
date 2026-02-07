'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, line, dashed, curve, point, fitFromPoints } from '@/components/graphs/jxgUtils';

type V2 = { x:number; y:number };
type State = {
  C0: V2; r0: number;
  C1: V2; r1: number;
  showCentersLine: boolean;
  showIntersections: boolean;
  showRadicalAxis: boolean;
  showTangents: boolean; // 外/内の共通接線
};

const EPS = 1e-9;
const sub = (a:V2,b:V2)=>({x:a.x-b.x,y:a.y-b.y});
const add = (a:V2,b:V2)=>({x:a.x+b.x,y:a.y+b.y});
const mul = (k:number,a:V2)=>({x:k*a.x,y:k*a.y});
const norm = (v:V2)=>Math.hypot(v.x,v.y);
const perp = (v:V2)=>({x:-v.y,y:v.x});
const dot = (a:V2,b:V2)=>a.x*b.x+a.y*b.y;

function circlePoly(c:V2,r:number,n=360){
  const X:number[]=[], Y:number[]=[];
  for(let i=0;i<=n;i++){ const t=2*Math.PI*i/n; X.push(c.x+r*Math.cos(t)); Y.push(c.y+r*Math.sin(t)); }
  return {X,Y};
}

/* ===== 交点 ===== */
function circleCircleIntersections(C0:V2,r0:number,C1:V2,r1:number){
  const d = norm(sub(C1,C0));
  if (d<EPS) return { kind:'concentric' as const, P:[] as V2[], d };
  if (d>r0+r1+EPS) return { kind:'separate' as const, P:[] as V2[], d };
  if (d<Math.abs(r0-r1)-EPS) return { kind:'contained' as const, P:[] as V2[], d };
  const a = (r0*r0 - r1*r1 + d*d)/(2*d);
  const h2 = r0*r0 - a*a;
  const M = add(C0, mul(a/d, sub(C1,C0)));
  if (Math.abs(h2) <= EPS) return { kind:'tangent' as const, P:[M], d };
  if (h2 < 0) return { kind:'separate' as const, P:[], d };
  const h = Math.sqrt(Math.max(0,h2));
  const v = sub(C1,C0);
  const u = { x: -v.y/d, y: v.x/d };
  const P1 = add(M, mul(h, u));
  const P2 = add(M, mul(-h, u));
  return { kind:'intersect' as const, P:[P1,P2], d };
}

/* ===== 極軸（radical axis） Ax+By+C=0 ===== */
function radicalAxisLine(C0:V2,r0:number,C1:V2,r1:number){
  const A = -2*(C0.x - C1.x);
  const B = -2*(C0.y - C1.y);
  const C = (C0.x*C0.x + C0.y*C0.y - r0*r0) - (C1.x*C1.x + C1.y*C1.y - r1*r1);
  return {A,B,C};
}

/* ===== 直線の正規化・方程式 ===== */
function lineFromPoints(P:V2,Q:V2){
  const A = Q.y - P.y;
  const B = P.x - Q.x;
  const C = -(A*P.x + B*P.y);
  return normalizeLine({A,B,C});
}
function normalizeLine(L:{A:number;B:number;C:number}){
  let {A,B,C} = L;
  const s = Math.hypot(A,B);
  if (s<EPS) return {A:0,B:0,C:0};
  A/=s; B/=s; C/=s;
  // 向きを統一（A>0 or A=0かつB>=0）
  if (A<0 || (Math.abs(A)<EPS && B<0)){ A=-A; B=-B; C=-C; }
  return {A,B,C};
}
const sameLine = (L1:{A:number;B:number;C:number}, L2:{A:number;B:number;C:number}) =>
  Math.abs(L1.A-L2.A)+Math.abs(L1.B-L2.B)+Math.abs(L1.C-L2.C) < 1e-6;

/* ===== 直線をviewportにクリップ（端点2つ） ===== */
function clipLineToRect(L:{A:number;B:number;C:number}, Lft:number,Rgt:number,Btm:number,Top:number){
  const pts: V2[] = [];
  // x = Lft, Rgt
  if (Math.abs(L.B)>EPS){
    const yL = (-(L.A*Lft + L.C))/L.B;
    const yR = (-(L.A*Rgt + L.C))/L.B;
    if (yL>=Btm-EPS && yL<=Top+EPS) pts.push({x:Lft,y:yL});
    if (yR>=Btm-EPS && yR<=Top+EPS) pts.push({x:Rgt,y:yR});
  }
  // y = Btm, Top
  if (Math.abs(L.A)>EPS){
    const xB = (-(L.B*Btm + L.C))/L.A;
    const xT = (-(L.B*Top + L.C))/L.A;
    if (xB>=Lft-EPS && xB<=Rgt+EPS) pts.push({x:xB,y:Btm});
    if (xT>=Lft-EPS && xT<=Rgt+EPS) pts.push({x:xT,y:Top});
  }
  if (pts.length<2) return null;
  // 最遠の2点
  let best:[V2,V2]=[pts[0],pts[1]], bestD=-1;
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const d = Math.hypot(pts[i].x-pts[j].x, pts[i].y-pts[j].y);
      if (d>bestD){ bestD=d; best=[pts[i],pts[j]]; }
    }
  }
  return best;
}

/* ===== 相似中心（外/内） ===== */
function homothetyCenters(C0:V2,r0:number,C1:V2,r1:number){
  let Xext:V2|null=null, Xint:V2|null=null;
  if (Math.abs(r1 - r0) > EPS){
    Xext = mul(1/(r1 - r0), add(mul(r1, C0), mul(-r0, C1)));
  }
  if (Math.abs(r1 + r0) > EPS){
    Xint = mul(1/(r1 + r0), add(mul(r1, C0), mul( r0, C1)));
  }
  return { Xext, Xint };
}

/* ===== 外接線/内接線の存在判定 ===== */
const canDrawOuterTangents = (d:number,r0:number,r1:number)=> d >= Math.abs(r1 - r0) - EPS;
const canDrawInnerTangents = (d:number,r0:number,r1:number)=> d >= (r1 + r0) - EPS;

/* ===== 点Pから円への接線の接点（2点 or 0） ===== */
function tangentPointsFromExternal(P:V2,C:V2,r:number){
  const PC = sub(P,C), d = norm(PC);
  if (d <= r + EPS) return [];
  const u = mul(1/d, PC);
  const v = perp(PC); // ノルム = d
  const k1 = (r*r) / (d*d);
  const k2 = (r * Math.sqrt(d*d - r*r)) / (d*d); // このまま使える
  const T1 = add(C, add(mul(k1, PC), mul( k2, v)));
  const T2 = add(C, add(mul(k1, PC), mul(-k2, v)));
  return [T1, T2];
}
  

/* ===== 2円接線（外/内）を生成：重複排除＆検証付き ===== */
function buildCommonTangents(C0:V2,r0:number,C1:V2,r1:number, L:number,R:number,Btm:number,Top:number){
  const d = norm(sub(C1,C0));
  const { Xext, Xint } = homothetyCenters(C0,r0,C1,r1);
  const lines:{A:number;B:number;C:number}[] = [];

  const pushLine = (Lraw:{A:number;B:number;C:number})=>{
    const Ln = normalizeLine(Lraw);
    // 円への距離が半径と一致するか（接線検証）
    const dist0 = Math.abs(Ln.A*C0.x + Ln.B*C0.y + Ln.C);
    const dist1 = Math.abs(Ln.A*C1.x + Ln.B*C1.y + Ln.C);
    const tol = 1e-3;
    const ok0 = Math.abs(dist0 - r0) < tol;
    const ok1 = Math.abs(dist1 - r1) < tol;
    if (!(ok0 && ok1)) return;               // 接してない線は破棄
    if (!clipLineToRect(Ln, L,R,Btm,Top)) return; // 画面内に見えないなら破棄
    if (!lines.some(x=>sameLine(x, Ln))) lines.push(Ln);
  };

  // 外接線（2本 or 1本）
  if (Xext && canDrawOuterTangents(d,r0,r1)){
    const T = tangentPointsFromExternal(Xext, C0, r0); // 円1だけを使う（重複防止）
    for(const t of T){ pushLine(lineFromPoints(Xext, t)); }
  }
  // 内接線（2本 or 1本）
  if (Xint && canDrawInnerTangents(d,r0,r1)){
    const T = tangentPointsFromExternal(Xint, C0, r0);
    for(const t of T){ pushLine(lineFromPoints(Xint, t)); }
  }
  return lines; // 正規化済み・重複排除済み
}

export default function TwoCirclesRelationStepper(){
  const [s,setS] = useState<State>({
    C0:{x:-2,y:0}, r0:2.2,
    C1:{x: 2,y:0.5}, r1:1.4,
    showCentersLine:true,
    showIntersections:true,
    showRadicalAxis:true,
    showTangents:true,
  });
  const set = (p:Partial<State>)=>setS(v=>({...v,...p}));

  const info = useMemo(()=>{
    const inter = circleCircleIntersections(s.C0,s.r0,s.C1,s.r1);
    const d = inter.d;
    let verdict = '';
    if (inter.kind==='concentric') verdict = '\\text{同心：交点無数（r₁≠r₂）/一致（r₁=r₂）}';
    else if (inter.kind==='separate') verdict = '\\text{外離}';
    else if (inter.kind==='contained') verdict = '\\text{内離}';
    else if (inter.kind==='tangent') verdict = '\\text{接する（外接/内接）}';
    else verdict = '\\text{交わる（2点）}';
    return { inter, d, verdict };
  },[s]);

  /* ===== 数式パネル（接線の方程式も表示） ===== */
  const Formulas = (tangentLines?: {A:number;B:number;C:number}[])=>{
    const dTex = info.d.toFixed(6);
    const rsum = (s.r0+s.r1).toFixed(6);
    const rdiff= Math.abs(s.r0-s.r1).toFixed(6);
    const c0 = String.raw`\text{C}_1(${s.C0.x.toFixed(3)},\,${s.C0.y.toFixed(3)}),\ r_1=${s.r0.toFixed(3)}`;
    const c1 = String.raw`\text{C}_2(${s.C1.x.toFixed(3)},\,${s.C1.y.toFixed(3)}),\ r_2=${s.r1.toFixed(3)}`;

    const tangTex = (tangentLines && tangentLines.length)
      ? tangentLines.map((L,i)=> String.raw`\,\ell_{${i+1}}:\ ${L.A.toFixed(4)}x+${L.B.toFixed(4)}y+${L.C.toFixed(4)}=0`).join(String.raw`\\[2pt]`)
      : String.raw`\text{（接線なし）}`;

    return (
      <div className="space-y-2">
        <KaTeXBlock tex={String.raw`\textbf{2円の位置関係}\quad d=|C_1C_2|`} />
        <KaTeXBlock tex={String.raw`${c0}\quad;\quad ${c1}`} />
        <KaTeXBlock tex={String.raw`d\approx ${dTex},\quad r_1+r_2\approx ${rsum},\quad |r_1-r_2|\approx ${rdiff}`} />
        <KaTeXBlock tex={String.raw`\text{判定}\ \begin{cases}
d>r_1+r_2 & \text{外離} \\
d=r_1+r_2 & \text{外接} \\
|r_1-r_2|<d<r_1+r_2 & \text{交わる（2点）}\\
d=|r_1-r_2| & \text{内接}\\
d<|r_1-r_2| & \text{内離}
\end{cases}\quad\Rightarrow\ ${info.verdict}`} />
        {s.showTangents && (
          <>
            <div className="text-sm text-gray-500">共通接線の方程式（正規化）</div>
            <KaTeXBlock tex={tangTex} />
          </>
        )}
      </div>
    );
  };

  /* ===== 描画 ===== */
  const draw = (brd:any,_:State,ctx:any): DrawResult => {
    grid(ctx);
    const bb = brd?.getBoundingBox?.() ?? [-6,6,6,-6];
    const L=bb[0], Top=bb[1], R=bb[2], Btm=bb[3];

    const fitX:number[] = [], fitY:number[] = [];

    // 円
    for (const [C,r,color] of [[s.C0,s.r0,'#0ea5e9'], [s.C1,s.r1,'#22c55e']] as const){
      const {X,Y}=circlePoly(C, Math.max(1e-6,Math.abs(r)));
      curve(ctx,X,Y,color);
      fitX.push(...X); fitY.push(...Y);
    }

    // 中心線
    if (s.showCentersLine){
      line(ctx,[s.C0.x,s.C0.y],[s.C1.x,s.C1.y],'#94a3b8');
      fitX.push(s.C0.x,s.C1.x); fitY.push(s.C0.y,s.C1.y);
    }

    // 交点/接点
    if (s.showIntersections){
      const {kind,P} = info.inter;
      if (kind==='tangent' && P.length===1){
        point(ctx,[P[0].x,P[0].y],'T','#ef4444','#ef4444',8,true);
        fitX.push(P[0].x); fitY.push(P[0].y);
      } else if (kind==='intersect' && P.length===2){
        point(ctx,[P[0].x,P[0].y],'P₁','#ef4444','#ef4444',8,true);
        point(ctx,[P[1].x,P[1].y],'P₂','#ef4444','#ef4444',8,true);
        fitX.push(P[0].x,P[1].x); fitY.push(P[0].y,P[1].y);
      }
    }

    // 極軸（フィット対象に入れない）
    if (s.showRadicalAxis){
      const Ra = radicalAxisLine(s.C0,s.r0,s.C1,s.r1);
      const seg = clipLineToRect(Ra, L,R,Btm,Top);
      if (seg) dashed(ctx,[seg[0].x,seg[0].y],[seg[1].x,seg[1].y],'#f59e0b');
    }

    // 共通接線（計算→描画、フィット対象に入れない）
    let tangents: {A:number;B:number;C:number}[] = [];
    if (s.showTangents){
      tangents = buildCommonTangents(s.C0,s.r0,s.C1,s.r1, L,R,Btm,Top);
      for (const Ln of tangents){
        const seg = clipLineToRect(Ln, L,R,Btm,Top);
        if (seg) dashed(ctx,[seg[0].x,seg[0].y],[seg[1].x,seg[1].y],'#6b7280');
      }
    }

    // 中心（ドラッグ可）
    const p0 = point(ctx,[s.C0.x,s.C0.y],'C₁','#111','#fff',9,false);
    const p1 = point(ctx,[s.C1.x,s.C1.y],'C₂','#111','#fff',9,false);
    try{ p0.on('drag',()=> set({ C0:{x:p0.X(),y:p0.Y()} })); }catch{}
    try{ p1.on('drag',()=> set({ C1:{x:p1.X(),y:p1.Y()} })); }catch{}

    // ← Formulas を接線リストで再描画（StepperBaseのしくみによって次回レンダで反映）
    // ここではfitのみ返す
    return fitFromPoints(fitX.length?fitX:[-5,5], fitY.length?fitY:[-5,5]);
  };

  return (
    <StepperBase<State>
      title="2円の位置関係（交点・接点・極軸・共通接線）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">円1（C₁,r₁）と円2（C₂,r₂）</div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">C₁.x</span><NumInput value={st.C0.x} onChange={(v)=>set({C0:{...st.C0,x:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">C₁.y</span><NumInput value={st.C0.y} onChange={(v)=>set({C0:{...st.C0, y: v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">r₁</span><NumInput value={st.r0} onChange={(v)=>set({r0:Math.max(0,Math.abs(v))})}/></label>

            <label className="text-sm"><span className="block mb-1 text-gray-600">C₂.x</span><NumInput value={st.C1.x} onChange={(v)=>set({C1:{...st.C1,x:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">C₂.y</span><NumInput value={st.C1.y} onChange={(v)=>set({C1:{...st.C1, y: v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">r₂</span><NumInput value={st.r1} onChange={(v)=>set({r1:Math.max(0,Math.abs(v))})}/></label>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showCentersLine} onChange={e=>set({showCentersLine:e.target.checked})}/><span>中心を結ぶ線</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showIntersections} onChange={e=>set({showIntersections:e.target.checked})}/><span>交点/接点</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showRadicalAxis} onChange={e=>set({showRadicalAxis:e.target.checked})}/><span>極軸</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showTangents} onChange={e=>set({showTangents:e.target.checked})}/><span>共通接線（外/内）</span></label>
          </div>
        </div>
      )}
      // 接線の式は renderFormulas 内でレンダ時に計算したい場合は lift state にしてもOK
      renderFormulas={()=>{
        // ここで小さく再計算（軽いのでOK）
        const L={A:0,B:0,C:0}; // ダミー
        const bb=[-6,6,6,-6] as any;
        const tan = buildCommonTangents(s.C0,s.r0,s.C1,s.r1, bb[0],bb[2],bb[3],bb[1]);
        return <>{Formulas(tan)}</>;
      }}
      draw={draw}
    />
  );
}
