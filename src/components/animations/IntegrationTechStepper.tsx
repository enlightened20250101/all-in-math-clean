'use client';

import React, { useEffect, useRef, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';

/* ===========================
   Types / State
=========================== */
type Mode = 'substitution' | 'parts';
type State = {
  mode: Mode;
  a: number; b: number;
  anim: boolean; t: number;

  // substitution: f(u), u=g(x)
  fkey: 'exp'|'sin'|'cos'|'poly'|'inv'|'sqrt';
  gkey: 'x2'|'x3'|'x1'|'exp'|'x';

  // parts: u(x), v(x)
  ukey: 'x'|'x2'|'sin'|'cos'|'exp'|'ln1';
  vkey: 'x'|'x2'|'sin'|'cos'|'exp'|'ln1';
};

const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const EPS=1e-12;

/* ===========================
   Safe expression parser: pi, π, sqrt(), ^, + - * / ( )
=========================== */
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

/* ===========================
   Substitution: f(u), u=g(x)
=========================== */
const F = {
  exp : { label:'e^u',       f:(u:number)=>Math.exp(u),        int:(ua:number,ub:number)=>Math.exp(ub)-Math.exp(ua), tex:String.raw`f(u)=e^u` },
  sin : { label:'sin u',     f:(u:number)=>Math.sin(u),        int:(ua:number,ub:number)=>Math.cos(ua)-Math.cos(ub), tex:String.raw`f(u)=\sin u` },
  cos : { label:'cos u',     f:(u:number)=>Math.cos(u),        int:(ua:number,ub:number)=>Math.sin(ub)-Math.sin(ua), tex:String.raw`f(u)=\cos u` },
  poly: { label:'u^2',       f:(u:number)=>u*u,                int:(ua:number,ub:number)=> (ub**3-ua**3)/3,          tex:String.raw`f(u)=u^2` },
  inv : { label:'1/(1+u^2)', f:(u:number)=>1/(1+u*u),          int:(ua:number,ub:number)=>Math.atan(ub)-Math.atan(ua), tex:String.raw`f(u)=\frac{1}{1+u^2}` },
  sqrt: { label:'√u',        f:(u:number)=>Math.sqrt(Math.max(0,u)), int:(ua:number,ub:number)=> (2/3)*(Math.pow(Math.max(ub,0),1.5)-Math.pow(Math.max(ua,0),1.5)), tex:String.raw`f(u)=\sqrt{u}` },
} as const;

const G = {
  x2 : { label:'u=x^2',  g:(x:number)=>x*x,       gp:(x:number)=>2*x,
         tex:String.raw`u=g(x)=x^2,\quad g'(x)=2x`,
         gtex:String.raw`x^2`, gptex:String.raw`2x` },
  x3 : { label:'u=x^3',  g:(x:number)=>x*x*x,     gp:(x:number)=>3*x*x,
         tex:String.raw`u=g(x)=x^3,\quad g'(x)=3x^2`,
         gtex:String.raw`x^3`, gptex:String.raw`3x^2` },
  x1 : { label:'u=x+1',  g:(x:number)=>x+1,       gp:(_x:number)=>1,
         tex:String.raw`u=g(x)=x+1,\quad g'(x)=1`,
         gtex:String.raw`x+1`, gptex:String.raw`1` },
  exp: { label:'u=e^x',  g:(x:number)=>Math.exp(x), gp:(x:number)=>Math.exp(x),
         tex:String.raw`u=g(x)=e^x,\quad g'(x)=e^x`,
         gtex:String.raw`e^x`, gptex:String.raw`e^x` },
  x  : { label:'u=x',    g:(x:number)=>x,         gp:(_x:number)=>1,
         tex:String.raw`u=g(x)=x,\quad g'(x)=1`,
         gtex:String.raw`x`, gptex:String.raw`1` },
} as const;

/* ===========================
   Parts: u(x), v(x)
=========================== */
const U = {
  x  : { label:'u=x',        u:(x:number)=>x,         up:(_x:number)=>1,            tex:String.raw`u=x,\quad du=dx`,           utex:String.raw`x`,     uptex:String.raw`1` },
  x2 : { label:'u=x^2',      u:(x:number)=>x*x,       up:(x:number)=>2*x,           tex:String.raw`u=x^2,\quad du=2x\,dx`,      utex:String.raw`x^2`,   uptex:String.raw`2x` },
  sin: { label:'u=sin x',    u:(x:number)=>Math.sin(x), up:(x:number)=>Math.cos(x),  tex:String.raw`u=\sin x,\quad du=\cos x\,dx`, utex:String.raw`\sin x`, uptex:String.raw`\cos x` },
  cos: { label:'u=cos x',    u:(x:number)=>Math.cos(x), up:(x:number)=>-Math.sin(x), tex:String.raw`u=\cos x,\quad du=-\sin x\,dx`, utex:String.raw`\cos x`, uptex:String.raw`-\sin x` },
  exp: { label:'u=e^x',      u:(x:number)=>Math.exp(x), up:(x:number)=>Math.exp(x),  tex:String.raw`u=e^x,\quad du=e^x\,dx`,      utex:String.raw`e^x`,   uptex:String.raw`e^x` },
  ln1: { label:'u=ln(x+1)',  u:(x:number)=>Math.log(x+1), up:(x:number)=>1/(x+1),    tex:String.raw`u=\ln(x+1),\quad du=\frac{1}{x+1}\,dx\ (x>-1)`, utex:String.raw`\ln(x+1)`, uptex:String.raw`\frac{1}{x+1}` },
} as const;

const V = {
  x  : { label:'v=x',        v:(x:number)=>x,         vp:(_x:number)=>1,           tex:String.raw`v=x,\quad dv=dx`,           vtex:String.raw`x`,     vptex:String.raw`1` },
  x2 : { label:'v=x^2',      v:(x:number)=>x*x,       vp:(x:number)=>2*x,          tex:String.raw`v=x^2,\quad dv=2x\,dx`,      vtex:String.raw`x^2`,   vptex:String.raw`2x` },
  sin: { label:'v=sin x',    v:(x:number)=>Math.sin(x), vp:(x:number)=>Math.cos(x), tex:String.raw`v=\sin x,\quad dv=\cos x\,dx`, vtex:String.raw`\sin x`, vptex:String.raw`\cos x` },
  cos: { label:'v=cos x',    v:(x:number)=>Math.cos(x), vp:(x:number)=>-Math.sin(x),tex:String.raw`v=\cos x,\quad dv=-\sin x\,dx`, vtex:String.raw`\cos x`, vptex:String.raw`-\sin x` },
  exp: { label:'v=e^x',      v:(x:number)=>Math.exp(x), vp:(x:number)=>Math.exp(x), tex:String.raw`v=e^x,\quad dv=e^x\,dx`,      vtex:String.raw`e^x`,   vptex:String.raw`e^x` },
  ln1: { label:'v=ln(x+1)',  v:(x:number)=>Math.log(x+1), vp:(x:number)=>1/(x+1),   tex:String.raw`v=\ln(x+1),\quad dv=\frac{1}{x+1}\,dx\ (x>-1)`, vtex:String.raw`\ln(x+1)`, vptex:String.raw`\frac{1}{x+1}` },
} as const;

/* ===========================
   Numeric integration (Simpson) — 符号つき対応
=========================== */
function integrateSimpson(f:(x:number)=>number, a:number, b:number, N=600):number{
  if (a===b) return 0;
  const n = (N%2===0?N:N+1);
  const h=(b-a)/n;
  let s=f(a)+f(b);
  for(let i=1;i<n;i++){
    const x=a+i*h;
    s += (i%2===0? 2:4)*f(x);
  }
  return s*h/3;
}
// a→b の**順序**を尊重（a>b なら符号反転）
function integrateSimpsonSigned(f:(x:number)=>number, a:number, b:number, N=600):number{
  if (a===b) return 0;
  if (a<b) return integrateSimpson(f,a,b,N);
  return -integrateSimpson(f,b,a,N);
}

/* ===========================
   Component
=========================== */
export default function IntegrationTechniqueStepper(){
  const [s,setS] = useState<State>({
    mode:'substitution',
    a:0, b:Math.sqrt(Math.PI),   // 例: ∫_0^{√π} sin(x^2) dx
    anim:true, t:1,
    fkey:'sin', gkey:'x2',       // → 1/2 ∫_0^π sin(u) du
    ukey:'x', vkey:'sin'         // 例: ∫ x sin x dx
  });
  const set=(p:Partial<State>)=>setS(prev=>({...prev,...p}));

  // pi / sqrt 入力
  const [aExpr,setAExpr] = useState('0');
  const [bExpr,setBExpr] = useState('sqrt(pi)');
  useEffect(()=>{
    const A=parseExpr(aExpr); if (A!==null) setS(prev=>({...prev,a:A}));
    const B=parseExpr(bExpr); if (B!==null) setS(prev=>({...prev,b:B}));
  },[aExpr,bExpr]);

  // アニメ
  const raf=useRef<number|null>(null);
  useEffect((): void | (() => void) => {
    if(!s.anim){
      if(raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    const start=performance.now(), dur=3800;
    const step=(now:number)=>{
      const tt=Math.min(1,(now-start)/dur);
      setS(prev=>({...prev,t:tt}));
      if(tt<1) raf.current=requestAnimationFrame(step);
    };
    raf.current=requestAnimationFrame(step);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); };
  },[s.anim,s.mode,s.a,s.b,s.fkey,s.gkey,s.ukey,s.vkey]);

  const a=Math.min(s.a,s.b), b=Math.max(s.a,s.b);
  const T = s.anim ? s.t : 1;  // ⬅ アニメOFF時は常に全表示

  /* ===== formulas ===== */
  const Formulas = ()=>{
    if (s.mode==='substitution'){
      const FF = F[s.fkey], GG = G[s.gkey];
      const ua = GG.g(a), ub = GG.g(b);
      const left  = integrateSimpson((x)=>FF.f(GG.g(x))*GG.gp(x), a, b);
      const right = integrateSimpsonSigned((u)=>FF.f(u), ua, ub);   // ⬅ 向きを尊重
      const diff = left - right;

      const f_u  = FF.tex.replace(/^f\(u\)=/, '');
      const gtex = GG.gtex, gptex= GG.gptex;

      const fOfGtex =
        s.fkey==='exp'  ? String.raw`e^{${gtex}}` :
        s.fkey==='sin'  ? String.raw`\sin\!\Bigl(${gtex}\Bigr)` :
        s.fkey==='cos'  ? String.raw`\cos\!\Bigl(${gtex}\Bigr)` :
        s.fkey==='poly' ? String.raw`\Bigl(${gtex}\Bigr)^{2}` :
        s.fkey==='inv'  ? String.raw`\frac{1}{1+\Bigl(${gtex}\Bigr)^{2}}` :
        s.fkey==='sqrt' ? String.raw`\sqrt{${gtex}}` : String.raw``;

      const integrand = String.raw`${gptex}\,\;${fOfGtex}`;

      const specificBefore = String.raw`\int_{${a.toFixed(3)}}^{${b.toFixed(3)}} ${integrand}\,dx`;
      const specificAfter  = String.raw`u=${GG.gtex}\ \Rightarrow\ \int_{${ua.toFixed(3)}}^{${ub.toFixed(3)}} ${f_u}\,du`;

      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-500">置換積分（不定積分の一般形）</div>
          <KaTeXBlock tex={String.raw`\int f(g(x))\,g'(x)\,dx \;=\; \int f(u)\,du`} />

          <div className="text-sm text-gray-500">具体例（現在のパラメータ）</div>
          <KaTeXBlock tex={specificBefore} />
          <KaTeXBlock tex={specificAfter} />
          <KaTeXBlock tex={FF.tex} />
          <KaTeXBlock tex={GG.tex} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\text{左辺（}x\text{領域）}`} /></div>
              <div className="font-mono">{left.toFixed(6)}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\text{右辺（}u\text{領域）}`} /></div>
              <div className="font-mono">{right.toFixed(6)}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\text{差（左} - \text{右）}`} /></div>
              <div className="font-mono">{diff.toExponential(3)}</div>
            </div>
          </div>
        </div>
      );
    } else {
      const UU = U[s.ukey], VV = V[s.vkey];
      const xt = a + (b-a)*T;

      const left  = integrateSimpson((x)=>UU.u(x)*VV.vp(x), a, xt);
      const uvA   = UU.u(a)*VV.v(a);
      const uvX   = UU.u(xt)*VV.v(xt);
      const vdu   = integrateSimpson((x)=>VV.v(x)*UU.up(x), a, xt);
      const right = (uvX-uvA) - vdu;
      const diff  = left - right;

      const general = String.raw`\int u\,dv \;=\; uv \;-\; \int v\,du`;
      const specificL = String.raw`\int_{${a.toFixed(3)}}^{${xt.toFixed(3)}} \Bigl(${UU.utex}\Bigr)\,\Bigl(${VV.vptex}\Bigr)\,dx`;
      const specificR = String.raw`\Bigl[\,\Bigl(${UU.utex}\Bigr)\!\Bigl(${VV.vtex}\Bigr)\,\Bigr]_{${a.toFixed(3)}}^{${xt.toFixed(3)}}\ -\ \int_{${a.toFixed(3)}}^{${xt.toFixed(3)}} \Bigl(${VV.vtex}\Bigr)\,\Bigl(${UU.uptex}\Bigr)\,dx`;

      return (
        <div className="space-y-3">
          <div className="text-sm text-gray-500">部分積分（不定積分の一般形）</div>
          <KaTeXBlock tex={general}/>
          <div className="text-sm text-gray-500">具体例（現在のパラメータ）</div>
          <KaTeXBlock tex={specificL}/>
          <KaTeXBlock tex={specificR}/>
          <KaTeXBlock tex={UU.tex}/>
          <KaTeXBlock tex={VV.tex}/>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\int u\,dv`} /></div>
              <div className="font-mono">{left.toFixed(6)}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\Bigl[u\,v\Bigr]_{a}^{x_t}`} /></div>
              <div className="font-mono">{(uvX-uvA).toFixed(6)}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\int v\,du`} /></div>
              <div className="font-mono">{vdu.toFixed(6)}</div>
            </div>
            <div className="border rounded p-2">
              <div className="text-gray-500"><KaTeXBlock tex={String.raw`\text{右辺（}=uv-\int v\,du\text{）}`} /></div>
              <div className="font-mono">{right.toFixed(6)}</div>
            </div>
          </div>

          <div className="border rounded p-2 text-sm">
            <div className="text-gray-500"><KaTeXBlock tex={String.raw`\text{差（左} - \text{右）}`} /></div>
            <div className="font-mono">{diff.toExponential(3)}</div>
          </div>
        </div>
      );
    }
  };

  /* ===== draw ===== */
  const draw=(brd:any,_s:State,ctx:{create:Function,add:Function}):DrawResult=>{
    // grid
    ctx.create('grid', [], { strokeColor:'#e5e7eb', strokeWidth:1, dash:0, strokeOpacity:1, highlight:false });
    const xs:number[]=[s.a,s.b], ys:number[]=[-3,3];
    const A=Math.min(s.a,s.b), B=Math.max(s.a,s.b), T=s.anim ? s.t : 1;

    // helper: polygon without visible vertices
    const addPoly = (pts:[number,number][], fill:string, alpha:number)=>{
      const poly = ctx.create('polygon', pts, {
        withVertices:false, highlight:false,
        borders:{ strokeColor:'transparent' },
        fillColor:fill, fillOpacity:alpha, fixed:true
      });
      try {
        const vs = poly?.vertices || [];
        for (const v of vs) {
          v.setAttribute({ visible:false, size:0, strokeOpacity:0, fillOpacity:0, highlight:false, fixed:true });
        }
      } catch {}
      return poly;
    };

    // 上パネル y=0
    ctx.create('line', [[A,0],[B,0]], { strokeColor:'#9ca3af', strokeWidth:1, dash:2, fixed:true, highlight:false });

    if (s.mode==='substitution'){
      const FF=F[s.fkey], GG=G[s.gkey];
      const uaAll=GG.g(A), ubAll=GG.g(B);
      const ySep=-1.6;

      // 上： y = f(g(x)) g'(x)
      const N=320, X:number[]=[], Y:number[]=[];
      for(let i=0;i<=N;i++){
        const x=A+(B-A)*(i/N)*T;
        const y=FF.f(GG.g(x))*GG.gp(x);
        X.push(x); Y.push(y); xs.push(x); ys.push(y);
      }
      if (X.length>1){
        ctx.create('curve',[X,Y],{strokeColor:'#0ea5e9', strokeWidth:1.8, highlight:false, fixed:true});
        addPoly([...X.map((x,i)=>[x,Y[i]] as [number,number]), [X[X.length-1],0],[X[0],0]], '#38bdf8', 0.22);
        ctx.create('text',[A,0.25,'x領域：∫ f(g(x)) g\'(x) dx'], {anchorX:'left',anchorY:'bottom', fixed:true, strokeColor:'#0ea5e9', fontSize:12});
      }
      // 端点のみ
      ctx.create('point',[A,0],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});
      ctx.create('point',[B,0],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});

      // 下： u領域（順序そのままの基準線）
      const ua = uaAll, ub = ubAll;
      const Nu=300, UX:number[]=[], UY:number[]=[];
      for(let i=0;i<=Nu;i++){
        const u=ua + (ub-ua)*(i/Nu)*T;
        const y=FF.f(u);
        UX.push(u); UY.push(ySep+y); xs.push(u); ys.push(ySep+y);
      }
      if (UX.length>1){
        ctx.create('curve',[UX,UY],{strokeColor:'#f97316', strokeWidth:1.8, highlight:false, fixed:true});
        addPoly([...UX.map((x,i)=>[x,UY[i]] as [number,number]), [UX[UX.length-1],ySep],[UX[0],ySep]], '#fb923c', 0.25);
        // uパネルの基準線（ua→ub の順）
        ctx.create('line', [[ua,ySep],[ub,ySep]], { strokeColor:'#9ca3af', strokeWidth:1, dash:2, fixed:true, highlight:false });
        ctx.create('text',[Math.min(ua,ub),ySep+0.25,'u領域：∫ f(u) du'], {anchorX:'left',anchorY:'bottom', fixed:true, strokeColor:'#f97316', fontSize:12});
      }
      // 端点のみ
      ctx.create('point',[ua,ySep],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});
      ctx.create('point',[ub,ySep],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});

      ys.push(ySep-0.2);

    } else {
      const UU=U[s.ukey], VV=V[s.vkey];
      const ySep=-1.6;

      // 左辺： y = u v'
      const N=320, X:number[]=[], Y:number[]=[];
      for(let i=0;i<=N;i++){
        const x=A+(B-A)*(i/N)*T;
        const y=UU.u(x)*VV.vp(x);
        X.push(x); Y.push(y); xs.push(x); ys.push(y);
      }
      if (X.length>1){
        ctx.create('curve',[X,Y],{strokeColor:'#0ea5e9', strokeWidth:1.8, highlight:false, fixed:true});
        addPoly([...X.map((x,i)=>[x,Y[i]] as [number,number]), [X[X.length-1],0],[X[0],0]], '#38bdf8', 0.22);
        ctx.create('text',[A,0.25,'左辺：∫ u\,dv'], {anchorX:'left',anchorY:'bottom', fixed:true, strokeColor:'#0ea5e9', fontSize:12});
      }
      // 端点のみ
      ctx.create('point',[A,0],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});
      ctx.create('point',[B,0],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});

      // 右辺： uv 帯（オレンジ）と ∫ v u'（赤）
      const uv=(x:number)=>UU.u(x)*VV.v(x);
      const uvX=uv(A+(B-A)*T), uvA=uv(A);
      const bandBase=ySep+0.55, bandTop=ySep+0.9;
      addPoly([[A,bandBase],[A+(B-A)*T,bandBase],[A+(B-A)*T,bandTop],[A,bandTop]], '#fed7aa', 0.95);
      ctx.create('line', [[A, bandBase], [B, bandBase]], { strokeColor: '#cbd5e1', strokeWidth: 1, dash: 2, fixed: true, highlight: false });
      ctx.create('text',[A,bandTop+0.05,`uv(x)-uv(a) ≈ ${(uvX-uvA).toFixed(3)}`],{anchorX:'left',anchorY:'bottom', fixed:true, strokeColor:'#f97316', fontSize:11});

      const Nr=300, XR:number[]=[], YR:number[]=[];
      for(let i=0;i<=Nr;i++){
        const x=A+(B-A)*(i/Nr)*T;
        const y=ySep + VV.v(x)*UU.up(x);
        XR.push(x); YR.push(y); xs.push(x); ys.push(y);
      }
      if (XR.length>1){
        ctx.create('curve',[XR,YR],{strokeColor:'#ef4444', strokeWidth:1.8, highlight:false, fixed:true});
        addPoly([...XR.map((x,i)=>[x,YR[i]] as [number,number]), [XR[XR.length-1],ySep],[XR[0],ySep]], '#ef4444', 0.20);
        ctx.create('line', [[A,ySep],[B,ySep]], { strokeColor:'#9ca3af', strokeWidth:1, dash:2, fixed:true, highlight:false });
        ctx.create('text',[A,ySep+0.25,'右辺：uv − ∫ v\,du'], {anchorX:'left',anchorY:'bottom', fixed:true, strokeColor:'#f97316', fontSize:12});
      }
      // 端点のみ
      ctx.create('point',[A,ySep],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});
      ctx.create('point',[B,ySep],{name:'',size:2,strokeColor:'#f97316',fillColor:'#f97316', fixed:true, highlight:false});

      ys.push(ySep-0.2);
    }

    const xxs:[number,number]=[Math.min(...xs), Math.max(...xs)];
    const yys:[number,number]=[Math.min(...ys), Math.max(...ys)];
    return { xs: xxs, ys: yys };
  };

  /* ===== UI ===== */
  return (
    <StepperBase<State>
      title="置換積分・部分積分（面積の等価で理解）"
      state={s}
      setState={set}
      renderControls={()=>(
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['substitution','parts'] as Mode[]).map(m=>(
              <button key={m} onClick={()=>set({mode:m, anim:true, t:0})}
                className={`px-3 py-1 rounded border ${s.mode===m?'bg-gray-900 text-white':'bg-white'}`}>
                {m==='substitution'?'置換積分':'部分積分'}
              </button>
            ))}
          </div>

          {/* 置換：関数選択 */}
          {s.mode==='substitution' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              <div className="text-sm">
                <div className="mb-1 text-gray-600">f(u)</div>
                {(Object.keys(F) as Array<keyof typeof F>).map(k=>(
                  <button key={k} onClick={()=>set({fkey:k, t:0, anim:true})}
                    className={`px-3 py-1 rounded border mr-2 mb-2 ${s.fkey===k?'bg-gray-900 text-white':'bg-white'}`}>
                    {F[k].label}
                  </button>
                ))}
              </div>
              <div className="text-sm md:col-span-2">
                <div className="mb-1 text-gray-600">置換 u=g(x)</div>
                {(Object.keys(G) as Array<keyof typeof G>).map(k=>(
                  <button key={k} onClick={()=>set({gkey:k, t:0, anim:true})}
                    className={`px-3 py-1 rounded border mr-2 mb-2 ${s.gkey===k?'bg-gray-900 text-white':'bg-white'}`}>
                    {G[k].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 部分積分：関数選択 */}
          {s.mode==='parts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              <div className="text-sm">
                <div className="mb-1 text-gray-600">u(x)</div>
                {(Object.keys(U) as Array<keyof typeof U>).map(k=>(
                  <button key={k} onClick={()=>set({ukey:k, t:0, anim:true})}
                    className={`px-3 py-1 rounded border mr-2 mb-2 ${s.ukey===k?'bg-gray-900 text-white':'bg-white'}`}>
                    {U[k].label}
                  </button>
                ))}
              </div>
              <div className="text-sm">
                <div className="mb-1 text-gray-600">v(x)</div>
                {(Object.keys(V) as Array<keyof typeof V>).map(k=>(
                  <button key={k} onClick={()=>set({vkey:k, t:0, anim:true})}
                    className={`px-3 py-1 rounded border mr-2 mb-2 ${s.vkey===k?'bg-gray-900 text-white':'bg-white'}`}>
                    {V[k].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 区間（pi / sqrt 入力対応） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <label className="text-sm">
              <span className="block mb-1 text-gray-600">a（pi, sqrt 可）</span>
              <input
                value={aExpr}
                onChange={e=>setAExpr(e.target.value)}
                className="w-full rounded border px-2 py-1"
                placeholder="0, pi/4, sqrt(2) など"
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-gray-600">b（pi, sqrt 可）</span>
              <input
                value={bExpr}
                onChange={e=>setBExpr(e.target.value)}
                className="w-full rounded border px-2 py-1"
                placeholder="sqrt(pi) など"
              />
            </label>
          </div>

          {/* 定義域の注意（ln(x+1) を使う場合） */}
          {(s.mode==='parts' && (s.ukey==='ln1' || s.vkey==='ln1') && (a<=-1 || b<=-1)) && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              注意：\(\ln(x+1)\) を含むため、区間は \(x &gt; -1\) にしてください。
            </div>
          )}

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={s.anim} onChange={e=>set({anim:e.target.checked, t:0})}/>
            <span>アニメーション（0 → 1）</span>
          </label>
        </div>
      )}
      renderFormulas={()=> <Formulas/> }
      draw={draw}
    />
  );
}
