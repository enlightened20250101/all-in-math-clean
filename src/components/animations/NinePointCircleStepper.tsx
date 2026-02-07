'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, line, dashed, curve, point, fitFromPoints } from '@/components/graphs/jxgUtils';

type V2 = { x:number; y:number };
type State = {
  A: V2; B: V2; C: V2;
  showCircum: boolean;
  showEulerLine: boolean;
  showFeet: boolean;      // 垂足 Ha,Hb,Hc
  showAHmid: boolean;     // AH,BH,CH の中点 Pa,Pb,Pc
  showMid: boolean;       // 辺の中点 Ma,Mb,Mc（切替可能に）
};

const EPS = 1e-9;
const add=(a:V2,b:V2)=>({x:a.x+b.x,y:a.y+b.y});
const sub=(a:V2,b:V2)=>({x:a.x-b.x,y:a.y-b.y});
const mul=(k:number,a:V2)=>({x:k*a.x,y:k*a.y});
const dot=(a:V2,b:V2)=>a.x*b.x+a.y*b.y;
const norm=(v:V2)=>Math.hypot(v.x,v.y);
const mid=(P:V2,Q:V2)=>mul(0.5, add(P,Q));

/** 直線（P,dir）を viewport にクリップ（端点2つ） */
function clipLineThroughPointDir(P:V2, v:V2, L:number,R:number,Btm:number,Top:number){
  const pts: V2[] = [];
  const addPt = (t:number)=>{ const x=P.x+t*v.x, y=P.y+t*v.y; if(x>=L-EPS&&x<=R+EPS&&y>=Btm-EPS&&y<=Top+EPS) pts.push({x,y}); };
  if (Math.abs(v.x)>EPS){ addPt((L-P.x)/v.x); addPt((R-P.x)/v.x); }
  if (Math.abs(v.y)>EPS){ addPt((Btm-P.y)/v.y); addPt((Top-P.y)/v.y); }
  if (pts.length<2) return null;
  let best:[V2,V2]=[pts[0],pts[1]], bestD=-1;
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
    const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
    if(d>bestD){bestD=d;best=[pts[i],pts[j]];}
  }
  return best;
}

/** 点Pから無限直線 AB への垂足 */
function footToLine(P:V2,A:V2,B:V2){
  const v=sub(B,A); const n2=dot(v,v);
  if (n2<EPS) return A;
  const t = dot(sub(P,A),v)/n2;
  return add(A, mul(t,v));
}

/** 外心 O と外接半径 R */
function circumcenter(A:V2,B:V2,C:V2){
  const D = 2*(A.x*(B.y-C.y) + B.x*(C.y-A.y) + C.x*(A.y-B.y));
  if (Math.abs(D)<EPS) return { ok:false, O:{x:0,y:0}, R:NaN };
  const a2=A.x*A.x+A.y*A.y, b2=B.x*B.x+B.y*B.y, c2=C.x*C.x+C.y*C.y;
  const Ox = (a2*(B.y-C.y) + b2*(C.y-A.y) + c2*(A.y-B.y))/D;
  const Oy = (a2*(C.x-B.x) + b2*(A.x-C.x) + c2*(B.x-A.x))/D;
  const O={x:Ox,y:Oy}; const R=norm(sub(O,A));
  return { ok:true, O, R };
}

/** 垂心 H */
function orthocenter(A:V2,B:V2,C:V2){
  // 交点: 高さ1（A から BC），高さ2（B から CA）
  const v1 = { x: C.y - B.y, y: -(C.x - B.x) }; // BC に垂直
  const v2 = { x: A.y - C.y, y: -(A.x - C.x) }; // CA に垂直
  const den = v1.x * (-v2.y) - v1.y * (-v2.x);
  if (Math.abs(den)<EPS) return { ok:false, H: {x:0,y:0} };
  const rhs = sub(B, A);
  const t = (rhs.x * (-v2.y) - rhs.y * (-v2.x)) / den;
  const H = add(A, mul(t, v1));
  return { ok:true, H };
}

function circlePoly(C:V2,r:number,n=360){
  const X:number[]=[], Y:number[]=[];
  for(let i=0;i<=n;i++){ const t=2*Math.PI*i/n; X.push(C.x+r*Math.cos(t)); Y.push(C.y+r*Math.sin(t)); }
  return {X,Y};
}

/** 3点から円（中心・半径）を決定（一般の外接円） */
function circumcircleThrough(P:V2,Q:V2,R:V2){
  const u=sub(Q,P), v=sub(R,P);
  const du=dot(u,u), dv=dot(v,v), uv=dot(u,v);
  const D = 2*(du*dv - uv*uv);
  if (Math.abs(D)<EPS) return { ok:false, C:{x:NaN,y:NaN}, r:NaN };
  const alpha = (dv*(du - uv) )/D;
  const beta  = (du*(dv - uv) )/D;
  const C = add(P, add(mul(alpha,u), mul(beta,v)));
  const r = norm(sub(C,P));
  return { ok:true, C, r };
}

export default function NinePointCircleStepper(){
  const [s,setS]=useState<State>({
    A:{x:-2.8,y:-0.8},
    B:{x: 2.6,y:-0.6},
    C:{x:-0.4,y: 2.3},
    showCircum:true,
    showEulerLine:true,
    showFeet:true,
    showAHmid:true,
    showMid:true,
  });
  const set=(p:Partial<State>)=>setS(v=>({...v,...p}));

  // 幾何計算
  const geom = useMemo(()=>{
    const Ores = circumcenter(s.A,s.B,s.C);
    const Hres = orthocenter(s.A,s.B,s.C);
    const valid = Ores.ok && Hres.ok && Number.isFinite(Ores.R);
    const O = Ores.O, H = Hres.H, R = Ores.R;

    const Ma = mid(s.B,s.C), Mb = mid(s.C,s.A), Mc = mid(s.A,s.B);
    const Ha = footToLine(s.A,s.B,s.C), Hb = footToLine(s.B,s.C,s.A), Hc = footToLine(s.C,s.A,s.B);
    const G  = mul(1/3, add(s.A, add(s.B, s.C)));

    // 九点円の幾何学的定義
    const N_def = valid ? mid(O,H) : {x:NaN,y:NaN};
    const Rn_def = valid ? R/2 : NaN;

    // 中点3点からの円決定（数値検証用）
    const CC = circumcircleThrough(Ma,Mb,Mc);
    const N_fit = CC.C;
    const Rn_fit = CC.r;

    // 9点群
    const Pa = valid ? mid(s.A,H) : {x:NaN,y:NaN};
    const Pb = valid ? mid(s.B,H) : {x:NaN,y:NaN};
    const Pc = valid ? mid(s.C,H) : {x:NaN,y:NaN};

    const nine = [Ma,Mb,Mc, Ha,Hb,Hc, Pa,Pb,Pc];

    // 誤差評価（N_def,Rn_def に対する半径誤差の最大値）
    const errNine = valid ? Math.max(...nine.map(P=> Math.abs(norm(sub(P,N_def)) - Rn_def))) : NaN;

    // オイラー線検証：面積（O,G,H）≃0 と 比 OG:GH≃1:2
    const areaTwice = (O.x*(G.y-H.y) + G.x*(H.y-O.y) + H.x*(O.y-G.y)); // 2Δ
    const colErr = Math.abs(areaTwice);
    const OG = norm(sub(G,O)), GH = norm(sub(H,G));
    const ratio = (OG>EPS && GH>EPS) ? OG/GH : NaN;
    const ratioErr = isFinite(ratio) ? Math.abs(ratio - 1/2) : NaN;

    return {
      valid, O, H, G, N_def, Rn_def,
      N_fit, Rn_fit, Ma,Mb,Mc, Ha,Hb,Hc, Pa,Pb,Pc,
      nine, errNine, colErr, ratio, ratioErr
    };
  }, [s.A,s.B,s.C]);

  /* ===== 数式パネル ===== */
  const Formulas = ()=>{
    if (!geom.valid) {
      return <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">三点がほぼ一直線です。少しずらしてください。</div>;
    }
    const v = (P:V2)=> String.raw`\left(${P.x.toFixed(3)},\,${P.y.toFixed(3)}\right)`;
    const eulerOK = geom.colErr < 1e-6 && (isFinite(geom.ratioErr)? geom.ratioErr < 2e-3 : false);
    const nfitOK  = isFinite(geom.Rn_fit) && Math.abs(geom.Rn_fit - geom.Rn_def) < 1e-3;
    const nineErr = isFinite(geom.errNine) ? geom.errNine.toExponential(2) : '—';
    const ratioStr= isFinite(geom.ratio) ? geom.ratio.toFixed(4) : '—';

    return (
      <div className="space-y-2">
        <KaTeXBlock tex={String.raw`\textbf{九点円（Nine-Point Circle）}`}/>
        <KaTeXBlock tex={String.raw`\text{九点： } M_a,M_b,M_c\ \text{（辺の中点）},\ H_a,H_b,H_c\ \text{（高さの足）},\ P_a,P_b,P_c\ \text{（}AH,BH,CH\text{の中点）}`} />
        <KaTeXBlock tex={String.raw`O=${v(geom.O)}\ ,\ H=${v(geom.H)}\ ,\ G=${v(geom.G)}\ ,\ N=\frac{O+H}{2}=${v(geom.N_def)}`} />
        <KaTeXBlock tex={String.raw`R_N=\frac{R}{2}\ \ \ (\text{定義円})\quad,\quad R_N^{(fit)}\ \text{（}M_a,M_b,M_c\text{の外接円）}`} />
        <KaTeXBlock tex={String.raw`R_N\approx ${geom.Rn_def.toFixed(3)}\ ,\ R_N^{(fit)}\approx ${isFinite(geom.Rn_fit)? geom.Rn_fit.toFixed(3):'—'}\ ,\ \text{一致性: } ${nfitOK? '\\text{OK}':'\\text{NG'}`} />
        <KaTeXBlock tex={String.raw`\text{9点の半径ずれ（最大）}\ \max_i\bigl|\,|NP_i|-R_N\,\bigr|\ \approx\ ${nineErr}`} />

        <KaTeXBlock tex={String.raw`\textbf{オイラー線}\ \ (O,G,H\ \text{一直線})\ ,\ \dfrac{OG}{GH}=\dfrac12`} />
        <KaTeXBlock tex={String.raw`OG/GH\approx ${ratioStr}\ \ ,\ \text{直線性検証 }|2\Delta(OGH)|\approx ${geom.colErr.toExponential(2)}\ \Rightarrow\ ${eulerOK?'\\text{OK}':'\\text{要調整'}`} />
      </div>
    );
  };

  /* ===== 描画 ===== */
  const draw = (brd:any,_:State,ctx:any): DrawResult=>{
    grid(ctx);
    const xs:number[] = [], ys:number[] = [];

    // 三角形の辺
    const edge=(P:V2,Q:V2)=> line(ctx,[P.x,P.y],[Q.x,Q.y],'#94a3b8');
    edge(s.A,s.B); edge(s.B,s.C); edge(s.C,s.A);
    xs.push(s.A.x,s.B.x,s.C.x); ys.push(s.A.y,s.B.y,s.C.y);

    // --- G と H を常時表示（オイラー線の確認用） ---
    point(ctx,[geom.H.x,geom.H.y],'H','#ef4444','#ef4444',7,true);
    point(ctx,[geom.G.x,geom.G.y],'G','#111827','#111827',7,true);
    xs.push(geom.H.x, geom.G.x);
    ys.push(geom.H.y, geom.G.y);

    // 外心・外接円（任意）
    if (geom.valid && s.showCircum){
      const {X,Y} = circlePoly(geom.O, geom.Rn_def*2);
      curve(ctx,X,Y,'#60a5fa'); // 外接円（塗りなし）
      point(ctx,[geom.O.x,geom.O.y],'O','#60a5fa','#60a5fa',7,true);
    }

    // オイラー線（無限直線にして視野全体で表示）
    if (geom.valid && s.showEulerLine){
      const dir = sub(geom.H, geom.O);
      const bb = (brd?.getBoundingBox?.() ?? [-6,6,6,-6]) as [number,number,number,number];
      const seg = clipLineThroughPointDir(geom.O, dir, bb[0], bb[2], bb[3], bb[1]);
      if (seg) dashed(ctx,[seg[0].x,seg[0].y],[seg[1].x,seg[1].y],'#f59e0b');
    }

    // 9点：中点
    if (s.showMid){
      const mids = [geom.Ma, geom.Mb, geom.Mc];
      for (const [i,M] of mids.entries()){
        point(ctx,[M.x,M.y],`M${['a','b','c'][i]}`,'#0ea5e9','#0ea5e9',6,true);
        xs.push(M.x); ys.push(M.y);
      }
    }

    // 9点：垂足
    if (s.showFeet){
      const feet = [geom.Ha, geom.Hb, geom.Hc];
      for (const [i,Hf] of feet.entries()){
        point(ctx,[Hf.x,Hf.y],`H${['a','b','c'][i]}`,'#22c55e','#22c55e',6,true);
        xs.push(Hf.x); ys.push(Hf.y);
        dashed(ctx,[ [s.A,s.B,s.C][i].x, [s.A,s.B,s.C][i].y ], [Hf.x,Hf.y], '#22c55e');
      }
    }

    // 9点：AH/BH/CH の中点
    if (geom.valid && s.showAHmid){
      const mids = [geom.Pa, geom.Pb, geom.Pc];
      for (const [i,Pm] of mids.entries()){
        point(ctx,[Pm.x,Pm.y],`P${['a','b','c'][i]}`,'#9333ea','#9333ea',6,true);
        xs.push(Pm.x); ys.push(Pm.y);
      }
    }

    // 九点円（定義円 N_def, Rn_def）を描く（= 9点を通る円）
    if (geom.valid){
      point(ctx,[geom.N_def.x,geom.N_def.y],'N','#f97316','#f97316',7,true);
      const {X,Y} = circlePoly(geom.N_def, geom.Rn_def);
      curve(ctx,X,Y,'#f97316'); // 塗りなし
      xs.push(geom.N_def.x); ys.push(geom.N_def.y);
    }

    // ドラッグ点（最前面）
    const pA = point(ctx,[s.A.x,s.A.y],'A','#111','#fff',9,false);
    const pB = point(ctx,[s.B.x,s.B.y],'B','#111','#fff',9,false);
    const pC = point(ctx,[s.C.x,s.C.y],'C','#111','#fff',9,false);
    try{ pA.on('drag',()=>set({A:{x:pA.X(),y:pA.Y()}})); }catch{}
    try{ pB.on('drag',()=>set({B:{x:pB.X(),y:pB.Y()}})); }catch{}
    try{ pC.on('drag',()=>set({C:{x:pC.X(),y:pC.Y()}})); }catch{}

    return fitFromPoints(xs.length?xs:[-5,5], ys.length?ys:[-5,5]);
  };

  return (
    <StepperBase<State>
      title="九点円（外心・垂心・重心・オイラー線）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">A.x</span><NumInput value={st.A.x} onChange={(v)=>set({A:{...st.A,x:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">A.y</span><NumInput value={st.A.y} onChange={(v)=>set({A:{...st.A,y:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">B.x</span><NumInput value={st.B.x} onChange={(v)=>set({B:{...st.B,x:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">B.y</span><NumInput value={st.B.y} onChange={(v)=>set({B:{...st.B,y:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">C.x</span><NumInput value={st.C.x} onChange={(v)=>set({C:{...st.C,x:v}})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">C.y</span><NumInput value={st.C.y} onChange={(v)=>set({C:{...st.C,y:v}})}/></label>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showCircum} onChange={e=>set({showCircum:e.target.checked})}/><span>外接円 O を表示</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showEulerLine} onChange={e=>set({showEulerLine:e.target.checked})}/><span>オイラー線（O–G–H）</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showMid} onChange={e=>set({showMid:e.target.checked})}/><span>中点 Mₐ,M_b,M_c</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showFeet} onChange={e=>set({showFeet:e.target.checked})}/><span>垂足 Hₐ,H_b,H_c</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showAHmid} onChange={e=>set({showAHmid:e.target.checked})}/><span>AH/BH/CHの中点 Pₐ,P_b,P_c</span></label>
          </div>
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
