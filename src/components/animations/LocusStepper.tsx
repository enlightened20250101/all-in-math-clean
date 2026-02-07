'use client';

import React, { useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { toRat } from '@/lib/tex/format';
import { useRafAnim } from '@/components/animations/_shared/useRafAnim';
import { grid, curve, line, circle, dashed, point, fitFromPoints } from '@/components/graphs/jxgUtils';

/** ===== Types ===== */
type Mode = 'perp' | 'apollonius' | 'ellipse' | 'hyperbola' | 'parabola' | 'angle';
type Dir  = 'vertical'|'horizontal';
type V2   = { x:number; y:number };
type State = {
  mode: Mode;
  A: V2; B: V2;
  k: number;        // アポロニウスの比
  S: number;        // 楕円の和（S>|AB|）
  D: number;        // 双曲線の差（0<D<|AB|）
  focus: V2; dir: Dir; d0: number; // 放物線（焦点/準線）
  thetaDeg: number; // 一定角（度）
  showRelation: boolean;          // 破線で可視化
  anim: boolean; speed: number; t: number; // アニメ
};

/** ===== helpers (幾何) ===== */
const clamp   = (n:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, n));
const norm    = (v:V2)=>Math.hypot(v.x, v.y);
const sub     = (a:V2,b:V2)=>({x:a.x-b.x,y:a.y-b.y});
const addV    = (a:V2,b:V2)=>({x:a.x+b.x,y:a.y+b.y});
const mul     = (t:number,v:V2)=>({x:t*v.x,y:t*v.y});
const rot     = (v:V2,a:number)=>({x:v.x*Math.cos(a)-v.y*Math.sin(a),y:v.x*Math.sin(a)+v.y*Math.cos(a)});
const angleOf = (v:V2)=>Math.atan2(v.y, v.x);

/** ===== 数式の分数表示（toRat を使用） ===== */
const texNumFrac = (x:number) => {
  if (!Number.isFinite(x)) return String.raw`\text{—}`;
  if (Math.abs(x) < 1e-12) return '0';
  const r = toRat(x); // {n,d}
  if (r.d === 1) return String(r.n);
  const s = r.n < 0 ? '-' : '';
  const a = Math.abs(r.n);
  return String.raw`${s}\frac{${a}}{${r.d}}`;
};

/** ===== 色 ===== */
const COLOR_MAIN = '#0ea5e9';
const COLOR_AUX  = '#9ca3af';
const COLOR_EQ1  = '#10b981';
const COLOR_EQ2  = '#ef4444';
const COLOR_PT   = '#111111';
const COLOR_X    = '#f59e0b';

/** ===== Main ===== */
export default function LocusStepper(){
  const [s, setS] = useState<State>({
    mode:'perp',
    A:{x:-2,y:0.5}, B:{x: 2,y:-0.3},
    k:1.8, S:6, D:2,
    focus:{x:1.2,y:0.5}, dir:'vertical', d0:-1,
    thetaDeg:40,
    showRelation:true,
    anim:true, speed:1.0, t:0,
  });
  const set = (p:Partial<State>)=>setS(v=>({...v,...p}));

  // アニメ進行（speed=1 で 0.25周/秒）
  useRafAnim(s, setS, 0.25);

  /** ===== 数式・パラメータ（一般形＋数値） ===== */
  const Formulas = ()=>{
    const A=s.A, B=s.B;
    const AB=sub(B,A), L=norm(AB), c=L/2, ang=angleOf(AB), M=mul(0.5, addV(A,B));

    const At = String.raw`\mathbf{A}=\bigl(${texNumFrac(A.x)},\,${texNumFrac(A.y)}\bigr)`;
    const Bt = String.raw`\mathbf{B}=\bigl(${texNumFrac(B.x)},\,${texNumFrac(B.y)}\bigr)`;
    const Mt = String.raw`\mathbf{M}=\frac{\mathbf{A}+\mathbf{B}}{2}=\bigl(${texNumFrac(M.x)},\,${texNumFrac(M.y)}\bigr)`;
    const Lt = String.raw`|AB|\approx ${L.toFixed(3)}`;
    const Angt = String.raw`\arg(\overrightarrow{AB})\approx ${(ang*180/Math.PI).toFixed(1)}^\circ`;

    switch(s.mode){
      case 'perp': {
        const dx=B.x-A.x, dy=B.y-A.y;
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{垂直二等分線}\ \{X\mid |XA|=|XB|\}`} />
            <KaTeXBlock tex={At} /><KaTeXBlock tex={Bt} /><KaTeXBlock tex={Mt} />
            <KaTeXBlock tex={String.raw`\text{方向ベクトル }(-\Delta y,\ \Delta x)=\bigl(${texNumFrac(-dy)},\,${texNumFrac(dx)}\bigr)`}/>
            <KaTeXBlock tex={String.raw`${Lt},\ \ ${Angt}`} />
          </div>
        );
      }
      case 'apollonius': {
        const k=s.k;
        if (Math.abs(k-1)<1e-9){
          return (
            <div className="space-y-1">
              <KaTeXBlock tex={String.raw`\textbf{アポロニウス（特例）}\ k=1\Rightarrow \{X\mid |XA|=|XB|\}`} />
              <KaTeXBlock tex={At} /><KaTeXBlock tex={Bt} /><KaTeXBlock tex={Mt} />
              <KaTeXBlock tex={Lt} />
            </div>
          );
        }
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{アポロニウスの円}\ \{X\mid |XA|:|XB|=k\}`} />
            <KaTeXBlock tex={String.raw`k=${texNumFrac(k)}`} />
            <KaTeXBlock tex={At} /><KaTeXBlock tex={Bt} />
            <KaTeXBlock tex={String.raw`\text{中心 } C=\dfrac{\mathbf{A}-k^2\mathbf{B}}{1-k^2},\quad \text{半径 } r`} />
          </div>
        );
      }
      case 'ellipse': {
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{楕円}\ \{X\mid |XA|+|XB|=S\}`} />
            <KaTeXBlock tex={String.raw`S=${texNumFrac(s.S)},\quad |AB|=2c\Rightarrow c=\frac{|AB|}{2}\approx ${c.toFixed(3)}`} />
            <KaTeXBlock tex={At} /><KaTeXBlock tex={Bt} />
            <KaTeXBlock tex={String.raw`a=\frac{S}{2},\quad b=\sqrt{a^2-c^2}`} />
            <KaTeXBlock tex={Lt} />
          </div>
        );
      }
      case 'hyperbola': {
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{双曲線}\ \{X\mid \bigl||XA|-|XB|\bigr|=D\}`} />
            <KaTeXBlock tex={String.raw`D=${texNumFrac(s.D)},\quad |AB|=2c\Rightarrow c=\frac{|AB|}{2}\approx ${c.toFixed(3)}`} />
            <KaTeXBlock tex={At} /><KaTeXBlock tex={Bt} />
            <KaTeXBlock tex={String.raw`a=\frac{D}{2},\quad b=\sqrt{c^2-a^2}`} />
            <KaTeXBlock tex={Lt} />
          </div>
        );
      }
      case 'parabola': {
        const F=s.focus;
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{放物線}\ \{X\mid |XF|=\mathrm{dist}(X,d)\}`} />
            <KaTeXBlock tex={String.raw`F=\bigl(${texNumFrac(F.x)},\,${texNumFrac(F.y)}\bigr),\ \ d:\ ${s.dir==='vertical'? String.raw`x=${texNumFrac(s.d0)}` : String.raw`y=${texNumFrac(s.d0)}`}`} />
          </div>
        );
      }
      default: {
        return (
          <div className="space-y-2">
            <KaTeXBlock tex={String.raw`\textbf{一定角}\ \{X\mid \angle AXB=\theta\}`} />
            <KaTeXBlock tex={String.raw`\theta=${texNumFrac(s.thetaDeg)}^\circ`} />
            <KaTeXBlock tex={Lt} />
          </div>
        );
      }
    }
  };

  /** ===== 描画（必ず引数 st を使う） ===== */
  const draw = (_brd:any, st:State, ctx:{create:Function}): DrawResult => {
    grid(ctx);

    const A=st.A, B=st.B;
    const AB=sub(B,A), L=norm(AB), ang=angleOf(AB), M=mul(0.5, addV(A,B));
    const contentX:number[]=[], contentY:number[]=[];
    let X:V2|undefined;

    /** 垂直二等分線 */
    if (st.mode==='perp'){
      const dir=rot({x:1,y:0}, ang+Math.PI/2);
      const P1=addV(M,mul(100,dir)), P2=addV(M,mul(-100,dir));
      line(ctx, [P1.x,P1.y], [P2.x,P2.y], COLOR_MAIN);
      contentX.push(P1.x,P2.x); contentY.push(P1.y,P2.y);
      X=addV(M,mul(-50+100*st.t,dir));
      contentX.push(X.x); contentY.push(X.y);
      if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
    }

    /** アポロニウス */
    if (st.mode==='apollonius'){
      const k=st.k;
      if (Math.abs(k-1)<1e-9){
        const dir=rot({x:1,y:0}, ang+Math.PI/2);
        const P1=addV(M,mul(100,dir)), P2=addV(M,mul(-100,dir));
        line(ctx, [P1.x,P1.y], [P2.x,P2.y], COLOR_MAIN);
        contentX.push(P1.x,P2.x); contentY.push(P1.y,P2.y);
        X=addV(M,mul(-50+100*st.t,dir));
        contentX.push(X.x); contentY.push(X.y);
        if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
      }else{
        const k2=k*k, denom=1-k2;
        const C={ x:(A.x-k2*B.x)/denom, y:(A.y-k2*B.y)/denom };
        const r2=(C.x*C.x+C.y*C.y) - (A.x*A.x+A.y*A.y - k2*(B.x*B.x+B.y*B.y))/denom;
        const r=Math.sqrt(Math.max(0, r2));
        circle(ctx, [C.x,C.y], r, COLOR_MAIN);
        const th=2*Math.PI*st.t;
        X={x:C.x + r*Math.cos(th), y:C.y + r*Math.sin(th)};
        contentX.push(C.x-r, C.x+r, X.x);
        contentY.push(C.y-r, C.y+r, X.y);
        if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
      }
    }

    /** 楕円 */
    if (st.mode==='ellipse' && st.S>L){
      const a=st.S/2, c=L/2;
      const bLen=Math.sqrt(Math.max(0, a*a - c*c));
      const N=480, Xs:number[]=[], Ys:number[]=[];
      for(let i=0;i<=N;i++){
        const t=2*Math.PI*i/N;
        const q=rot({x:a*Math.cos(t), y:bLen*Math.sin(t)}, ang);
        Xs.push(M.x+q.x); Ys.push(M.y+q.y);
      }
      curve(ctx, Xs, Ys, COLOR_MAIN); contentX.push(...Xs); contentY.push(...Ys);
      const idx = Math.min(Math.floor(N*st.t), N);
      X={x:Xs[idx], y:Ys[idx]};
      contentX.push(X.x); contentY.push(X.y);
      if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
    }

    /** 双曲線（右枝／左枝の2本の連続曲線） */
    if (st.mode==='hyperbola' && st.D>0 && st.D<L){
      const a=st.D/2, c=L/2;
      const bLen=Math.sqrt(Math.max(0, c*c - a*a));
      const toG=(q:V2)=>addV(M, rot(q,ang));
      const U=4.5, du=0.005;
      const XR:number[]=[], YR:number[]=[], XL:number[]=[], YL:number[]=[];
      for(let u=-U; u<=U; u+=du){
        const xr=a*Math.cosh(u), yr=bLen*Math.sinh(u);
        const pr=toG({x:xr,  y: yr}); XR.push(pr.x); YR.push(pr.y);
        const pl=toG({x:-xr, y: yr}); XL.push(pl.x); YL.push(pl.y);
      }
      curve(ctx, XR, YR, COLOR_MAIN); curve(ctx, XL, YL, COLOR_MAIN);
      contentX.push(...XR, ...XL); contentY.push(...YR, ...YL);
      const ur=-U + 2*U*st.t;
      const Xr=toG({x:a*Math.cosh(ur), y:bLen*Math.sinh(ur)});
      X=Xr; contentX.push(X.x); contentY.push(X.y);
      if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
    }

    /** 放物線（厳密：|XF| = dist(X, directrix) を満たすパラメトリック） */
    if (st.mode==='parabola'){
      const F=st.focus;
      if (st.dir==='vertical'){
        // directrix: x = d
        const d = st.d0;
        const xv = (F.x + d)/2, yv = F.y;         // vertex
        const p  = (F.x - d)/2;                   // focal length
        // 準線
        line(ctx, [d,-9999],[d,9999], COLOR_EQ2);
        // 曲線：u を y の偏差としてサンプル（ (y-Fy)^2 = 4p(x-xv) ）
        const U = 30; const du = 0.05;
        const X1:number[]=[], Y1:number[]=[];
        for(let u=-U; u<=U; u+=du){
          const y = yv + u;
          const x = xv + (u*u)/(4*p);
          X1.push(x); Y1.push(y);
        }
        curve(ctx, X1, Y1, COLOR_MAIN);
        contentX.push(...X1); contentY.push(...Y1);
        const u = -U + 2*U*st.t;
        X = { x: xv + (u*u)/(4*p), y: yv + u };
        contentX.push(X.x); contentY.push(X.y);
        if(st.showRelation && X){
          dashed(ctx,[F.x,F.y],[X.x,X.y],COLOR_EQ1);
          dashed(ctx,[X.x,X.y],[d,X.y],COLOR_EQ2);
        }
      }else{
        // directrix: y = d
        const d = st.d0;
        const xv = F.x, yv = (F.y + d)/2;
        const p  = (F.y - d)/2;
        line(ctx, [-9999,d],[9999,d], COLOR_EQ2);
        const U = 30; const du = 0.05;
        const X1:number[]=[], Y1:number[]=[];
        for(let u=-U; u<=U; u+=du){
          const x = xv + u;
          const y = yv + (u*u)/(4*p);
          X1.push(x); Y1.push(y);
        }
        curve(ctx, X1, Y1, COLOR_MAIN);
        contentX.push(...X1); contentY.push(...Y1);
        const u = -U + 2*U*st.t;
        X = { x: xv + u, y: yv + (u*u)/(4*p) };
        contentX.push(X.x); contentY.push(X.y);
        if(st.showRelation && X){
          dashed(ctx,[F.x,F.y],[X.x,X.y],COLOR_EQ1);
          dashed(ctx,[X.x,X.y],[X.x,d],COLOR_EQ2);
        }
      }
    }

    /** 一定角 */
    if (st.mode==='angle'){
      const theta=st.thetaDeg*Math.PI/180;
      if(theta>0 && theta<Math.PI){
        const dirp=rot({x:1,y:0}, angleOf(AB)+Math.PI/2);
        const R=L/(2*Math.sin(theta)), h=L/(2*Math.tan(theta));
        const C1=addV(M, mul(h, dirp)), C2=addV(M, mul(-h, dirp));
        circle(ctx, [C1.x,C1.y], R, COLOR_MAIN);
        circle(ctx, [C2.x,C2.y], R, COLOR_MAIN);
        const th=2*Math.PI*st.t;
        X={x:C1.x + R*Math.cos(th), y:C1.y + R*Math.sin(th)};
        contentX.push(C1.x-R, C1.x+R, C2.x-R, C2.x+R, X.x);
        contentY.push(C1.y-R, C1.y+R, C2.y-R, C2.y+R, X.y);
        if(st.showRelation){ dashed(ctx,[A.x,A.y],[X.x,X.y],COLOR_EQ1); dashed(ctx,[B.x,B.y],[X.x,X.y],COLOR_EQ2); }
      }
    }

    /** 点X（代表点） */
    if (X){
      point(ctx, [X.x,X.y], 'X', COLOR_X, COLOR_X, 8, true);
    }

    /** A/B は parabola 以外でだけ表示。F は parabola のみ。 */
    if (st.mode!=='parabola'){
      const pA = point(ctx, [A.x,A.y], 'A', COLOR_PT, '#fff', 9, false);
      const pB = point(ctx, [B.x,B.y], 'B', COLOR_PT, '#fff', 9, false);
      try{ pA.on('drag',()=> set({A:{x:pA.X(), y:pA.Y()}})); }catch(_e){}
      try{ pB.on('drag',()=> set({B:{x:pB.X(), y:pB.Y()}})); }catch(_e){}
      contentX.push(A.x,B.x); contentY.push(A.y,B.y);
    }else{
      const F = st.focus;
      const pF = point(ctx, [F.x,F.y], 'F', COLOR_EQ2, '#fff', 9, false);
      try{ pF.on('drag',()=> set({focus:{x:pF.X(), y:pF.Y()}})); }catch(_e){}
      contentX.push(F.x); contentY.push(F.y);
    }

    /** AutoFit: 実描画点のみで算出 */
    return fitFromPoints(contentX, contentY);
  };

  return (
    <StepperBase<State>
      title="軌跡ラボ（垂直二等分線／アポロニウス／楕円／双曲線／放物線／一定角）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-4">
          {/* モード & 表示オプション */}
          <div className="flex flex-wrap gap-2">
            {(['perp','apollonius','ellipse','hyperbola','parabola','angle'] as Mode[]).map(m=>(
              <button key={m} onClick={()=>set({mode:m})}
                className={`px-3 py-1 rounded border ${st.mode===m?'bg-gray-900 text-white':'bg-white'}`}>
                {m==='perp'?'垂直二等分線':m==='apollonius'?'アポロニウス':m==='ellipse'?'楕円':m==='hyperbola'?'双曲線':m==='parabola'?'放物線':'一定角'}
              </button>
            ))}
            <label className="ml-3 text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showRelation} onChange={e=>set({showRelation:e.target.checked})}/>
              <span>関係の可視化</span>
            </label>
            <label className="ml-3 text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.anim} onChange={e=>set({anim:e.target.checked})}/>
              <span>アニメ</span>
            </label>
            <label className="text-sm flex items-center gap-2">
              <span>速度</span>
              <input type="range" min={0.3} max={3} step={0.1} value={st.speed}
                     onChange={e=>set({speed:parseFloat(e.target.value)})}/>
              <span>{st.speed.toFixed(1)}×</span>
            </label>
          </div>

          {/* A,B 座標（parabola 以外のみ表示） */}
          {st.mode!=='parabola' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">A.x</span>
                <NumInput value={st.A.x} onChange={(x)=>set({A:{...st.A,x}})} /></label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">A.y</span>
                <NumInput value={st.A.y} onChange={(y)=>set({A:{...st.A,y}})} /></label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">B.x</span>
                <NumInput value={st.B.x} onChange={(x)=>set({B:{...st.B,x}})} /></label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">B.y</span>
                <NumInput value={st.B.y} onChange={(y)=>set({B:{...st.B,y}})} /></label>
            </div>
          )}

          {/* 各モードのパラメータ */}
          {st.mode==='apollonius' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">比 k（|XA|:|XB|）</span>
                <NumInput value={st.k} onChange={(k)=>set({k:Math.max(0.01,Math.abs(k))})} /></label>
              <div className="text-xs text-gray-500"><KaTeXBlock tex={String.raw`k\neq 1\ \Rightarrow\ \text{円}`} /></div>
            </div>
          )}

          {st.mode==='ellipse' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">和 S</span>
                <NumInput value={st.S} onChange={(S)=>set({S:Math.max(0.01,S)})} /></label>
              <div className="text-xs text-gray-500"><KaTeXBlock tex={String.raw`S>|AB|`} /></div>
            </div>
          )}

          {st.mode==='hyperbola' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">差 D</span>
                <NumInput value={st.D} onChange={(D)=>set({D:Math.max(0.01,D)})} /></label>
              <div className="text-xs text-gray-500"><KaTeXBlock tex={String.raw`0<D<|AB|`} /></div>
            </div>
          )}

          {st.mode==='parabola' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">焦点 F.x</span>
                <NumInput value={st.focus.x} onChange={(x)=>set({focus:{...st.focus,x}})} /></label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">焦点 F.y</span>
                <NumInput value={st.focus.y} onChange={(y)=>set({focus:{...st.focus,y}})} /></label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">準線 方向</span>
                <select className="rounded border px-2 py-1" value={st.dir} onChange={e=>set({dir:e.target.value as Dir})}>
                  <option value="vertical">x = d</option>
                  <option value="horizontal">y = d</option>
                </select>
              </label>
              <label className="text-sm"><span className="block mb-1 text-gray-600">準線 d</span>
                <NumInput value={st.d0} onChange={(d0)=>set({d0})} /></label>
            </div>
          )}

          {st.mode==='angle' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <label className="text-sm"><span className="block mb-1 text-gray-600">角度 θ（度）</span>
                <NumInput value={st.thetaDeg} onChange={(v)=>set({thetaDeg:clamp(v,1,179)})} /></label>
              <div className="text-xs text-gray-500"><KaTeXBlock tex={String.raw`0^\circ<\theta<180^\circ`} /></div>
            </div>
          )}
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
