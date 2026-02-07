'use client';

import React, { useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';

type FKey = 'x2' | 'abs' | 'sin' | 'sqrt';
const FUNCS: Record<FKey, { label: string; f:(x:number)=>number; domainOk:(x:number)=>boolean; tex:string; }> = {
  x2:  { label:'x²',  f:(x)=>x*x,         domainOk:()=>true,  tex:String.raw`f(x)=x^2` },
  abs: { label:'|x|', f:(x)=>Math.abs(x), domainOk:()=>true,  tex:String.raw`f(x)=|x|` },
  sin: { label:'sin', f:(x)=>Math.sin(x), domainOk:()=>true,  tex:String.raw`f(x)=\sin x` },
  sqrt:{ label:'√x',  f:(x)=>Math.sqrt(x),domainOk:(x)=>x>=0, tex:String.raw`f(x)=\sqrt{x}` },
};

type FTState = { f:FKey; a:number; b:number; h:number; k:number; showMapping:boolean; };

const EPS = 1e-12;
const isZero = (x:number)=>Math.abs(x) < EPS;
const fmtNum = (x:number) => {
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return String(r);
  return x.toFixed(6).replace(/\.?0+$/,'');
};
const coeffForProduct = (c:number) => {
  if (isZero(c-1)) return '';       // 1· → 省略
  if (isZero(c+1)) return '-';      // -1· → マイナス記号だけ
  return fmtNum(c);
};
const plusK = (k:number) => isZero(k) ? '' : (k>0 ? ` + ${fmtNum(k)}` : ` - ${fmtNum(-k)}`);
const xMinus = (h:number) => isZero(h) ? 'x' : (h>0 ? String.raw`x-${fmtNum(h)}` : String.raw`x+${fmtNum(-h)}`);

export default function FunctionTransformStepper() {
  const [state, setState] = useState<FTState>({ f:'x2', a:1, b:1, h:0, k:0, showMapping:true });
  const set = (patch: Partial<FTState>) => setState(prev => ({ ...prev, ...patch }));

  return (
    <StepperBase<FTState>
      title="関数の変換（平行移動・拡大縮小・反転）"
      state={state}
      setState={set}

      /* ===== 左パネル ===== */
      renderControls={(s) => (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">関数の種類</div>
          <div className="flex flex-wrap gap-2">
            {(['x2','abs','sin','sqrt'] as FKey[]).map((k)=>(
              <button key={k} type="button"
                onClick={()=>set({ f:k })}
                className={`px-3 py-1 rounded border ${s.f===k ? 'bg-gray-900 text-white' : 'bg-white'}`}>
                {FUNCS[k].label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">a</span>
              <NumInput value={s.a} onChange={(v)=>set({ a:v })} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">b</span>
              <NumInput value={s.b} onChange={(v)=>set({ b:v })} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">h</span>
              <NumInput value={s.h} onChange={(v)=>set({ h:v })} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">k</span>
              <NumInput value={s.k} onChange={(v)=>set({ k:v })} /></label>
            <label className="text-sm flex items-center gap-2 col-span-full">
              <input type="checkbox" checked={s.showMapping} onChange={(e)=>set({ showMapping:e.target.checked })}/>
              <span>対応点を表示</span>
            </label>
          </div>
        </div>
      )}

      /* ===== 右パネル（数式） ===== */
      renderFormulas={(s)=>{
        const g = FUNCS[s.f] ?? FUNCS.x2;
        const { a,b,h,k } = s;

        // 1) 具体代入（Conrete）
        const concrete = {
          x2:   String.raw`y = ${fmtNum(a)}\,\bigl(${fmtNum(b)}(${xMinus(h)})\bigr)^{2} ${plusK(k)}`,
          abs:  String.raw`y = ${fmtNum(a)}\,\bigl|\,${fmtNum(b)}(${xMinus(h)})\,\bigr| ${plusK(k)}`,
          sin:  String.raw`y = ${fmtNum(a)}\,\sin\!\bigl(${fmtNum(b)}(${xMinus(h)})\bigr) ${plusK(k)}`,
          sqrt: String.raw`y = ${fmtNum(a)}\,\sqrt{\,${fmtNum(b)}(${xMinus(h)})\,}\, ${plusK(k)}`,
        }[s.f];

        // 2) 最大限シンプル（Simplified）
        let simplified = '';
        if (s.f === 'x2') {
          // y = a*(b*(x-h))^2 + k = (a*b^2)*(x-h)^2 + k
          const C = a * b * b;
          if (isZero(C)) {
            simplified = String.raw`y = ${fmtNum(k)}`;
          } else {
            const coef = coeffForProduct(C);
            const inner = xMinus(h);
            if (isZero(h)) {
              // y = C x^2 + k → C==1/-1 は省略
              simplified =
                (coef === '' ? String.raw`y = x^{2}` :
                 coef === '-' ? String.raw`y = -x^{2}` :
                 String.raw`y = ${coef}\,x^{2}`) + plusK(k);
            } else {
              // y = C (x-h)^2 + k（ここは展開し過ぎず、ただし C=±1 は簡約）
              simplified =
                (coef === '' ? String.raw`y = \bigl(${inner}\bigr)^{2}` :
                 coef === '-' ? String.raw`y = -\bigl(${inner}\bigr)^{2}` :
                 String.raw`y = ${coef}\,\bigl(${inner}\bigr)^{2}`) + plusK(k);
            }
          }
        } else if (s.f === 'sin') {
          // y = a sin(b(x-h)) + k
          if (isZero(a) || isZero(b)) {
            simplified = String.raw`y = ${fmtNum(k)}`;
          } else {
            const coef = coeffForProduct(a);
            const inner =
              isZero(b-1) ? xMinus(h) :
              isZero(b+1) ? String.raw`-\bigl(${xMinus(h)}\bigr)` :
              String.raw`${fmtNum(b)}\bigl(${xMinus(h)}\bigr)`;
            const head =
              coef === '' ? String.raw`\sin\!\bigl(${inner}\bigr)` :
              coef === '-' ? String.raw`-\sin\!\bigl(${inner}\bigr)` :
              String.raw`${coef}\,\sin\!\bigl(${inner}\bigr)`;
            simplified = String.raw`y = ${head}${plusK(k)}`;
          }
        } else if (s.f === 'abs') {
          // y = a | b(x-h) | + k = (a*|b|) |x-h| + k
          if (isZero(a) || isZero(b)) {
            simplified = String.raw`y = ${fmtNum(k)}`;
          } else {
            const A = a * Math.abs(b);
            const coef = coeffForProduct(A);
            const inner = xMinus(h);
            const core = isZero(h) ? String.raw`|x|` : String.raw`|\!${inner}\!|`;
            const head =
              coef === '' ? core :
              coef === '-' ? String.raw`-${core}` :
              String.raw`${coef}\,${core}`;
            simplified = String.raw`y = ${head}${plusK(k)}`;
          }
        } else if (s.f === 'sqrt') {
          // y = a sqrt(b(x-h)) + k（b=0 なら k）
          if (isZero(a) || isZero(b)) {
            simplified = String.raw`y = ${fmtNum(k)}`;
          } else {
            const coef = coeffForProduct(a);
            // 内部はできるだけ簡約：b=±1 と h=0 を特別扱い
            let inside = '';
            if (isZero(b-1)) inside = isZero(h) ? 'x' : String.raw`\bigl(${xMinus(h)}\bigr)`;
            else if (isZero(b+1)) inside = isZero(h) ? String.raw`-x` : String.raw`-\bigl(${xMinus(h)}\bigr)`;
            else inside = String.raw`${fmtNum(b)}\bigl(${xMinus(h)}\bigr)`;
            const head =
              coef === '' ? String.raw`\sqrt{\,${inside}\,}` :
              coef === '-' ? String.raw`-\sqrt{\,${inside}\,}` :
              String.raw`${coef}\,\sqrt{\,${inside}\,}`;
            simplified = String.raw`y = ${head}${plusK(k)}`;
          }
        }

        // sqrt の定義域補足（簡易）
        const domainNote = s.f==='sqrt'
          ? String.raw`\text{（定義域） } ${fmtNum(b)}\bigl(${xMinus(h)}\bigr)\ge 0`
          : null;

        const general = String.raw`y = a\,f\!\bigl(b(x-h)\bigr) + k`;

        return (
          <div className="space-y-3">
            <div className="text-sm text-gray-500">原関数</div>
            <KaTeXBlock tex={g.tex}/>
            <div className="text-sm text-gray-500 mt-2">一般形</div>
            <KaTeXBlock tex={general}/>
            <div className="text-sm text-gray-500 mt-2">代入形</div>
            <KaTeXBlock tex={concrete}/>
            <div className="text-sm text-gray-500 mt-2">簡略形（最大限）</div>
            <KaTeXBlock tex={simplified}/>
            {domainNote && (
              <div className="text-xs text-gray-500 mt-2">
                <KaTeXBlock tex={domainNote}/>
              </div>
            )}
          </div>
        );
      }}

      /* ===== 描画 ===== */
      draw={(brd, s, ctx)=>{
        const g = FUNCS[s.f];
        const { a,b,h,k } = s;

        // サンプル範囲（横スケール b や h にほどほど追随）
        const span = 6 / (Math.abs(b) || 1);
        const xMin = -span + h;
        const xMax =  span + h;

        const xs0:number[]=[]; const ys0:number[]=[];
        const xs1:number[]=[]; const ys1:number[]=[];
        const N=400;
        for (let i=0;i<=N;i++){
          const x = xMin + (xMax-xMin)*(i/N);
          if (g.domainOk(x)) { const y0=g.f(x); if (Number.isFinite(y0)) { xs0.push(x); ys0.push(y0); } }
          const u = b*(x-h);
          if (g.domainOk(u)) { const y1=a*g.f(u)+k; if (Number.isFinite(y1)) { xs1.push(x); ys1.push(y1); } }
        }
        if (xs0.length) ctx.create('curve',[xs0,ys0],{ strokeColor:'#334155', strokeWidth:1.5 });
        if (xs1.length) ctx.create('curve',[xs1,ys1],{ strokeColor:'#0ea5e9', strokeWidth:2 });

        if (s.showMapping){
          const marks=7;
          for (let i=0;i<marks;i++){
            const x = xMin + (xMax-xMin)*(i/(marks-1));
            const ok0=g.domainOk(x), u=b*(x-h), ok1=g.domainOk(u);
            if (ok0 && ok1){
              const y0=g.f(x), y1=a*g.f(u)+k;
              if (Number.isFinite(y0) && Number.isFinite(y1)){
                ctx.create('point',[x,y0],{ name:'', size:2, fixed:true, fillOpacity:0.9, strokeColor:'#334155', fillColor:'#334155' });
                ctx.create('point',[x,y1],{ name:'', size:2, fixed:true, fillOpacity:0.9, strokeColor:'#0ea5e9', fillColor:'#0ea5e9' });
                ctx.create('segment',[[x,y0],[x,y1]],{ strokeColor:'#94a3b8', strokeWidth:1 });
              }
            }
          }
        }
        return { xs:[...xs0,...xs1], ys:[...ys0,...ys1] } as DrawResult;
      }}

      /* ===== URL 同期 ===== */
      toQuery={(s)=>({ f:s.f, a:String(s.a), b:String(s.b), h:String(s.h), k:String(s.k), map:s.showMapping?'1':'0' })}
      fromQuery={(qs)=>{
        const pick = <T extends string>(v: string|null, arr: readonly T[]) =>
          (v && (arr as readonly string[]).includes(v)) ? (v as T) : undefined;
        const num = (k:string)=>{ const v=qs.get(k); if(v==null) return undefined; const n=Number(v); return Number.isFinite(n)?n:undefined; };
        return {
          f: pick(qs.get('f'), ['x2','abs','sin','sqrt'] as const),
          a: num('a'), b: num('b'), h: num('h'), k: num('k'),
          showMapping: qs.get('map') ? (qs.get('map')==='1'||qs.get('map')==='true') : undefined,
        };
      }}
      narrationText={(s)=>`関数の変換。ベースは ${({x2:'エックス二乗',abs:'ぜったいち',sin:'サイン',sqrt:'ルート エックス'})[s.f]}。a=${s.a}、b=${s.b}、h=${s.h}、k=${s.k}。`}
    />
  );
}
