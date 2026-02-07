// src/components/animations/ComplexPlaneStepper.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';

/** ===== types ===== */
type Mode =
  | 'plot'        // 単点・極形式・共役
  | 'muldiv'      // 乗法・除法（結果も表示）
  | 'transform'   // 拡大 k ＋ 回転 φ
  | 'nthroots'    // n乗根
  | 'demoivre'    // De Moivre の定理
  | 'mulanim';    // 乗法の幾何アニメ（回転×拡大）

type Z = { a:number; b:number };

/** ===== math helpers ===== */
const EPS = 1e-12;
const isZero = (x:number)=>Math.abs(x)<EPS;

const gcd = (a:number,b:number)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a||1;};
const toFrac = (x:number, maxDen=48)=>{
  const s = Math.sign(x)||1, ax=Math.abs(x);
  const ir=Math.round(ax);
  if (Math.abs(ax-ir)<1e-10) return {n:s*ir,d:1};
  let bestN=ir,bestD=1,bestErr=Math.abs(ax-ir);
  for(let d=2; d<=maxDen; d++){ const n=Math.round(ax*d),e=Math.abs(ax-n/d); if(e<bestErr-1e-12){bestErr=e;bestN=n;bestD=d;} }
  const g=gcd(bestN,bestD);
  return {n:s*(bestN/g), d:bestD/g};
};
const texNum = (x:number) => {
  if (isZero(x)) return '0';
  const {n,d}=toFrac(x);
  if (d===1) return String(n);
  const s = n<0 ? '-' : '';
  const a = Math.abs(n);
  return String.raw`${s}\frac{${a}}{${d}}`;
};

// a+bi を最小形で
const texComplex = (z:Z) => {
  const a0 = isZero(z.a), b0 = isZero(z.b);
  if (a0 && b0) return '0';
  const aS = a0 ? '' : texNum(z.a);
  let bS = '';
  if (!b0) {
    const mag = Math.abs(z.b);
    const mStr = (Math.abs(mag-1)<EPS)? '' : texNum(mag);
    bS = (z.b>0 ? (a0?'':' + ') : ' - ') + (mStr?`${mStr}`:'') + 'i';
  }
  return `${aS}${bS}`.replace(/^\s*\+\s*/,'').trim() || '0';
};

// 極座標
const rtheta = (z:Z) => {
  const r = Math.hypot(z.a, z.b);
  const th = Math.atan2(z.b, z.a); // [-π,π]
  return { r, th };
};
const cis = (th:number) => ({ a: Math.cos(th), b: Math.sin(th) });
const mul = (z:Z,w:Z):Z => ({ a: z.a*w.a - z.b*w.b, b: z.a*w.b + z.b*w.a });
const div = (z:Z,w:Z):Z => {
  const d = w.a*w.a + w.b*w.b;
  if (isZero(d)) return { a: NaN, b: NaN };
  return { a: (z.a*w.a + z.b*w.b)/d, b: (z.b*w.a - z.a*w.b)/d };
};
const scaleRotate = (z:Z, k:number, phi:number):Z => mul({a:k, b:0}, mul(z, cis(phi)));

const polarTex_cis = (z:Z) => {
  const { r, th } = rtheta(z);
  const deg = (th*180/Math.PI);
  return String.raw`r=${texNum(r)}\ ,\ \arg z\approx ${deg.toFixed(2)}^\circ\quad(\operatorname{cis}\theta=\cos\theta+i\sin\theta)`;
};
const polarTex_exp = (z:Z) => {
  const { r, th } = rtheta(z);
  const deg = (th*180/Math.PI);
  return String.raw`z=r\,e^{i\theta},\ \ r=${texNum(r)}\ ,\ \theta\approx ${deg.toFixed(2)}^\circ`;
};

export default function ComplexPlaneStepper(){
  const [mode, setMode] = useState<Mode>('plot');

  // z, w
  const [z, setZ] = useState<Z>({ a:2, b:1 });
  const [w, setW] = useState<Z>({ a:1, b:1 });
  const [showW, setShowW] = useState(true);

  // transform
  const [k, setK] = useState(1);            // scale
  const [phiDeg, setPhiDeg] = useState(45); // degrees
  const phi = (phiDeg||0) * Math.PI/180;

  // nth roots
  const [n, setN] = useState(5);
  const [showUnitCircle, setShowUnitCircle] = useState(true);

  // 表記：cis / exp の切替
  const [useExpForm, setUseExpForm] = useState(false);

  // 幾何アニメ（乗法 z * w）
  const [animPlaying, setAnimPlaying] = useState(true);
  const [animSpeed, setAnimSpeed]     = useState(1);     // 1x 基準
  const [animT, setAnimT]             = useState(0);     // 0..1
  const [animTrail, setAnimTrail]     = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  // RAF: 3秒/1x を基準に 0→1 へ
  useEffect(()=>{
    if (mode!=='mulanim' || !animPlaying) { lastTs.current=null; return; }
    const durMs = 3000 / Math.max(0.1, animSpeed);
    const step = (ts:number)=>{
      if (lastTs.current==null) lastTs.current = ts;
      const dt = ts - lastTs.current;
      lastTs.current = ts;
      setAnimT(t => {
        let u = t + dt/durMs;
        if (u>=1) u = 0;  // ループ（停止したいなら 1 固定に）
        return u;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return ()=>{ if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current=null; };
  }, [mode, animPlaying, animSpeed]);

  /** ===== formulas ===== */
  const formulas = useMemo(()=>{
    const withPolar = (z:Z)=> useExpForm ? polarTex_exp(z) : polarTex_cis(z);

    if (mode==='plot'){
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">複素数と極形式</div>
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}`} />
          <KaTeXBlock tex={String.raw`${withPolar(z)}`} />
          <div className="text-sm text-gray-500">共役</div>
          <KaTeXBlock tex={String.raw`\overline{z}=${texComplex({a:z.a,b:-z.b})}`} />
        </div>
      );
    }

    if (mode==='muldiv'){
      const zw = mul(z,w);
      const z_over_w = div(z,w);
      const pz = rtheta(z), pw=rtheta(w);
      const mulTex = isFinite(zw.a)&&isFinite(zw.b)
        ? String.raw`=${texComplex(zw)}\quad\bigl(r_z r_w,\ \theta_z+\theta_w\bigr)`
        : String.raw`=\text{未定義}`;
      const divTex = isFinite(z_over_w.a)&&isFinite(z_over_w.b)
        ? String.raw`=${texComplex(z_over_w)}\quad\bigl(\frac{r_z}{r_w},\ \theta_z-\theta_w\bigr)`
        : String.raw`=\text{未定義（ }w=0\text{ ）}`;

      const mulPolar = useExpForm
        ? String.raw`z\cdot w = r_z r_w\,e^{\,i(\theta_z+\theta_w)}`
        : String.raw`z\cdot w = r_z r_w\,\operatorname{cis}(\theta_z+\theta_w)`;
      const divPolar = useExpForm
        ? String.raw`\dfrac{z}{w} = \dfrac{r_z}{r_w}\,e^{\,i(\theta_z-\theta_w)}`
        : String.raw`\dfrac{z}{w} = \dfrac{r_z}{r_w}\,\operatorname{cis}(\theta_z-\theta_w)`;

      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">乗法と除法（回転＋拡大縮小）</div>
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}\ ,\ \ w=${texComplex(w)}`} />
          <KaTeXBlock tex={withPolar(z)} />
          <KaTeXBlock tex={withPolar(w)} />
          <KaTeXBlock tex={mulPolar} />
          <KaTeXBlock tex={String.raw`z\cdot w\ ${mulTex}`} />
          <KaTeXBlock tex={divPolar} />
          <KaTeXBlock tex={String.raw`z/w\ ${divTex}`} />
        </div>
      );
    }

    if (mode==='transform'){
      const z2 = scaleRotate(z,k,phi);
      const transEq = useExpForm
        ? String.raw`z' = k\,e^{i\phi}\,z`
        : String.raw`z' = k\,\operatorname{cis}\phi\ \cdot z`;
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">線形変換（拡大 k と回転 φ）</div>
          <KaTeXBlock tex={transEq}/>
          <KaTeXBlock tex={String.raw`k=${texNum(k)}\ ,\ \phi\approx ${phiDeg.toFixed(2)}^\circ`} />
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}\ \ \Rightarrow\ \ z'=${texComplex(z2)}`} />
        </div>
      );
    }

    if (mode==='nthroots'){
      const { r, th } = rtheta(z);
      const formula = useExpForm
        ? String.raw`z^{1/n}=r^{1/n}\ e^{\,i(\theta+2\pi k)/n}\ (k=0,\dots,n-1)`
        : String.raw`z^{1/n}=r^{1/n}\ \operatorname{cis}\frac{\theta+2\pi k}{n}\ (k=0,\dots,n-1)`;
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">n 乗根（De Moivre の逆）</div>
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}=r\,e^{i\theta}\ \text{とする}`}/>
          <KaTeXBlock tex={formula}/>
          <KaTeXBlock tex={String.raw`r=${texNum(r)}\ ,\ \theta\approx ${(th*180/Math.PI).toFixed(2)}^\circ\ ,\ \ n=${n}`} />
        </div>
      );
    }

    if (mode==='demoivre'){
      const { r, th } = rtheta(z);
      const theorem = useExpForm
        ? String.raw`(r\,e^{i\theta})^{n} = r^{\,n}\,e^{\,i n\theta}`
        : String.raw`(r\,\operatorname{cis}\theta)^{n} = r^{\,n}\,\operatorname{cis}(n\theta)`;
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">De Moivre の定理</div>
          <KaTeXBlock tex={theorem}/>
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}\ ,\ r=${texNum(r)}\ ,\ \theta\approx ${(th*180/Math.PI).toFixed(2)}^\circ\ ,\ n=${n}`} />
        </div>
      );
    }

    if (mode==='mulanim'){
      const pz=rtheta(z), pw=rtheta(w);
      const expl = useExpForm
        ? String.raw`z\mapsto e^{i\,\arg w}\cdot z\quad\&\quad \lvert z\rvert\mapsto \lvert w\rvert\cdot\lvert z\rvert`
        : String.raw`z\mapsto \operatorname{cis}(\arg w)\cdot z\quad\&\quad \lvert z\rvert\mapsto \lvert w\rvert\cdot\lvert z\rvert`;
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">幾何アニメ：乗法 \(z\cdot w\)</div>
          <KaTeXBlock tex={String.raw`z=${texComplex(z)}\ ,\ |z|=${texNum(pz.r)}\ ,\ \arg z\approx ${(pz.th*180/Math.PI).toFixed(2)}^\circ`} />
          <KaTeXBlock tex={String.raw`w=${texComplex(w)}\ ,\ |w|=${texNum(pw.r)}\ ,\ \arg w\approx ${(pw.th*180/Math.PI).toFixed(2)}^\circ`} />
          <KaTeXBlock tex={expl} />
          <div className="text-xs text-gray-500">※ 角度と半径を 0→1 の割合で補間して、現在の \(z_t\) を描画しています。</div>
        </div>
      );
    }

    return null;
  }, [mode, z, w, k, phi, phiDeg, n, useExpForm]);

  /** ===== draw (JSXGraph) ===== */
  const draw = (brd:any, s:any, ctx:{create:Function, add:Function}): DrawResult => {
    // grid & axes
    ctx.create('grid', [], { strokeColor:'#e5e7eb', strokeWidth:1, dash:0, strokeOpacity:1 });

    // arrow: segment + two head lines（短め）
    const arrow = (A:[number,number], B:[number,number], color:string, thick=2)=>{
      const seg = ctx.create('segment', [A,B], { strokeColor:color, strokeWidth:thick, linecap:'round', highlight:false, fixed:true });
      ctx.add(seg);
      const dx=B[0]-A[0], dy=B[1]-A[1], Ls=Math.hypot(dx,dy)||1;
      const ux=dx/Ls, uy=dy/Ls;
      const headL=Math.min(0.18, 0.08*Ls), headW=headL*0.45;
      const left:[number,number]=[B[0]-ux*headL+uy*headW, B[1]-uy*headL-ux*headW];
      const right:[number,number]=[B[0]-ux*headL-uy*headW, B[1]-uy*headL+ux*headW];
      ctx.create('segment',[B,left],{ strokeColor:color, strokeWidth:thick, fixed:true, highlight:false });
      ctx.create('segment',[B,right],{ strokeColor:color, strokeWidth:thick, fixed:true, highlight:false });
    };

    const xs:number[]=[0], ys:number[]=[0];
    const O:[number,number]=[0,0];

    // ユニットサークル
    if (showUnitCircle){
      const N=256; const X:number[]=[], Y:number[]=[];
      for(let i=0;i<=N;i++){ const t=2*Math.PI*i/N; X.push(Math.cos(t)); Y.push(Math.sin(t)); }
      ctx.create('curve',[X,Y],{ strokeColor:'#cbd5e1', strokeWidth:1, highlight:false, fixed:true });
      xs.push(-1,1); ys.push(-1,1);
    }

    const drawZ = (zz:Z, color:string, thick=2)=>{
      const P:[number,number]=[zz.a, zz.b];
      arrow(O, P, color, thick);
      xs.push(zz.a); ys.push(zz.b);
    };

    if (mode==='plot'){
      drawZ(z,'#0ea5e9');
    } else if (mode==='muldiv'){
      drawZ(z,'#0ea5e9');
      if (showW) drawZ(w,'#22c55e');
      const zw = mul(z,w);
      if (isFinite(zw.a)&&isFinite(zw.b)) drawZ(zw,'#111827');
      const z_over_w = div(z,w);
      if (isFinite(z_over_w.a)&&isFinite(z_over_w.b)) drawZ(z_over_w,'#f97316');
    } else if (mode==='transform'){
      drawZ(z,'#0ea5e9');
      const z2 = scaleRotate(z,k,phi);
      drawZ(z2,'#111827');
    } else if (mode==='nthroots'){
      const { r, th } = rtheta(z);
      const Rn = Math.pow(r, 1/Math.max(1,n));
      const pts:[number,number][]=[];
      for(let kk=0;kk<n;kk++){
        const ang = (th + 2*Math.PI*kk)/n;
        pts.push([Rn*Math.cos(ang), Rn*Math.sin(ang)]);
      }
      // 点 + 薄い多角形
      pts.forEach(p=>{
        const q = ctx.create('point', p, { name:'', size:2, strokeColor:'#0ea5e9', fillColor:'#0ea5e9', fixed:true, highlight:false });
        ctx.add(q);
        xs.push(p[0]); ys.push(p[1]);
      });
      const poly = ctx.create('polygon', pts, { withVertices:false, highlight:false, borders:{ strokeColor:'#38bdf8', strokeWidth:1 }, fillColor:'#38bdf8', fillOpacity:0.08 });
      ctx.add(poly);
    } else if (mode==='demoivre'){
      const { r, th } = rtheta(z);
      const zn:Z = { a: Math.pow(r, n)*Math.cos(n*th), b: Math.pow(r, n)*Math.sin(n*th) };
      drawZ(z,'#0ea5e9');
      if (isFinite(zn.a)&&isFinite(zn.b)) drawZ(zn,'#111827');
    } else if (mode==='mulanim'){
      // z_t = (1 + t*(|w|-1)) * cis(t*arg w) * z
      const rz = rtheta(z); const rw = rtheta(w);
      const T = animT;
      const s = 1 + T*(Math.max(0, rw.r) - 1);
      const th = T*rw.th;
      const zt = scaleRotate(z, s, th);

      // 0..T の軌跡（アーク＋スケール補間）
      const STEPS = Math.max(12, Math.floor(80*T));
      const arcX:number[] = [], arcY:number[] = [];
      for(let i=0;i<=STEPS;i++){
        const tt = (T===0)?0:(i/Math.max(1,STEPS))*T;
        const ss = 1 + tt*(Math.max(0, rw.r) - 1);
        const tht = tt*rw.th;
        const zi = scaleRotate(z, ss, tht);
        arcX.push(zi.a); arcY.push(zi.b);
        xs.push(zi.a); ys.push(zi.b);
      }
      ctx.create('curve',[arcX,arcY],{ strokeColor:'#111827', strokeWidth:1, highlight:false, fixed:true, dash:animTrail?0:2 });

      // 初期 z と現在 z_t、目標 zw
      const zw = mul(z,w);
      drawZ(z,'#0ea5e9',2);
      if (isFinite(zw.a)&&isFinite(zw.b)) drawZ(zw,'#94a3b8',1); // 目標は薄色
      drawZ(zt,'#111827',2);
    }

    // フィット用：コンテンツ範囲のみ返す
    const xxs = xs.length>=2 ? [Math.min(...xs), Math.max(...xs)] : [-1,1];
    const yys = ys.length>=2 ? [Math.min(...ys), Math.max(...ys)] : [-1,1];
    return { xs: xxs, ys: yys };
  };

  /** ===== controls + return ===== */
  const state = { mode, z, w, showW, k, phiDeg, n, showUnitCircle, useExpForm, animPlaying, animSpeed, animT, animTrail };
  return (
    <StepperBase
      title="複素数平面（n乗根・幾何アニメ・指数形式）"
      state={state}
      setState={()=>{}}
      renderControls={() => (
        <div className="space-y-4">
          {/* mode */}
          <div className="flex flex-wrap gap-2">
            {(['plot','muldiv','transform','nthroots','demoivre','mulanim'] as Mode[]).map(m=>(
              <button key={m} type="button" onClick={()=>setMode(m)}
                className={`px-3 py-1 rounded border ${mode===m?'bg-gray-900 text-white':'bg-white'}`}>
                {m==='plot'?'点・極形式'
                  :m==='muldiv'?'乗法/除法'
                  :m==='transform'?'拡大＋回転'
                  :m==='nthroots'?'n乗根'
                  :m==='demoivre'?'De Moivre'
                  :'乗法アニメ'}
              </button>
            ))}
          </div>

          {/* 形式切替（共通） */}
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={useExpForm} onChange={e=>setUseExpForm(e.target.checked)} />
            <span>指数形式 e^{String.raw`i\theta`} で表示する</span>
          </label>

          {/* inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            {/* z */}
            <label className="text-sm"><span className="block mb-1 text-gray-600">z の実部 a</span>
              <NumInput value={z.a} onChange={(a)=>setZ({...z,a})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">z の虚部 b</span>
              <NumInput value={z.b} onChange={(b)=>setZ({...z,b})}/></label>

            {/* w（mul/div / mulanim） */}
            {(mode==='muldiv' || mode==='mulanim') && (
              <>
                <label className="text-sm"><span className="block mb-1 text-gray-600">w の実部 a</span>
                  <NumInput value={w.a} onChange={(a)=>setW({...w,a})}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">w の虚部 b</span>
                  <NumInput value={w.b} onChange={(b)=>setW({...w,b})}/></label>
                {mode==='muldiv' && (
                  <label className="text-sm flex items-center gap-2 col-span-full">
                    <input type="checkbox" checked={showW} onChange={e=>setShowW(e.target.checked)}/>
                    <span>w も表示する</span>
                  </label>
                )}
              </>
            )}

            {/* transform */}
            {mode==='transform' && (
              <>
                <label className="text-sm"><span className="block mb-1 text-gray-600">拡大 k</span>
                  <NumInput value={k} onChange={(x)=>setK(x)}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">回転 φ（度）</span>
                  <NumInput value={phiDeg} onChange={(d)=>setPhiDeg(d)}/></label>
              </>
            )}

            {/* nth roots / De Moivre */}
            {(mode==='nthroots'||mode==='demoivre') && (
              <>
                <label className="text-sm"><span className="block mb-1 text-gray-600">n</span>
                  <NumInput value={n} onChange={(x)=>setN(Math.max(1, Math.round(x)))}/></label>
              </>
            )}
          </div>

          {/* アニメ制御（mulanim） */}
          {mode==='mulanim' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={animPlaying} onChange={e=>setAnimPlaying(e.target.checked)} />
                <span>再生</span>
              </label>
              <label className="text-sm flex items-center gap-2">
                <input type="checkbox" checked={animTrail} onChange={e=>setAnimTrail(e.target.checked)} />
                <span>軌跡を塗らず線で表示</span>
              </label>
              <label className="text-sm flex items-center gap-2 col-span-2">
                <span>速度</span>
                <input type="range" min={0.2} max={3} step={0.1} value={animSpeed}
                  onChange={(e)=>setAnimSpeed(parseFloat(e.target.value)||1)} className="w-40"/>
                <span className="text-xs text-gray-500">{animSpeed.toFixed(1)}x</span>
              </label>
              <div className="text-right">
                <button
                  type="button"
                  onClick={()=>setAnimT(0)}
                  className="px-3 py-1 text-sm rounded border hover:bg-gray-50"
                  title="アニメ位置を 0 に戻す"
                >リセット</button>
              </div>
            </div>
          )}

          {/* options */}
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showUnitCircle} onChange={e=>setShowUnitCircle(e.target.checked)} />
            <span>単位円を表示</span>
          </label>
        </div>
      )}
      renderFormulas={()=>formulas}
      draw={draw}
      toQuery={(s)=>({
        mode:s.mode,
        za:String(s.z.a), zb:String(s.z.b),
        wa:String(s.w.a), wb:String(s.w.b),
        showW: s.showW?'1':'0',
        k:String(s.k), phi:String(s.phiDeg),
        n:String(s.n),
        unit: s.showUnitCircle?'1':'0',
        exp: s.useExpForm?'1':'0',
        spd:String(s.animSpeed)
      })}
      fromQuery={(qs)=>{
        const num=(k:string)=>{ const v=qs.get(k); if(v==null) return undefined; const n=Number(v); return Number.isFinite(n)?n:undefined; };
        const pick = (v:string|null, arr:string[])=> (v && arr.includes(v)) ? v as Mode : undefined;
        return {
          mode: pick(qs.get('mode'), ['plot','muldiv','transform','nthroots','demoivre','mulanim']),
          z: (num('za')!==undefined || num('zb')!==undefined) ? { a:num('za')??z.a, b:num('zb')??z.b } : undefined,
          w: (num('wa')!==undefined || num('wb')!==undefined) ? { a:num('wa')??w.a, b:num('wb')??w.b } : undefined,
          showW: qs.get('showW')? (qs.get('showW')==='1'||qs.get('showW')==='true') : undefined,
          k: num('k'), phiDeg: num('phi'), n: num('n'),
          showUnitCircle: qs.get('unit')? (qs.get('unit')==='1'||qs.get('unit')==='true') : undefined,
          useExpForm: qs.get('exp')? (qs.get('exp')==='1'||qs.get('exp')==='true') : undefined,
          animSpeed: num('spd')
        } as Partial<typeof state>;
      }}
    />
  );
}
