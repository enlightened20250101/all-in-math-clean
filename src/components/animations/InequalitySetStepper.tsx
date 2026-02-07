'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';

/** 設定 */
type Kind = 'linear'|'quadratic';
type Rel = '<'|'<='|'>'|'>=';

type IState = {
  kind: Kind;
  // linear: ax + b (rel) 0
  // quadratic: ax^2 + bx + c (rel) 0
  a: number;
  b: number;
  c: number;         // quadraticのみ使用
  rel: Rel;
  showSign: boolean;
};

type Interval = { l: number, r: number, lc: boolean, rc: boolean }; // lc/rc: closed?
const EPS = 1e-12;
const isZero = (x:number)=>Math.abs(x)<EPS;
const fmt = (x:number)=> {
  const r = Math.round(x);
  return Math.abs(x - r) < 1e-9 ? String(r) : x.toFixed(6).replace(/\.?0+$/,'');
};
const sgn = (x:number)=> x>EPS ? 1 : (x<-EPS ? -1 : 0);

/** 線形の解（ax+b rel 0） */
function solveLinear(a:number, b:number, rel:Rel): Interval[] {
  if (isZero(a)) {
    // 定数不等式: b rel 0
    const ok =
      (rel === '<'  && b <  0) ||
      (rel === '<=' && b <= 0) ||
      (rel === '>'  && b >  0) ||
      (rel === '>=' && b >= 0);
    return ok ? [{ l: -Infinity, r: Infinity, lc: false, rc: false }] : [];
  }
  const x0 = -b / a;
  const closed = (rel === '<=' || rel === '>=');
  const side = (rel === '<' || rel === '<=') ? -1 : 1; // < は小さい側, > は大きい側
  const incTo = a > 0 ? side : -side; // 符号で向き反転
  if (incTo < 0) {
    return [{ l: -Infinity, r: x0, lc: false, rc: closed }];
  } else {
    return [{ l: x0, r: Infinity, lc: closed, rc: false }];
  }
}

/** 二次の解（ax^2+bx+c rel 0）。a=0は線形へ委譲 */
function solveQuadratic(a:number, b:number, c:number, rel:Rel): Interval[] {
  if (isZero(a)) return solveLinear(b, c, rel);

  const D = b*b - 4*a*c;
  const up = a > 0;
  const closed = (rel === '<=' || rel === '>=');

  if (D < -EPS) {
    // 実根なし。符号は a と同じ
    const all = (rel === '>' || rel === '>=') ? up : !up;
    if (all) return [{ l: -Infinity, r: Infinity, lc: false, rc: false }];
    return [];
  }
  if (Math.abs(D) <= EPS) {
    const r = -b / (2*a);
    if (rel === '<' || rel === '>') {
      // 0 より小/大 は接点では成り立たない
      return up === (rel === '>') ? [{ l: -Infinity, r: r, lc: false, rc: false }, { l: r, r: Infinity, lc: false, rc: false }] : [];
    } else {
      // ≤ / ≥
      if (up) {
        // ≥0 : すべて、 ≤0 : x=r のみ
        return rel === '>='
          ? [{ l: -Infinity, r: Infinity, lc: false, rc: false }]
          : [{ l: r, r: r, lc: true, rc: true }];
      } else {
        // ≤0 : すべて、 ≥0 : x=r のみ（a<0で反転）
        return rel === '<='
          ? [{ l: -Infinity, r: Infinity, lc: false, rc: false }]
          : [{ l: r, r: r, lc: true, rc: true }];
      }
    }
  }
  // D>0
  const sD = Math.sqrt(D);
  let r1 = (-b - sD) / (2*a);
  let r2 = (-b + sD) / (2*a);
  if (r1 > r2) [r1, r2] = [r2, r1];

  if (rel === '<' || rel === '<=') {
    // 凸（a>0）なら内側、凹なら外側
    if (up) return [{ l: r1, r: r2, lc: closed, rc: closed }];
    // a<0: 外側
    return [
      { l: -Infinity, r: r1, lc: false, rc: false },
      { l: r2, r: Infinity, lc: false, rc: false },
    ];
  } else {
    // '>' or '>='
    if (up) {
      return [
        { l: -Infinity, r: r1, lc: false, rc: false },
        { l: r2, r: Infinity, lc: false, rc: false },
      ];
    }
    return [{ l: r1, r: r2, lc: closed, rc: closed }];
  }
}

/** 区間を KaTeX の区間表記へ（∞, -∞ を含む） */
function intervalToTex(iv: Interval): string {
  const L = iv.l === -Infinity ? String.raw`-\infty` : fmt(iv.l);
  const R = iv.r ===  Infinity ? String.raw`\infty`  : fmt(iv.r);
  const lb = iv.lc ? '[' : '(';
  const rb = iv.rc ? ']' : ')';
  if (iv.l === iv.r && iv.l !== -Infinity && iv.r !== Infinity)
    return String.raw`\{\,${fmt(iv.l)}\,\}`;
  return String.raw`${lb}${L},\,${R}${rb}`;
}

export default function InequalitySetStepper() {
  const [s, setS] = useState<IState>({
    kind:'quadratic', a:1, b:-3, c:2, rel:'<=', showSign:true
  });
  const set = (patch: Partial<IState>) => setS(prev => ({ ...prev, ...patch }));

  // 数式テキスト
  const exprTex = useMemo(()=>{
    if (s.kind === 'linear') {
      // ax + b (rel) 0
      const ax = isZero(s.a) ? '' : (isZero(s.a-1)?'x':isZero(s.a+1)?'-x':`${fmt(s.a)}x`);
      const plusb = isZero(s.b) ? '' : (s.b>0?` + ${fmt(s.b)}`:` - ${fmt(-s.b)}`);
      return String.raw`${ax}${plusb}\ ${s.rel}\ 0`;
    } else {
      // ax^2 + bx + c (rel) 0
      const ax2 = isZero(s.a) ? '' : (isZero(s.a-1)?String.raw`x^2`:isZero(s.a+1)?String.raw`-x^2`:`${fmt(s.a)}x^{2}`);
      const bx  = isZero(s.b) ? '' : (s.b>0?` + ${fmt(s.b)}x`:` - ${fmt(-s.b)}x`);
      const c   = isZero(s.c) ? '' : (s.c>0?` + ${fmt(s.c)}`:` - ${fmt(-s.c)}`);
      return String.raw`${ax2}${bx}${c}\ ${s.rel}\ 0`;
    }
  }, [s]);

  // 因数分解テキスト（できる時だけ）
  const factorTex = useMemo(()=>{
    if (s.kind==='quadratic' && !isZero(s.a)) {
      const D = s.b*s.b - 4*s.a*s.c;
      if (D >= -EPS) {
        const r1 = (-s.b - Math.sqrt(Math.max(0,D))) / (2*s.a);
        const r2 = (-s.b + Math.sqrt(Math.max(0,D))) / (2*s.a);
        if (isFinite(r1) && isFinite(r2)) {
          const k = isZero(Math.abs(s.a)-1) ? '' : fmt(s.a);
          const t1 = String.raw`\bigl(x-${fmt(r1)}\bigr)`;
          const t2 = String.raw`\bigl(x-${fmt(r2)}\bigr)`;
          return String.raw`${k}\,${t1}\,${t2}`;
        }
      }
    }
    return null;
  }, [s]);

  // 解の区間
  const intervals = useMemo<Interval[]>(()=>{
    return s.kind === 'linear'
      ? solveLinear(s.a, s.b, s.rel)
      : solveQuadratic(s.a, s.b, s.c, s.rel);
  }, [s]);

  // 解集合のTeX
  const solTex = useMemo(()=>{
    if (intervals.length === 0) return String.raw`\varnothing`;
    if (intervals.length === 1) return intervalToTex(intervals[0]);
    return String.raw`${intervals.map(intervalToTex).join('\ \cup\ ')}`;
  }, [intervals]);

  /* ===== 描画 ===== */
  const draw = (brd:any, st:IState, ctx:{create:Function, add:Function}): DrawResult => {
    // 可視範囲決め：根や境界に合わせて自動
    const points:number[] = [];
    if (st.kind==='linear' && !isZero(st.a)) points.push(-st.b/st.a);
    if (st.kind==='quadratic' && !isZero(st.a)) {
      const D = st.b*st.b - 4*st.a*st.c;
      if (D >= -EPS) {
        const r1 = (-st.b - Math.sqrt(Math.max(0,D))) / (2*st.a);
        const r2 = (-st.b + Math.sqrt(Math.max(0,D))) / (2*st.a);
        if (isFinite(r1)) points.push(r1);
        if (isFinite(r2)) points.push(r2);
      }
    }
    const center = points.length ? (points.reduce((a,b)=>a+b,0)/points.length) : 0;
    const span = Math.max(5, points.length ? (Math.max(...points)-Math.min(...points))*1.8 : 10);
    const L = center - span, R = center + span;

    // 解区間の塗り（y∈[-0.4,0.4]帯）
    const xsFit:number[] = [];
    const ysFit:number[] = [];
    const clamp = (x:number)=> Math.max(L, Math.min(R, x));
    for (const iv of intervals) {
      const l = isFinite(iv.l) ? iv.l : (iv.l===-Infinity ? L : -Infinity);
      const r = isFinite(iv.r) ? iv.r : (iv.r=== Infinity ? R : Infinity);
      const lC = clamp(l), rC = clamp(r);
      // 影（塗り）
      const poly = ctx.create('polygon', [[lC,-0.4],[lC,0.4],[rC,0.4],[rC,-0.4]], {
        borders:{ strokeColor:'#94a3b8', strokeWidth:1 },
        fillColor:'#38bdf8', fillOpacity:0.2
      });
      ctx.add(poly);
      // 端点の○●
      const drawEnd = (x:number, closed:boolean) => {
        const p = ctx.create('point', [x,0], {
          name:'', size:3, fixed:true,
          fillOpacity: closed ? 1 : 0, strokeWidth:2,
          strokeColor:'#0ea5e9', fillColor:'#0ea5e9'
        });
        ctx.add(p);
      };
      if (isFinite(iv.l)) drawEnd(iv.l, iv.lc);
      if (isFinite(iv.r)) drawEnd(iv.r, iv.rc);

      xsFit.push(lC, rC);
      ysFit.push(-0.4, 0.4);
    }

    // 中央の x 軸を強調
    const axisSeg = ctx.create('segment', [[L,0],[R,0]], { strokeColor:'#334155', strokeWidth:1.5 });
    ctx.add(axisSeg);

    // フィット用
    return { xs: [L,R, ...xsFit], ys: [-0.6, 0.6, ...ysFit] };
  };

  /* ===== サイン表（簡易） ===== */
  const signTable = useMemo(()=>{
    if (!s.showSign) return null;
    if (s.kind === 'linear') {
      if (isZero(s.a)) return null;
      const x0 = -s.b/s.a;
      const left = sgn(s.a) * -1;   // x<x0
      const right = sgn(s.a) * 1;   // x>x0
      return (
        <div className="text-sm">
          <div className="text-gray-500 mb-2">符号表（一次）</div>
          <div className="grid grid-cols-3 border rounded overflow-hidden">
            <div className="bg-gray-50 px-2 py-1">区間</div>
            <div className="bg-gray-50 px-2 py-1 col-span-2">符号</div>
            <div className="px-2 py-1">x &lt; {fmt(x0)}</div>
            <div className="px-2 py-1 col-span-2">{left>0?'+':'-'}</div>
            <div className="px-2 py-1">x = {fmt(x0)}</div>
            <div className="px-2 py-1 col-span-2">0</div>
            <div className="px-2 py-1">x &gt; {fmt(x0)}</div>
            <div className="px-2 py-1 col-span-2">{right>0?'+':'-'}</div>
          </div>
        </div>
      );
    } else {
      if (isZero(s.a)) return null;
      const D = s.b*s.b - 4*s.a*s.c;
      if (D < -EPS) return null;
      const r1 = (-s.b - Math.sqrt(Math.max(0,D))) / (2*s.a);
      const r2 = (-s.b + Math.sqrt(Math.max(0,D))) / (2*s.a);
      const [p,q] = r1<=r2 ? [r1,r2] : [r2,r1];
      const up = s.a>0;
      // 区間 (-∞,p),(p,q),(q,∞) の符号（a>0: +,-,+ / a<0: -, +, -）
      const row = up ? ['+','-','+'] : ['-','+','-'];
      return (
        <div className="text-sm">
          <div className="text-gray-500 mb-2">符号表（二次）</div>
          <div className="grid grid-cols-4 border rounded overflow-hidden">
            <div className="bg-gray-50 px-2 py-1">区間</div>
            <div className="bg-gray-50 px-2 py-1 col-span-3">符号</div>
            <div className="px-2 py-1">(-∞, {fmt(p)})</div>
            <div className="px-2 py-1 col-span-3">{row[0]}</div>
            <div className="px-2 py-1">({fmt(p)}, {fmt(q)})</div>
            <div className="px-2 py-1 col-span-3">{row[1]}</div>
            <div className="px-2 py-1">({fmt(q)}, ∞)</div>
            <div className="px-2 py-1 col-span-3">{row[2]}</div>
          </div>
        </div>
      );
    }
  }, [s]);

  return (
    <StepperBase<IState>
      title="不等式の解集合（数直線）"
      state={s}
      setState={set}
      renderControls={(st)=>(
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={()=>set({ kind:'linear' })}
              className={`px-3 py-1 rounded border ${st.kind==='linear'?'bg-gray-900 text-white':'bg-white'}`}
            >一次（ax+b）</button>
            <button
              type="button"
              onClick={()=>set({ kind:'quadratic' })}
              className={`px-3 py-1 rounded border ${st.kind==='quadratic'?'bg-gray-900 text-white':'bg-white'}`}
            >二次（ax²+bx+c）</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <label className="text-sm"><span className="block mb-1 text-gray-600">a</span>
              <NumInput value={st.a} onChange={(v)=>set({ a:v })} /></label>
            <label className="text-sm"><span className="block mb-1 text-gray-600">b</span>
              <NumInput value={st.b} onChange={(v)=>set({ b:v })} /></label>
            {st.kind==='quadratic' && (
              <label className="text-sm"><span className="block mb-1 text-gray-600">c</span>
                <NumInput value={st.c} onChange={(v)=>set({ c:v })} /></label>
            )}
            <div className="text-sm">
              <div className="mb-1 text-gray-600">不等号</div>
              <div className="flex flex-wrap gap-2">
                {(['<','<=','>','>='] as Rel[]).map(r=>(
                  <button key={r} type="button" onClick={()=>set({ rel: r })}
                    className={`px-3 py-1 rounded border ${st.rel===r?'bg-gray-900 text-white':'bg-white'}`}>
                    {r==='<'?'<':r==='<='?'≤':r==='>'?'>':'≥'}
                  </button>
                ))}
              </div>
            </div>
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={st.showSign} onChange={e=>set({ showSign:e.target.checked })}/>
              <span>符号表も表示</span>
            </label>
          </div>
        </div>
      )}
      renderFormulas={(st)=>{
        return (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">不等式</div>
              <KaTeXBlock tex={exprTex}/>
            </div>
            {factorTex && (
              <div>
                <div className="text-sm text-gray-500">因数分解</div>
                <KaTeXBlock tex={factorTex}/>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">解集合</div>
              <KaTeXBlock tex={solTex}/>
            </div>
          </div>
        );
      }}
      renderTable={() => signTable}
      draw={draw}
      toQuery={(st)=>({
        kind: st.kind, a:String(st.a), b:String(st.b), c:String(st.c),
        rel: st.rel, sign: st.showSign?'1':'0'
      })}
      fromQuery={(qs)=>{
        const num=(k:string)=>{ const v=qs.get(k); if(v==null) return undefined; const n=Number(v); return Number.isFinite(n)?n:undefined; };
        const k=qs.get('kind'); const kind = (k==='linear'||k==='quadratic')? k as Kind : undefined;
        const r=qs.get('rel');  const rel = (r==='<'||r==='<='||r==='>'||r==='>=')? r as Rel : undefined;
        return {
          kind, a:num('a'), b:num('b'), c:num('c'), rel,
          showSign: qs.get('sign') ? (qs.get('sign')==='1'||qs.get('sign')==='true') : undefined
        } as Partial<IState>;
      }}
    />
  );
}
