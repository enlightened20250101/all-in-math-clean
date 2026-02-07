// src/components/animations/RiemannIntegralFullStepper.tsx
'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';
import { grid, curve, line, dashed, fitFromPoints } from '@/components/graphs/jxgUtils';
import { useRafAnim } from '@/components/animations/_shared/useRafAnim';

type FKey = 'x2'|'sin'|'cos'|'exp'|'abs';
type Rule = 'left'|'right'|'mid'|'trap'|'simp';
type State = {
  f:FKey; a:number; b:number; n:number;
  rule:Rule; showCurve:boolean; showMean:boolean;
  anim:boolean; speed:number; t:number;
};

const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));

const FSET: Record<FKey,{label:string; f:(x:number)=>number; tex:string; int:(a:number,b:number)=>number}> = {
  x2 : { label:'x²',  f:(x)=>x*x,      tex:String.raw`f(x)=x^2`,     int:(a,b)=>(b**3 - a**3)/3 },
  sin: { label:'sin', f:Math.sin,      tex:String.raw`f(x)=\sin x`,  int:(a,b)=>Math.cos(a)-Math.cos(b) },
  cos: { label:'cos', f:Math.cos,      tex:String.raw`f(x)=\cos x`,  int:(a,b)=>Math.sin(b)-Math.sin(a) },
  exp: { label:'eˣ',  f:Math.exp,      tex:String.raw`f(x)=\mathrm{e}^x`, int:(a,b)=>Math.exp(b)-Math.exp(a) },
  abs: { label:'|x|', f:Math.abs,      tex:String.raw`f(x)=|x|`,     int:(a,b)=>0.5*(Math.abs(b)*b - Math.abs(a)*a) },
};

// 頂点ポイントを完全に非表示にする共通オプション
const POLY_VERTS_OFF = {
  visible:false, size:0, strokeOpacity:0, fillOpacity:0, fixed:true, highlight:false,
} as const;

export default function RiemannIntegralFullStepper(){
  const [s,setS] = useState<State>({
    f:'x2',
    a:-1, b:2, n:8,
    rule:'mid',
    showCurve:true,
    showMean:false,
    anim:false, speed:1.0, t:0
  });
  const set = (p:Partial<State>)=>setS(v=>({ ...v, ...p }));

  useRafAnim(s, setS, 0.25);

  const a = Math.min(s.a, s.b);
  const b = Math.max(s.a, s.b);
  const nRaw = useMemo(()=>clamp(Math.round(s.n), 1, 400), [s.n]);
  const nSimp = nRaw - (nRaw % 2);                              // 偶数化
  const n = s.rule==='simp' ? Math.max(2, nSimp) : nRaw;
  const dx = (b - a) / n;

  const g = FSET[s.f];

  const approx = useMemo(()=>{
    if (n===0 || a===b) return 0;
    if (s.rule==='left' || s.rule==='right' || s.rule==='mid'){
      let sum = 0;
      for(let i=0;i<n;i++){
        const x0 = a + i*dx, x1 = x0 + dx;
        const x  = s.rule==='left' ? x0 : s.rule==='right' ? x1 : (x0+x1)/2;
        sum += g.f(x) * dx;
      }
      return sum;
    }
    if (s.rule==='trap'){
      let sum = 0.5*(g.f(a)+g.f(b));
      for(let i=1;i<n;i++) sum += g.f(a + i*dx);
      return sum*dx;
    }
    // Simpson
    let sum = g.f(a)+g.f(b);
    for(let i=1;i<n;i++) sum += (i%2===0 ? 2 : 4) * g.f(a + i*dx);
    return sum*dx/3;
  }, [a,b,n,dx,s.rule,g]);

  const exact = useMemo(()=>g.int(a,b), [a,b,g]);

  const cVal = useMemo(()=>{
    if (b===a) return NaN;
    const target = exact / (b-a);
    let best = a, err = Infinity;
    for(let i=0;i<=400;i++){
      const x = a + (b-a)*i/400;
      const d = Math.abs(g.f(x)-target);
      if (d<err){ err=d; best=x; }
    }
    return best;
  }, [a,b,exact,g]);

  /** 放物線（Simpson）用2次補間 */
  const quadY = (x:number, x0:number,xm:number,x1:number, y0:number,ym:number,y1:number)=>{
    const L0 = ((x-xm)*(x-x1))/((x0-xm)*(x0-x1));
    const Lm = ((x-x0)*(x-x1))/((xm-x0)*(xm-x1));
    const L1 = ((x-x0)*(x-xm))/((x1-x0)*(x1-xm));
    return y0*L0 + ym*Lm + y1*L1;
  };

  /** ===== 描画 ===== */
  const draw = (_brd:any, st:State, ctx:any): DrawResult => {
    grid(ctx);
    const xs:number[] = [], ys:number[] = [];

    // どこまで描画するか（アニメOFFなら常に全区間）
    let count = n;
    if (st.anim){
      if (st.rule==='simp'){
        const pairs = Math.ceil((n/2) * st.t); // ← ceil で最後まで描く
        count = Math.min(n, pairs*2);          // 偶数本に丸め
      } else {
        count = Math.min(n, Math.ceil(n * st.t)); // ← ceil で最後まで描く
      }
    }

    // 共通ポリゴン描画（頂点を非表示）
    const drawRect = (x0:number, x1:number, y:number)=>{
      const fill = y>=0 ? '#38bdf8' : '#ef4444';
      ctx.create('polygon',
        [[x0,0],[x0,y],[x1,y],[x1,0]],
        {
          borders:{ strokeColor:'#94a3b8', strokeWidth:1, highlight:false, layer:3 },
          fillColor:fill, fillOpacity:0.18, highlight:false, fixed:true, layer:2,
          // 頂点ポイントを消す
          vertices: POLY_VERTS_OFF
        }
      );
      xs.push(x0,x1); ys.push(0,y);
    };

    const drawTrap = (x0:number, x1:number, y0:number, y1:number)=>{
      const fill = (y0+y1)>=0 ? '#38bdf8' : '#ef4444';
      ctx.create('polygon',
        [[x0,0],[x0,y0],[x1,y1],[x1,0]],
        {
          borders:{ strokeColor:'#94a3b8', strokeWidth:1, highlight:false, layer:3 },
          fillColor:fill, fillOpacity:0.18, highlight:false, fixed:true, layer:2,
          vertices: POLY_VERTS_OFF
        }
      );
      xs.push(x0,x1); ys.push(0,y0,y1);
    };

    if (st.rule==='left' || st.rule==='right' || st.rule==='mid'){
      for(let i=0;i<count;i++){
        const x0 = a + i*dx, x1 = x0 + dx;
        const x  = st.rule==='left' ? x0 : st.rule==='right' ? x1 : (x0+x1)/2;
        drawRect(x0, x1, g.f(x));
      }
    } else if (st.rule==='trap'){
      for(let i=0;i<count;i++){
        const x0 = a + i*dx, x1 = x0 + dx;
        drawTrap(x0, x1, g.f(x0), g.f(x1));
      }
    } else {
      // Simpson: 2区間ずつ放物線で塗る（頂点ポイント非表示）
      const pairs = Math.floor(count/2);
      for(let k=0;k<pairs;k++){
        const x0 = a + (2*k)*dx;
        const xm = x0 + dx;
        const x1 = x0 + 2*dx;
        const y0 = g.f(x0), ym = g.f(xm), y1 = g.f(x1);
        const steps = 48;
        const up: [number,number][] = [];
        for(let i=0;i<=steps;i++){
          const x = x0 + (2*dx)*i/steps;
          up.push([x, quadY(x, x0,xm,x1, y0,ym,y1)]);
        }
        const fill = (y0 + 4*ym + y1) >= 0 ? '#38bdf8' : '#ef4444';
        ctx.create('polygon', [[x0,0], ...up, [x1,0]], {
          borders:{ strokeColor:'#94a3b8', strokeWidth:1, highlight:false, layer:3 },
          fillColor:fill, fillOpacity:0.18, highlight:false, fixed:true, layer:2,
          vertices: POLY_VERTS_OFF // ← 放物線ポリゴンの頂点も非表示
        });
        xs.push(x0,x1); ys.push(0);
        for (const [,yy] of up) ys.push(yy);
      }
    }

    // 関数曲線（塗りなし）
    if (st.showCurve){
      const X:number[] = [], Y:number[] = [];
      const steps = 500;
      for(let i=0;i<=steps;i++){
        const x = a + (b-a) * (i/steps);
        const y = g.f(x);
        if (Number.isFinite(y)){ X.push(x); Y.push(y); }
      }
      curve(ctx, X, Y, '#0ea5e9');
      xs.push(...X); ys.push(...Y);
    }

    // 平均値の定理
    if (st.showMean && !Number.isNaN(cVal)){
      const fc = g.f(cVal);
      line(ctx, [cVal,0], [cVal,fc], '#f97316');
      dashed(ctx, [a,fc], [b,fc], '#f97316');
      xs.push(cVal); ys.push(fc);
    }

    return fitFromPoints(xs, ys);
  };

  return (
    <StepperBase<State>
      title="リーマン積分（左/右/中点/台形/シンプソン）"
      state={s}
      setState={set}
      renderControls={(st,set)=>(
        <div className="space-y-3">
          {/* 近似の種類 */}
          <div className="text-sm text-gray-600">近似の種類</div>
          <div className="flex flex-wrap gap-2">
            {(['left','right','mid','trap','simp'] as Rule[]).map(r=>(
              <button key={r} onClick={()=>set({rule:r})}
                className={`px-3 py-1 rounded border ${st.rule===r?'bg-gray-900 text-white':'bg-white'}`}>
                {r==='left'?'左':r==='right'?'右':r==='mid'?'中点':r==='trap'?'台形':'シンプソン'}
              </button>
            ))}
          </div>

          {/* 関数の種類 */}
          <div className="text-sm text-gray-600">関数の種類</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FSET) as FKey[]).map(k=>(
              <button key={k} onClick={()=>set({f:k})}
                className={`px-3 py-1 rounded border ${st.f===k?'bg-gray-900 text-white':'bg-white'}`}>
                {FSET[k].label}
              </button>
            ))}
          </div>

          {/* パラメータ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">区間 a</span>
              <NumInput value={st.a} onChange={v=>set({a:v})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">区間 b</span>
              <NumInput value={st.b} onChange={v=>set({b:v})}/></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">分割数 n（1–400）</span>
              <NumInput value={st.n} onChange={v=>set({n:clamp(Math.round(v),1,400)})}/></label>
            {st.rule==='simp' && (nRaw%2!==0) && (
              <div className="text-xs text-amber-600 self-end">
                * シンプソンは偶数 n が必要です（自動で {n} に調整）
              </div>
            )}
          </div>

          {/* 表示オプション & アニメ */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showCurve} onChange={e=>set({showCurve:e.target.checked})}/>
              <span>関数曲線も表示</span>
            </label>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showMean} onChange={e=>set({showMean:e.target.checked})}/>
              <span>平均値の定理を表示</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.anim}
                onChange={e=>set({anim:e.target.checked, t: e.target.checked ? 0 : st.t})}/>
              <span>アニメ</span>
            </label>
            <label className="text-sm flex items-center gap-2">
              <span>速度</span>
              <input type="range" min={0.3} max={3} step={0.1} value={st.speed}
                     onChange={e=>set({speed:parseFloat(e.target.value)})}/>
              <span>{st.speed.toFixed(1)}×</span>
            </label>
          </div>
        </div>
      )}
      renderFormulas={()=>{
        const err = Math.abs(approx - exact);
        const ruleJa = s.rule==='left'?'左':s.rule==='right'?'右':s.rule==='mid'?'中点':s.rule==='trap'?'台形':'シンプソン';
        return (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">関数</div>
              <KaTeXBlock tex={g.tex}/>
            </div>
            <div>
              <div className="text-sm text-gray-500">定義</div>
              <KaTeXBlock tex={String.raw`\Delta x=\frac{b-a}{n},\quad x_i=a+i\,\Delta x`} />
              <KaTeXBlock tex={String.raw`\sum_{i=0}^{n-1} f(x_i)\,\Delta x\ \to\ \int_a^b f(x)\,dx`} />
            </div>
            <div>
              <div className="text-sm text-gray-500">積分値（{ruleJa} 近似）</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="border rounded p-2">
                  <div className="text-gray-500">厳密積分</div>
                  <div className="font-mono">{exact.toFixed(6)}</div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-gray-500">近似値</div>
                  <div className="font-mono">{approx.toFixed(6)}</div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-gray-500">誤差</div>
                  <div className="font-mono">{err.toExponential(2)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
      draw={draw}
    />
  );
}
