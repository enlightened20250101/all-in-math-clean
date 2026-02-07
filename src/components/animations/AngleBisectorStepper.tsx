'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, line, dashed, point, fitFromPoints } from '@/components/graphs/jxgUtils';

type V2 = { x:number; y:number };
type State = {
  A: V2; O: V2; B: V2;             // ∠AOB を扱う（O が頂点）
  showInner: boolean;
  showOuter: boolean;
  showProof: boolean;               // 証明用：Xから両辺への距離等しいことを可視化
  t: number;                         // X の位置（内角二等分線上で補間）
};

const EPS = 1e-9;
const sub=(a:V2,b:V2)=>({x:a.x-b.x,y:a.y-b.y});
const add=(a:V2,b:V2)=>({x:a.x+b.x,y:a.y+b.y});
const mul=(k:number,a:V2)=>({x:k*a.x,y:k*a.y});
const norm=(v:V2)=>Math.hypot(v.x,v.y);
const dot =(a:V2,b:V2)=>a.x*b.x+a.y*b.y;
const unit=(v:V2)=>{ const n=norm(v); return n<EPS?{x:0,y:0}:{x:v.x/n,y:v.y/n}; };
const perp=(v:V2)=>({x:-v.y,y:v.x});

/** 直線を viewport にクリップ（端点2つ） */
function clipLineThroughPointDir(P:V2, v:V2, L:number,R:number,Btm:number,Top:number){
  const pts: V2[] = [];
  const addPt = (t:number)=>{ const x=P.x+t*v.x, y=P.y+t*v.y; if(x>=L-EPS&&x<=R+EPS&&y>=Btm-EPS&&y<=Top+EPS) pts.push({x,y}); };
  if (Math.abs(v.x)>EPS){ addPt((L-P.x)/v.x); addPt((R-P.x)/v.x); }
  if (Math.abs(v.y)>EPS){ addPt((Btm-P.y)/v.y); addPt((Top-P.y)/v.y); }
  if (pts.length<2) return null;
  // 最遠2点
  let best:[V2,V2]=[pts[0],pts[1]], bestD=-1;
  for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
    const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
    if(d>bestD){bestD=d;best=[pts[i],pts[j]];}
  }
  return best;
}

/** 点Pから直線（O,dir）への垂足 */
function footToLine(P:V2,O:V2,dir:V2){
  const u=unit(dir);
  const OP=sub(P,O);
  const t=dot(OP,u);
  return add(O, mul(t,u));
}

/** 点Pから直線（A,B）への距離 */
function distPointLine(P:V2,A:V2,B:V2){
  const v=sub(B,A), n=norm(v)||1;
  return Math.abs((v.y)*(P.x-A.x) - (v.x)*(P.y-A.y))/n;
}

export default function AngleBisectorStepper(){
  const [s,setS]=useState<State>({
    A:{x:-3,y:-0.5},
    O:{x:0,y:0},
    B:{x:3,y:1.0},
    showInner:true,
    showOuter:true,
    showProof:true,
    t:0.45,
  });
  const set=(p:Partial<State>)=>setS(v=>({...v,...p}));

  // 単位方向・二等分線方向
  const uA = unit(sub(s.A,s.O));
  const uB = unit(sub(s.B,s.O));
  const vIn  = unit(add(uA,uB));                          // 内角二等分線の方向ベクトル
  const vOut = unit(add(uA, mul(-1,uB)));                 // 外角二等分線（A と -B の内分）
  const angleOK = norm(vIn)>EPS;                          // 180°に近いなどで無効な場合あり

  // X を内角二等分線上の点として生成（O + α*vIn）
  const X = useMemo(()=> add(s.O, mul(2+s.t*3, vIn)), [s.O, vIn, s.t]); // 適当なスケールで視野に入るよう調整

  /* ===== 数式パネル ===== */
  const Formulas = ()=>{
    const distXA = distPointLine(X,s.O,s.A);
    const distXB = distPointLine(X,s.O,s.B);
    const dtex = (x:number)=> (Number.isFinite(x)? x.toFixed(3) : '—');
    return (
      <div className="space-y-2">
        <KaTeXBlock tex={String.raw`\textbf{角の二等分線（内角・外角）}`} />
        <KaTeXBlock tex={String.raw`\text{二等分線の性質: } \ \forall X\ \text{on 内角二等分線},\ \mathrm{dist}(X,OA)=\mathrm{dist}(X,OB)`} />
        {s.showProof && (
          <KaTeXBlock tex={String.raw`\mathrm{dist}(X,OA)\approx ${dtex(distXA)}\quad ,\quad \mathrm{dist}(X,OB)\approx ${dtex(distXB)}`} />
        )}
      </div>
    );
  };

  /* ===== 描画 ===== */
  const draw = (brd:any,_:State,ctx:any): DrawResult=>{
    grid(ctx);
    const bb = brd?.getBoundingBox?.() ?? [-6,6,6,-6];
    const [L,Top,R,Btm] = [bb[0],bb[1],bb[2],bb[3]];
    const fitX:number[]=[], fitY:number[]=[];

    // OA, OB の腕
    const seg = (P:V2,Q:V2,color:string)=> line(ctx,[P.x,P.y],[Q.x,Q.y],color);
    seg(s.O, s.A, '#94a3b8');
    seg(s.O, s.B, '#94a3b8');
    fitX.push(s.O.x,s.A.x,s.B.x); fitY.push(s.O.y,s.A.y,s.B.y);

    // 内角・外角の二等分線
    if (s.showInner && angleOK){
      const segIn = clipLineThroughPointDir(s.O, vIn, L,R,Btm,Top);
      if (segIn) dashed(ctx,[segIn[0].x,segIn[0].y],[segIn[1].x,segIn[1].y],'#0ea5e9');
    }
    if (s.showOuter && norm(vOut)>EPS){
      const segOut = clipLineThroughPointDir(s.O, vOut, L,R,Btm,Top);
      if (segOut) dashed(ctx,[segOut[0].x,segOut[0].y],[segOut[1].x,segOut[1].y],'#22c55e');
    }

    // 証明の可視化：X から両辺へ垂線
    if (s.showProof && angleOK){
      // X をプロット
      point(ctx,[X.x,X.y],'X','#f59e0b','#f59e0b',8,true);
      // 垂足
      const H1 = footToLine(X,s.O, sub(s.A,s.O));
      const H2 = footToLine(X,s.O, sub(s.B,s.O));
      dashed(ctx,[X.x,X.y],[H1.x,H1.y],'#ef4444');
      dashed(ctx,[X.x,X.y],[H2.x,H2.y],'#ef4444');
      // 垂足に小点
      point(ctx,[H1.x,H1.y],'','#ef4444','#ef4444',6,true);
      point(ctx,[H2.x,H2.y],'','#ef4444','#ef4444',6,true);
      fitX.push(X.x,H1.x,H2.x); fitY.push(X.y,H1.y,H2.y);
    }

    // ドラッグ点（最後に最前面）
    const pO = point(ctx,[s.O.x,s.O.y],'O','#111','#fff',9,false);
    const pA = point(ctx,[s.A.x,s.A.y],'A','#111','#fff',9,false);
    const pB = point(ctx,[s.B.x,s.B.y],'B','#111','#fff',9,false);
    try{ pO.on('drag',()=>set({O:{x:pO.X(),y:pO.Y()}})); }catch{}
    try{ pA.on('drag',()=>set({A:{x:pA.X(),y:pA.Y()}})); }catch{}
    try{ pB.on('drag',()=>set({B:{x:pB.X(),y:pB.Y()}})); }catch{}

    return fitFromPoints(fitX.length?fitX:[-5,5], fitY.length?fitY:[-5,5]);
  };

  return (
    <StepperBase<State>
      title="角の二等分線（内角／外角）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">A.x</span>
              <NumInput value={st.A.x} onChange={(v)=>set({A:{...st.A,x:v}})} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">A.y</span>
              <NumInput value={st.A.y} onChange={(v)=>set({A:{...st.A,y:v}})} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">O.x</span>
              <NumInput value={st.O.x} onChange={(v)=>set({O:{...st.O,x:v}})} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">O.y</span>
              <NumInput value={st.O.y} onChange={(v)=>set({O:{...st.O,y:v}})} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">B.x</span>
              <NumInput value={st.B.x} onChange={(v)=>set({B:{...st.B,x:v}})} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">B.y</span>
              <NumInput value={st.B.y} onChange={(v)=>set({B:{...st.B,y:v}})} /></label>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showInner} onChange={e=>set({showInner:e.target.checked})}/><span>内角二等分線</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showOuter} onChange={e=>set({showOuter:e.target.checked})}/><span>外角二等分線</span></label>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={st.showProof} onChange={e=>set({showProof:e.target.checked})}/><span>距離が等しいことを可視化</span></label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">X の位置</span>
            <input type="range" min={0} max={1} step={0.01} value={st.t} onChange={e=>set({t:parseFloat(e.target.value)})}/>
            <span className="text-sm">{st.t.toFixed(2)}</span>
          </div>
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
