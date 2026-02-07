// src/components/animations/InequalityRegionStepper.tsx
'use client';

import React, { useMemo, useState } from 'react';
import StepperBase, { DrawResult } from '@/components/animations/StepperBase';
import KaTeXBlock from '@/components/math/KaTeXBlock';
import NumInput from '@/components/ui/NumInput';

type Dim = '1d' | '2d';
type Rel = '<' | '<=' | '>' | '>=';
type OneDKind = 'linear' | 'quadratic';
type TwoDKind = 'linear' | 'circle' | 'ellipse' | 'parabola' | 'hyperbola';
type ParaDir = 'up' | 'down' | 'left' | 'right';
type HypDir = 'horizontal' | 'vertical';

type State = {
  dim: Dim;
  rel: Rel;

  // 1D
  kind1d: OneDKind;
  a: number; b: number; c: number;

  // 2D
  kind2d: TwoDKind;

  // linear
  A: number; B: number; C: number;

  // circle
  ch: number; ck: number; cr: number;

  // ellipse
  eh: number; ek: number; ea: number; eb: number;

  // parabola
  ph: number; pk: number; pp: number; pdir: ParaDir;

  // hyperbola
  hh: number; hk: number; ha: number; hb: number; hdir: HypDir;

  showSign: boolean;
};

type Interval = { l: number, r: number, lc: boolean, rc: boolean };

const EPS = 1e-12;
const isZero = (x:number)=>Math.abs(x)<EPS;

/* ---------- 共通: 生成された polygon の頂点を完全非表示 ---------- */
function hidePolyVerts(poly:any){
  try {
    if (poly?.vertices) {
      for (const v of poly.vertices) {
        v.setAttribute({ visible:false, size:0, strokeOpacity:0, fillOpacity:0, highlight:false, fixed:true });
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.debug('hidePolyVerts failed:', e);
  }
}

/* ---------- TeX helpers（分数優先・±1省略） ---------- */
const gcd = (a:number,b:number)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a||1;};
const toFrac = (x:number, maxDen=48) => {
  const s = Math.sign(x) || 1;
  const ax = Math.abs(x);
  const ir = Math.round(ax);
  if (Math.abs(ax - ir) < 1e-10) return { n: s*ir, d: 1 };
  let bestN=ir, bestD=1, bestErr=Math.abs(ax - ir);
  for (let d=2; d<=maxDen; d++) {
    const n = Math.round(ax*d);
    const err = Math.abs(ax - n/d);
    if (err < bestErr - 1e-12) { bestErr = err; bestN = n; bestD = d; }
  }
  const g = gcd(bestN,bestD);
  return { n: s*(bestN/g), d: bestD/g };
};
const texNum = (x:number) => {
  if (isZero(x)) return '0';
  const { n, d } = toFrac(x);
  if (d === 1) return String(n);
  const sgn = n<0 ? '-' : '';
  const a = Math.abs(n);
  return String.raw`${sgn}\frac{${a}}{${d}}`;
};
const texJoin = (parts:string[]) => {
  const s = parts.filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  return s.replace(/^\+\s*/,'') || '0';
};
const texTermSigned = (coef:number, sym:string) => {
  if (isZero(coef)) return '';
  const pos = coef>0;
  const abs = Math.abs(coef);
  let mag = '';
  if (!(Math.abs(abs-1)<EPS && sym)) mag = texNum(abs);
  return sym
    ? (pos ? `+ ${mag?mag:''}${sym}` : `- ${mag?mag:''}${sym}`)
    : (pos ? `+ ${mag}` : `- ${mag}`);
};
const texOffset = (v:'x'|'y', h:number) =>
  isZero(h) ? v : (h>0 ? String.raw`${v}-${texNum(h)}` : String.raw`${v}+${texNum(-h)}`);
const texSquare = (v:'x'|'y', h:number) =>
  isZero(h) ? String.raw`${v}^{2}` : String.raw`\bigl(${texOffset(v,h)}\bigr)^{2}`;
const texMul = (c: number, texInner: string) => {
  if (isZero(c)) return '0';
  if (Math.abs(c - 1) < EPS)  return texInner;
  if (Math.abs(c + 1) < EPS)  return String.raw`-${texInner}`;
  return String.raw`${texNum(c)}\,${texInner}`;
};
const texLinear1D = (b:number,c:number) => texJoin([texTermSigned(b,'x'), texTermSigned(c,'')]);
const texQuadratic1D = (a:number,b:number,c:number) =>
  texJoin([texTermSigned(a,'x^{2}'), texTermSigned(b,'x'), texTermSigned(c,'')]);
const texLinear2D = (A:number,B:number,C:number) =>
  texJoin([texTermSigned(A,'x'), texTermSigned(B,'y'), texTermSigned(C,'')]);

const intervalToTex = (iv: Interval): string => {
  const L = iv.l === -Infinity ? String.raw`-\infty` : texNum(iv.l);
  const R = iv.r ===  Infinity ? String.raw`\infty`  : texNum(iv.r);
  const lb = iv.lc ? '[' : '(';
  const rb = iv.rc ? ']' : ')';
  if (iv.l === iv.r && isFinite(iv.l)) return String.raw`\{\,${texNum(iv.l)}\,\}`;
  return String.raw`${lb}${L},\,${R}${rb}`;
};

const texSquareOver = (inner: string, denom2: number) =>
  Math.abs(denom2 - 1) < 1e-12 ? inner : String.raw`\frac{${inner}}{${texNum(denom2)}}`;

/* ---------- 1D solvers ---------- */
function solveLinear1D(a:number,b:number,rel:Rel): Interval[] {
  if (isZero(a)) {
    const ok = (rel === '<' && b<0) || (rel === '<=' && b<=0) || (rel === '>' && b>0) || (rel === '>=' && b>=0);
    return ok ? [{ l:-Infinity, r:Infinity, lc:false, rc:false }] : [];
  }
  const x0 = -b/a, closed = (rel==='<=')||(rel=== '>=');
  const wantLeft = (rel === '<' || rel === '<=');
  const chooseLeft = a>0 ? wantLeft : !wantLeft;
  return chooseLeft
    ? [{ l:-Infinity, r:x0, lc:false, rc:closed }]
    : [{ l:x0, r:Infinity, lc:closed, rc:false }];
}
function solveQuadratic1D(a:number,b:number,c:number,rel:Rel): Interval[] {
  if (isZero(a)) return solveLinear1D(b,c,rel);
  const D=b*b-4*a*c, up=a>0, closed=(rel==='<=')||(rel==='>=');
  if (D < -EPS) return ((rel==='>'||rel==='>=')===up) ? [{ l:-Infinity,r:Infinity,lc:false,rc:false }] : [];
  if (Math.abs(D)<=EPS){
    const r=-b/(2*a);
    if (rel==='<'||rel==='>') return up===(rel==='>') ? [{ l:-Infinity,r,lc:false,rc:false},{ l:r,r:Infinity,lc:false,rc:false}] : [];
    return up ? (rel==='>=' ? [{ l:-Infinity,r:Infinity,lc:false,rc:false}] : [{ l:r,r:r,lc:true,rc:true}])
              : (rel==='<=') ? [{ l:-Infinity,r:Infinity,lc:false,rc:false}] : [{ l:r,r:r,lc:true,rc:true}];
  }
  let r1=(-b-Math.sqrt(D))/(2*a), r2=(-b+Math.sqrt(D))/(2*a); if (r1>r2)[r1,r2]=[r2,r1];
  if (rel==='<'||rel==='<=') {
    return up
      ? [{ l:r1, r:r2, lc:closed, rc:closed }]
      : [
          { l:-Infinity, r:r1, lc:false,   rc:closed },
          { l:r2,        r:Infinity, lc:closed, rc:false }
        ];
  } else {
    return up
      ? [
          { l:-Infinity, r:r1, lc:false,   rc:closed },
          { l:r2,        r:Infinity, lc:closed, rc:false }
        ]
      : [{ l:r1, r:r2, lc:closed, rc:closed }];
  }
}

/* ---------- 2D: 図形補助 ---------- */

// 半平面（直線境界）: 画面矩形を半平面で1回クリッピング
function drawHalfPlane(
  ctx:any,
  A:number, B:number, C:number, rel:Rel,
  L:number, R:number, Btm:number, Top:number,
  color = '#38bdf8'
){
  // ★ ここで A=B=0 を早期処理（全平面 or 空集合）
  if (isZero(A) && isZero(B)) {
    const ok =
      (rel === '<'  && C <  0) ||
      (rel === '<=' && C <= 0) ||
      (rel === '>'  && C >  0) ||
      (rel === '>=' && C >= 0);
    if (ok) {
      const all = ctx.create('polygon', [[L,Btm],[R,Btm],[R,Top],[L,Top]], {
        withVertices:false, highlight:false, fixed:true,
        borders:{ strokeColor:'transparent' },
        fillColor: color, fillOpacity: 0.2
      });
      hidePolyVerts(all);
    }
    return; // ← 直線も交点計算も不要
  }

  const inside = (x:number,y:number) => {
    const v = A*x + B*y + C;
    return rel==='<'  ? v <  -EPS
         : rel==='<=' ? v <=  EPS
         : rel==='>'  ? v >   EPS
                      : v >= -EPS;
  };

  // 直線と線分の交点
  const inter = (x1:number,y1:number,x2:number,y2:number) => {
    const f1 = A*x1 + B*y1 + C, f2 = A*x2 + B*y2 + C;
    const t = f1 / (f1 - f2); // f1 + t(f2-f1) = 0
    return [x1 + t*(x2-x1), y1 + t*(y2-y1)] as [number,number];
  };

  // 境界線の描画
  if (!isZero(B)) {
    const m = -A/B, q = -C/B;
    ctx.create('segment', [[L, m*L+q], [R, m*R+q]], {
      strokeColor:'#f59e0b', strokeWidth:1.6, linecap:'butt', highlight:false, fixed:true,
      dash: (rel==='<'||rel==='>') ? 2 : 0
    });
  } else if (!isZero(A)) {
    const x0 = -C/A;
    ctx.create('segment', [[x0, Btm], [x0, Top]], {
      strokeColor:'#f59e0b', strokeWidth:1.6, linecap:'butt', highlight:false, fixed:true,
      dash: (rel==='<'||rel==='>') ? 2 : 0
    });
  }

  // 画面矩形を半平面で1回クリップ
  const rect: [number,number][] = [[L,Btm],[R,Btm],[R,Top],[L,Top]];
  const out: [number,number][] = [];
  for (let i=0;i<rect.length;i++){
    const a = rect[i], b = rect[(i+1)%rect.length];
    const ain = inside(a[0],a[1]), bin = inside(b[0],b[1]);
    if (ain && bin)           out.push(b);
    else if (ain && !bin)     out.push(inter(a[0],a[1],b[0],b[1]));
    else if (!ain && bin)    { out.push(inter(a[0],a[1],b[0],b[1])); out.push(b); }
  }
  if (out.length >= 3) {
    const hp = ctx.create('polygon', out, {
      withVertices:false, highlight:false, fixed:true,
      borders:{ strokeColor:'transparent' },
      fillColor: color, fillOpacity: 0.2
    });
    hidePolyVerts(hp);
  }
}


// 円/楕円の多角形
const circlePoly = (cx:number,cy:number,r:number,n=240) =>
  Array.from({length:n},(_,i)=>{const t=2*Math.PI*i/n; return [cx+r*Math.cos(t), cy+r*Math.sin(t)] as [number,number];});
const ellipsePoly = (cx:number,cy:number,a:number,b:number,n=280) =>
  Array.from({length:n},(_,i)=>{const t=2*Math.PI*i/n; return [cx+a*Math.cos(t), cy+b*Math.sin(t)] as [number,number];});

export default function InequalityRegionStepper(){
  const [st, setSt] = useState<State>({
    dim:'1d',
    rel:'<=',
    kind1d:'quadratic',
    a:1, b:-3, c:2,

    kind2d:'linear',
    A:1, B:-1, C:0,

    ch:0, ck:0, cr:2,
    eh:0, ek:0, ea:3, eb:2,
    ph:0, pk:0, pp:0.5, pdir:'up',
    hh:0, hk:0, ha:2, hb:1, hdir:'horizontal',

    showSign:true,
  });
  const set = (patch: Partial<State>) => setSt(prev=>({ ...prev, ...patch }));

  // 入力バリデーション（楕円/双曲線の a,b は正）
  const [errs, setErrs] = useState<{ ea?: boolean; eb?: boolean; ha?: boolean; hb?: boolean }>({});

  const setEllipseA = (v: number) => {
    if (!(v > 0)) return setErrs((e) => ({ ...e, ea: true }));
    setErrs((e) => ({ ...e, ea: false })); set({ ea: v });
  };
  const setEllipseB = (v: number) => {
    if (!(v > 0)) return setErrs((e) => ({ ...e, eb: true }));
    setErrs((e) => ({ ...e, eb: false })); set({ eb: v });
  };
  const setHyperA = (v: number) => {
    if (!(v > 0)) return setErrs((e) => ({ ...e, ha: true }));
    setErrs((e) => ({ ...e, ha: false })); set({ ha: v });
  };
  const setHyperB = (v: number) => {
    if (!(v > 0)) return setErrs((e) => ({ ...e, hb: true }));
    setErrs((e) => ({ ...e, hb: false })); set({ hb: v });
  };

  /* ---------- 数式パネル ---------- */
  const formulas = useMemo(() => {
    const relTex =
      st.rel === '<' ? '<' :
      st.rel === '<=' ? '\\le' :
      st.rel === '>' ? '>' : '\\ge';

    if (st.dim === '1d') {
      const sym1d = st.kind1d === 'linear'
        ? String.raw`bx + c\ ${relTex}\ 0`
        : String.raw`ax^{2} + bx + c\ ${relTex}\ 0`;

      const exprNum = st.kind1d === 'linear'
        ? `${texLinear1D(st.b, st.c)} ${relTex} 0`
        : `${texQuadratic1D(st.a, st.b, st.c)} ${relTex} 0`;

      const ivs = st.kind1d === 'linear'
        ? solveLinear1D(st.b, st.c, st.rel)
        : solveQuadratic1D(st.a, st.b, st.c, st.rel);

      const sol = ivs.length
        ? ivs.map(intervalToTex).join(String.raw` \ \cup\ `)
        : String.raw`\varnothing`;

      return (
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">一般形（記号）</div>
            <KaTeXBlock tex={sym1d} />
          </div>
          <div>
            <div className="text-sm text-gray-500">不等式（1D, 代入）</div>
            <KaTeXBlock tex={exprNum} />
          </div>
          <div>
            <div className="text-sm text-gray-500">解集合</div>
            <KaTeXBlock tex={sol} />
          </div>
        </div>
      );
    }

    // 2D: 一般形 + 代入形
    let sym2d = '';
    let exprNum = '';

    if (st.kind2d === 'linear') {
      sym2d   = String.raw`Ax + By + C\ ${relTex}\ 0`;
      exprNum = String.raw`${texLinear2D(st.A, st.B, st.C)}\ ${relTex}\ 0`;
    } else if (st.kind2d === 'circle') {
      sym2d   = String.raw`\bigl(x-h\bigr)^{2} + \bigl(y-k\bigr)^{2}\ ${relTex}\ r^{2}`;
      exprNum = String.raw`${texSquare('x', st.ch)} + ${texSquare('y', st.ck)}\ ${relTex}\ ${texNum(st.cr*st.cr)}`;
    } else if (st.kind2d === 'ellipse') {
      const aOK = st.ea>0, bOK = st.eb>0;
      if (!aOK || !bOK) {
        return <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">a, b は正の実数である必要があります。</div>;
      }
      sym2d   = String.raw`\frac{(x-h)^{2}}{a^{2}} + \frac{(y-k)^{2}}{b^{2}}\ ${relTex}\ 1`;
      const a2 = st.ea*st.ea, b2 = st.eb*st.eb;
      const termX = Math.abs(a2 - 1) < 1e-12
        ? texSquare('x', st.eh)
        : String.raw`\frac{${texSquare('x', st.eh)}}{${texNum(a2)}}`;
      const termY = Math.abs(b2 - 1) < 1e-12
        ? texSquare('y', st.ek)
        : String.raw`\frac{${texSquare('y', st.ek)}}{${texNum(b2)}}`;
      exprNum = String.raw`${termX} + ${termY}\ ${relTex}\ 1`;
    } else if (st.kind2d === 'hyperbola') {
      const aOK = st.ha>0, bOK = st.hb>0;
      if (!aOK || !bOK) {
        return <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">a, b は正の実数である必要があります。</div>;
      }
      const sym = st.hdir === 'horizontal'
        ? String.raw`\frac{(x-h)^{2}}{a^{2}} - \frac{(y-k)^{2}}{b^{2}}\ ${relTex}\ 1`
        : String.raw`\frac{(y-k)^{2}}{b^{2}} - \frac{(x-h)^{2}}{a^{2}}\ ${relTex}\ 1`;
      const a2 = st.ha*st.ha, b2 = st.hb*st.hb;
      const X2 = texSquare('x', st.hh);
      const Y2 = texSquare('y', st.hk);
      const termX = texSquareOver(X2, a2);
      const termY = texSquareOver(Y2, b2);
      const num = st.hdir === 'horizontal'
        ? String.raw`${termX} - ${termY}\ ${relTex}\ 1`
        : String.raw`${termY} - ${termX}\ ${relTex}\ 1`;
      return (
        <div className="space-y-4">
          <div><div className="text-sm text-gray-500">一般形（記号）</div><KaTeXBlock tex={sym}/></div>
          <div><div className="text-sm text-gray-500">不等式（2D, 代入）</div><KaTeXBlock tex={num}/></div>
        </div>
      );
    } else {
      // Parabola: 向きは p の符号と pdir で決定（代入形の符号バグ修正）
      const symPara = (st.pdir === 'up' || st.pdir === 'down')
        ? String.raw`y-k\ ${relTex}\ p\,\bigl(x-h\bigr)^{2}\quad\bigl(p>0\Rightarrow\text{上},\ p<0\Rightarrow\text{下}\bigr)`
        : String.raw`x-h\ ${relTex}\ p\,\bigl(y-k\bigr)^{2}\quad\bigl(p>0\Rightarrow\text{右},\ p<0\Rightarrow\text{左}\bigr)`;
      sym2d = symPara;
      const rhsV = (st.pdir === 'up' || st.pdir === 'down')
        ? texMul(st.pp, texSquare('x', st.ph))  // 右辺 p(x-h)^2
        : texMul(st.pp, texSquare('y', st.pk)); // 右辺 p(y-k)^2
      exprNum = (st.pdir === 'up' || st.pdir === 'down')
        ? String.raw`${texOffset('y', st.pk)}\ ${relTex}\ ${rhsV}`   // ← y - k
        : String.raw`${texOffset('x', st.ph)}\ ${relTex}\ ${rhsV}`;  // ← x - h
    }

    return (
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-500">一般形（記号）</div>
          <KaTeXBlock tex={sym2d} />
        </div>
        <div>
          <div className="text-sm text-gray-500">不等式（2D, 代入）</div>
          <KaTeXBlock tex={exprNum} />
        </div>
      </div>
    );
  }, [st]);

  /* ---------- 符号表（1D） ---------- */
  const signTable = useMemo(()=>{
    if (st.dim!=='1d' || !st.showSign) return null;
    const relCell = (tex:string) => (
      <div className="leading-6 flex items-center"><KaTeXBlock tex={tex} /></div>
    );
    if (st.kind1d==='linear'){
      if (isZero(st.b)) return null;
      const x0 = -st.c/st.b;
      const left = st.b<0 ? '+' : '-';
      const right = st.b>0 ? '+' : '-';
      return (
        <div className="text-sm">
          <div className="text-gray-500 mb-2">符号表（一次）</div>
          <div className="grid grid-cols-3 border rounded overflow-hidden">
            <div className="bg-gray-50 px-2 py-1">区間</div>
            <div className="bg-gray-50 px-2 py-1 col-span-2">符号</div>
            <div className="px-2 py-1">{relCell(String.raw`(-\infty,\, ${texNum(x0)})`)}</div>
            <div className="px-2 py-1 col-span-2">{relCell(left)}</div>
            <div className="px-2 py-1">{relCell(String.raw`\{\,${texNum(x0)}\,\}`)}</div>
            <div className="px-2 py-1 col-span-2">{relCell('0')}</div>
            <div className="px-2 py-1">{relCell(String.raw`(${texNum(x0)},\, \infty)`)}</div>
            <div className="px-2 py-1 col-span-2">{relCell(right)}</div>
          </div>
        </div>
      );
    } else {
      if (isZero(st.a)) return null;
      const D = st.b*st.b - 4*st.a*st.c;
      if (Math.abs(D) <= EPS) {
        const r = -st.b/(2*st.a);
        const sign = st.a > 0 ? '+' : '-';
        return (
          <div className="text-sm">
            <div className="text-gray-500 mb-2">符号表（二次）</div>
            <div className="grid grid-cols-4 border rounded overflow-hidden">
              <div className="bg-gray-50 px-2 py-1">区間</div>
              <div className="bg-gray-50 px-2 py-1 col-span-3">符号</div>
              <div className="px-2 py-1"><KaTeXBlock tex={String.raw`(-\infty,\, ${texNum(r)})`} /></div>
              <div className="px-2 py-1 col-span-3"><KaTeXBlock tex={sign} /></div>
              <div className="px-2 py-1"><KaTeXBlock tex={String.raw`\{\,${texNum(r)}\,\}`} /></div>
              <div className="px-2 py-1 col-span-3"><KaTeXBlock tex={'0'} /></div>
              <div className="px-2 py-1"><KaTeXBlock tex={String.raw`(${texNum(r)},\, \infty)`} /></div>
              <div className="px-2 py-1 col-span-3"><KaTeXBlock tex={sign} /></div>
            </div>
          </div>
        );
      }
    }
  }, [st]);

  /* ---------- 描画 ---------- */
  const draw = (brd:any, s:State, ctx:{create:Function}): DrawResult => {
    ctx.create('grid', [], { strokeColor:'#e5e7eb', strokeWidth:1, dash:0, strokeOpacity:1, highlight:false });

    const bb = brd?.getBoundingBox?.() ?? [-6,6,6,-6];
    const L=bb[0], Top=bb[1], R=bb[2], Btm=bb[3];

    if (s.dim==='1d'){
      const ivs = s.kind1d==='linear' ? solveLinear1D(s.b, s.c, s.rel) : solveQuadratic1D(s.a, s.b, s.c, s.rel);
      ctx.create('segment', [[L,0],[R,0]], { strokeColor:'#334155', strokeWidth:1, linecap:'butt', highlight:false, fixed:true });
      const bandH=0.35;
      const endMark = (x:number, closed:boolean)=>{
        ctx.create('segment', [[x,-bandH],[x,bandH]], { strokeColor: '#f59e0b', strokeWidth: 1.6, linecap:'butt', highlight:false, fixed:true, dash: closed ? 0 : 2 });
      };
      for(const iv of ivs){
        const l=isFinite(iv.l)?iv.l:L, r=isFinite(iv.r)?iv.r:R;
        if (r>l){
          const band = ctx.create('polygon', [[l,-bandH],[l,bandH],[r,bandH],[r,-bandH]], {
            withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true
          });
          hidePolyVerts(band);
        }
        if (isFinite(iv.l)) endMark(iv.l, iv.lc);
        if (isFinite(iv.r)) endMark(iv.r, iv.rc);
      }
      return { xs:[L,R], ys:[-1,1] };
    }

    // 2D
    if (s.kind2d==='linear'){
      drawHalfPlane(ctx, s.A,s.B,s.C, s.rel, L,R,Btm,Top);
      return { xs:[L,R], ys:[Btm,Top] };
    }

    if (s.kind2d==='circle'){
      const r = Math.max(1e-6, Math.abs(s.cr));
      const P = circlePoly(s.ch, s.ck, r);
      ctx.create('curve', [P.map(p=>p[0]), P.map(p=>p[1])], { strokeColor: '#f59e0b', strokeWidth: 1.6, dash:(s.rel==='<'||s.rel==='>')?2:0, highlight:false, fixed:true });
      if (s.rel==='<'||s.rel==='<='){
        const areaC = ctx.create('polygon', P, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
        hidePolyVerts(areaC);
      } else {
        const rectC = ctx.create('polygon', [[L,Btm],[R,Btm],[R,Top],[L,Top]], { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
        hidePolyVerts(rectC);
        const holeC = ctx.create('polygon', P, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#ffffff', fillOpacity:0.82, fixed:true });
        hidePolyVerts(holeC);
      }
      return { xs:[s.ch-r, s.ch+r], ys:[s.ck-r, s.ck+r] };
    }

    if (s.kind2d==='ellipse'){
      const a=Math.max(1e-6, Math.abs(s.ea)), b=Math.max(1e-6, Math.abs(s.eb));
      const P = ellipsePoly(s.eh, s.ek, a, b);
      ctx.create('curve', [P.map(p=>p[0]), P.map(p=>p[1])], { strokeColor: '#f59e0b', strokeWidth: 1.6, dash:(s.rel==='<'||s.rel==='>')?2:0, highlight:false, fixed:true });
      if (s.rel==='<'||s.rel==='<='){
        const areaE = ctx.create('polygon', P, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
        hidePolyVerts(areaE);
      } else {
        const rectE = ctx.create('polygon', [[L,Btm],[R,Btm],[R,Top],[L,Top]], { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
        hidePolyVerts(rectE);
        const holeE = ctx.create('polygon', P, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#ffffff', fillOpacity:0.82, fixed:true });
        hidePolyVerts(holeE);
      }
      return { xs:[s.eh-a, s.eh+a], ys:[s.ek-b, s.ek+b] };
    }

    if (s.kind2d === 'hyperbola') {
      const a = Math.max(1e-6, Math.abs(s.ha));
      const b = Math.max(1e-6, Math.abs(s.hb));
      const h = s.hh, k = s.hk;
      const isLess   = (s.rel === '<'  || s.rel === '<=');
      const isClosed = (s.rel === '<=' || s.rel === '>=');

      const allX:number[] = [], allY:number[] = [];

      const plotHorizontal = ()=>{
        // (x-h)^2/a^2 - (y-k)^2/b^2 = 1
        const xMin=L, xMax=R, x0R=Math.max(h+a,L), x0L=Math.min(h-a,R), N=300;
        const drawBranch = (from:number,to:number, sign=+1)=>{
          const X:number[]=[], Y:number[]=[];
          for(let i=0;i<=N;i++){
            const x = from + (to-from)*(i/N);
            const t = ((x-h)*(x-h))/(a*a) - 1;
            if (t>=0){ const y = k + sign*b*Math.sqrt(t); X.push(x); Y.push(y); allX.push(x); allY.push(y); }
          }
          if (X.length>1) ctx.create('curve',[X,Y],{ strokeColor:'#f59e0b', strokeWidth:1.6, dash: isClosed ? 0 : 2, highlight:false, fixed:true });
          return {X,Y};
        };
        const Rup=drawBranch(x0R,xMax,+1), Rdn=drawBranch(x0R,xMax,-1);
        const Lup=drawBranch(x0L,xMin,+1), Ldn=drawBranch(x0L,xMin,-1);
        if (!isLess) {
          const fillLobe=(from:number,to:number)=>{
            const up:[number,number][]=[], dn:[number,number][]=[];
            const STEPS=160;
            for(let i=0;i<=STEPS;i++){
              const x = from + (to-from)*(i/STEPS);
              const t=((x-h)*(x-h))/(a*a)-1;
              if (t>=0){ const y=b*Math.sqrt(t); up.push([x,k+y]); }
            }
            for(let i=STEPS;i>=0;i--){
              const x = from + (to-from)*(i/STEPS);
              const t=((x-h)*(x-h))/(a*a)-1;
              if (t>=0){ const y=b*Math.sqrt(t); dn.push([x,k-y]); }
            }
            if (up.length && dn.length){
              const poly=[...up,...dn];
              const p = ctx.create('polygon', poly, { withVertices:false, highlight:false, borders:{strokeColor:'transparent'}, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
              hidePolyVerts(p);
            }
          };
          fillLobe(Math.max(h+a,L), R);
          fillLobe(L, Math.min(h-a,R));
        }else{
          const rect = ctx.create('polygon', [[L,Btm],[R,Btm],[R,Top],[L,Top]], { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
          hidePolyVerts(rect);
          const carve=(from:number,to:number)=>{
            const band:[number,number][]=[];
            const STEPS=220;
            for(let i=0;i<=STEPS;i++){
              const x = from + (to-from)*(i/STEPS);
              const t=((x-h)*(x-h))/(a*a)-1;
              if (t>=0){ const y=b*Math.sqrt(t); band.push([x,k+y]); }
            }
            for(let i=STEPS;i>=0;i--){
              const x = from + (to-from)*(i/STEPS);
              const t=((x-h)*(x-h))/(a*a)-1;
              if (t>=0){ const y=b*Math.sqrt(t); band.push([x,k-y]); }
            }
            if (band.length){
              const hole = ctx.create('polygon', band, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#ffffff', fillOpacity:0.82, fixed:true });
              hidePolyVerts(hole);
            }
          };
          carve(Math.max(h+a,L), R);
          carve(L, Math.min(h-a,R));
        }
      };

      const plotVertical = ()=>{
        // (y-k)^2/b^2 - (x-h)^2/a^2 = 1
        const yMin=Btm, yMax=Top, y0U=Math.max(k+b,Btm), y0D=Math.min(k-b,Top), N=300;
        const drawBranchY = (from:number, to:number, side: 1 | -1)=>{
          const X:number[]=[], Y:number[]=[];
          for(let i=0;i<=N;i++){
            const y = from + (to-from)*(i/N);
            const t=((y-k)*(y-k))/(b*b)-1;
            if (t>=0){ const x = h + side*a*Math.sqrt(t); X.push(x); Y.push(y); allX.push(x); allY.push(y); }
          }
          if (X.length>1) ctx.create('curve',[X,Y],{ strokeColor:'#f59e0b', strokeWidth:1.6, dash: isClosed ? 0 : 2, highlight:false, fixed:true });
        };
        drawBranchY(y0U,yMax,+1); drawBranchY(y0U,yMax,-1);
        drawBranchY(y0D,yMin,+1); drawBranchY(y0D,yMin,-1);

        if (!isLess) {
          const fill=(from:number,to:number)=>{
            const right:[number,number][]=[], left:[number,number][]=[];
            const STEPS=160;
            for(let i=0;i<=STEPS;i++){
              const y = from + (to-from)*(i/STEPS);
              const t=((y-k)*(y-k))/(b*b)-1;
              if (t>=0){ const x=a*Math.sqrt(t); right.push([h+x,y]); }
            }
            for(let i=0;i<=STEPS;i++){
              const y = from + (to-from)*(i/STEPS);
              const t=((y-k)*(y-k))/(b*b)-1;
              if (t>=0){ const x=a*Math.sqrt(t); left.push([h-x,y]); }
            }
            if (right.length && left.length){
              const poly=[...right, ...left.reverse()];
              const p = ctx.create('polygon', poly, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
              hidePolyVerts(p);
            }
          };
          fill(Math.max(k+b,Btm), Top);
          fill(Btm, Math.min(k-b,Top));
        }else{
          const rect = ctx.create('polygon', [[L,Btm],[R,Btm],[R,Top],[L,Top]], { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
          hidePolyVerts(rect);
          const carve=(from:number,to:number)=>{
            const band:[number,number][]=[];
            const STEPS=220;
            for(let i=0;i<=STEPS;i++){
              const y = from + (to-from)*(i/STEPS);
              const t=((y-k)*(y-k))/(b*b)-1;
              if (t>=0){ const x=a*Math.sqrt(t); band.push([h+x,y]); }
            }
            for(let i=STEPS;i>=0;i--){
              const y = from + (to-from)*(i/STEPS);
              const t=((y-k)*(y-k))/(b*b)-1;
              if (t>=0){ const x=a*Math.sqrt(t); band.push([h-x,y]); }
            }
            if (band.length){
              const hole = ctx.create('polygon', band, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#ffffff', fillOpacity:0.82, fixed:true });
              hidePolyVerts(hole);
            }
          };
          carve(Math.max(k+b,Btm), Top);
          carve(Btm, Math.min(k-b,Top));
        }
      };

      if (s.hdir==='horizontal') plotHorizontal(); else plotVertical();

      const xs = allX.length ? [Math.min(...allX), Math.max(...allX)] : [h-a, h+a];
      const ys = allY.length ? [Math.min(...allY), Math.max(...allY)] : [k-b, k+b];
      return { xs, ys };
    }

    // Parabola
    const p = Math.max(1e-6, Math.abs(s.pp));
    const W = Math.max(200, (R-L) * 40);
    const N = Math.min(420, Math.max(180, Math.floor(W / 6)));

    if (s.pdir==='up' || s.pdir==='down'){
      const pSign = s.pp >= 0 ? +1 : -1;
      const X: number[] = [], Y: number[] = [];
      for(let i=0;i<=N;i++){
        const x = L + (R-L)*(i/N);
        const y = s.pk + pSign * p * (x - s.ph) * (x - s.ph);
        X.push(x); Y.push(y);
      }
      ctx.create('curve',[X,Y],{ strokeColor: '#f59e0b', strokeWidth: 1.6, dash:(s.rel==='<'||s.rel==='>')?2:0, highlight:false, fixed:true });

      const isLE = (s.rel==='<'||s.rel==='<=');
      const fillBelow = isLE ? (pSign > 0) : (pSign < 0);
      const poly: [number,number][] = [];
      if (fillBelow){
        for(let i=0;i<=N;i++) poly.push([X[i], Math.min(Y[i], Top+1e9)]);
        poly.push([R,Btm]); poly.push([L,Btm]);
      } else {
        poly.push([L,Top]); poly.push([R,Top]);
        for(let i=N;i>=0;i--) poly.push([X[i], Math.max(Y[i], Btm-1e9)]);
      }
      const area = ctx.create('polygon', poly, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
      hidePolyVerts(area);

      const xs = [Math.min(...X), Math.max(...X)];
      const ys = [Math.min(...Y), Math.max(...Y)];
      return { xs, ys };
    } else {
      const pSign = s.pp >= 0 ? +1 : -1;
      const X: number[] = [], Y: number[] = [];
      for(let i=0;i<=N;i++){
        const y = Btm + (Top-Btm)*(i/N);
        const x = s.ph + pSign * p * (y - s.pk) * (y - s.pk);
        X.push(x); Y.push(y);
      }
      ctx.create('curve',[X,Y],{ strokeColor: '#f59e0b', strokeWidth: 1.6, dash:(s.rel==='<'||s.rel==='>')?2:0, highlight:false, fixed:true });

      const isLE = (s.rel==='<'||s.rel==='<=');
      const fillLeft = isLE ? (pSign > 0) : (pSign < 0);
      const poly: [number,number][] = [];
      if (fillLeft){
        poly.push([L,Btm]); poly.push([L,Top]);
        for(let i=N;i>=0;i--) poly.push([Math.min(X[i], R+1e9), Y[i]]);
      } else {
        for(let i=0;i<=N;i++) poly.push([Math.max(X[i], L-1e9), Y[i]]);
        poly.push([R,Top]); poly.push([R,Btm]);
      }
      const area = ctx.create('polygon', poly, { withVertices:false, highlight:false, borders:{ strokeColor:'transparent' }, fillColor:'#38bdf8', fillOpacity:0.2, fixed:true });
      hidePolyVerts(area);

      const xs = [Math.min(...X), Math.max(...X)];
      const ys = [Math.min(...Y), Math.max(...Y)];
      return { xs, ys };
    }
  };

  return (
    <StepperBase<State>
      title="不等式の解（数直線／平面＋二次曲線）"
      state={st}
      setState={set}
      renderControls={(s,set)=>(
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={()=>set({ dim:'1d' })} className={`px-3 py-1 rounded border ${s.dim==='1d'?'bg-gray-900 text-white':'bg-white'}`}>1D（数直線）</button>
            <button type="button" onClick={()=>set({ dim:'2d' })} className={`px-3 py-1 rounded border ${s.dim==='2d'?'bg-gray-900 text-white':'bg-white'}`}>2D（平面）</button>
          </div>
          <div className="text-sm">
            <div className="mb-1 text-gray-600">不等号</div>
            <div className="flex flex-wrap gap-2">
              {(['<','<=','>','>='] as Rel[]).map(r=>(
                <button key={r} type="button" onClick={()=>set({ rel:r })}
                  className={`px-3 py-1 rounded border ${s.rel===r?'bg-gray-900 text-white':'bg-white'}`}>
                  {r==='<'?'<':r==='<='?'≤':r==='>'?'>':'≥'}
                </button>
              ))}
            </div>
          </div>

          {s.dim==='1d' ? (
            <>
              <div className="text-sm">
                <div className="mb-1 text-gray-600">種類</div>
                <div className="flex flex-wrap gap-2">
                  {(['linear','quadratic'] as OneDKind[]).map(k=>(
                    <button key={k} type="button" onClick={()=>set({ kind1d:k })}
                      className={`px-3 py-1 rounded border ${s.kind1d===k?'bg-gray-900 text-white':'bg-white'}`}>
                      {k==='linear'?'一次（bx+c）':'二次（ax²+bx+c）'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                {s.kind1d==='quadratic' && (
                  <label className="text-sm"><span className="block mb-1 text-gray-600">a</span><NumInput value={s.a} onChange={(v)=>set({ a:v })}/></label>
                )}
                <label className="text-sm"><span className="block mb-1 text-gray-600">b</span><NumInput value={s.b} onChange={(v)=>set({ b:v })}/></label>
                <label className="text-sm"><span className="block mb-1 text-gray-600">c</span><NumInput value={s.c} onChange={(v)=>set({ c:v })}/></label>
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" checked={s.showSign} onChange={e=>set({ showSign:e.target.checked })}/>
                  <span>符号表を表示</span>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm">
                <div className="mb-1 text-gray-600">図形</div>
                <div className="flex flex-wrap gap-2">
                  {(['linear','circle','ellipse','parabola','hyperbola'] as TwoDKind[]).map(k=>(
                    <button key={k} type="button" onClick={()=>set({ kind2d:k })}
                      className={`px-3 py-1 rounded border ${s.kind2d===k?'bg-gray-900 text-white':'bg-white'}`}>
                      {k==='linear'?'一次（Ax+By+C）':k==='circle'?'円':k==='ellipse'?'楕円':k==='hyperbola'?'双曲線':'放物線'}
                    </button>
                  ))}
                </div>
              </div>

              {s.kind2d==='linear' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                  <label className="text-sm"><span className="block mb-1 text-gray-600">A</span><NumInput value={s.A} onChange={(v)=>set({ A:v })}/></label>
                  <label className="text-sm"><span className="block mb-1 text-gray-600">B</span><NumInput value={s.B} onChange={(v)=>set({ B:v })}/></label>
                  <label className="text-sm"><span className="block mb-1 text-gray-600">C</span><NumInput value={s.C} onChange={(v)=>set({ C:v })}/></label>
                </div>
              )}

              {s.kind2d==='circle' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
                  <label className="text-sm"><span className="block mb-1 text-gray-600">中心 h</span><NumInput value={s.ch} onChange={(v)=>set({ ch:v })}/></label>
                  <label className="text-sm"><span className="block mb-1 text-gray-600">中心 k</span><NumInput value={s.ck} onChange={(v)=>set({ ck:v })}/></label>
                  <label className="text-sm"><span className="block mb-1 text-gray-600">半径 r</span><NumInput value={s.cr} onChange={(v)=>set({ cr:Math.max(0,v) })}/></label>
                </div>
              )}

              {s.kind2d==='ellipse' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
                    <label className="text-sm"><span className="block mb-1 text-gray-600">中心 h</span><NumInput value={s.eh} onChange={(v)=>set({ eh:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">中心 k</span><NumInput value={s.ek} onChange={(v)=>set({ ek:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">長半径 a</span><NumInput value={s.ea} onChange={setEllipseA}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">短半径 b</span><NumInput value={s.eb} onChange={setEllipseB}/></label>
                  </div>
                  {(errs.ea || errs.eb) && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
                      a, b は 0（または負）を指定できません。入力は反映されませんでした。
                    </div>
                  )}
                </>
              )}

              {s.kind2d==='hyperbola' && (
                <>
                  <div className="text-sm">
                    <div className="mb-1 text-gray-600">向き</div>
                    <div className="flex flex-wrap gap-2">
                      {(['horizontal','vertical'] as HypDir[]).map(d=>(
                        <button key={d} type="button" onClick={()=>set({ hdir:d })}
                          className={`px-3 py-1 rounded border ${s.hdir===d?'bg-gray-900 text-white':'bg-white'}`}>
                          {d==='horizontal'?'横（x先行）':'縦（y先行）'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
                    <label className="text-sm"><span className="block mb-1 text-gray-600">中心 h</span><NumInput value={s.hh} onChange={(v)=>set({ hh:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">中心 k</span><NumInput value={s.hk} onChange={(v)=>set({ hk:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">a</span><NumInput value={s.ha} onChange={setHyperA}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">b</span><NumInput value={s.hb} onChange={setHyperB}/></label>
                  </div>
                  {(errs.ha || errs.hb) && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
                      a, b は 0（または負）を指定できません。入力は反映されませんでした。
                    </div>
                  )}
                </>
              )}

              {s.kind2d==='parabola' && (
                <>
                  <div className="text-sm">
                    <div className="mb-1 text-gray-600">向き</div>
                    <div className="flex flex-wrap gap-2">
                      {(['up','down','left','right'] as ParaDir[]).map(d=>(
                        <button key={d} type="button" onClick={()=>set({ pdir:d })}
                          className={`px-3 py-1 rounded border ${s.pdir===d?'bg-gray-900 text-white':'bg-white'}`}>
                          {d==='up'?'上':d==='down'?'下':d==='left'?'左':'右'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
                    <label className="text-sm"><span className="block mb-1 text-gray-600">頂点 h</span><NumInput value={s.ph} onChange={(v)=>set({ ph:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">頂点 k</span><NumInput value={s.pk} onChange={(v)=>set({ pk:v })}/></label>
                    <label className="text-sm"><span className="block mb-1 text-gray-600">係数 p</span>
                      <NumInput
                        value={s.pp}
                        onChange={(v)=>{
                          const pSign = v >= 0 ? +1 : -1;
                          const vertical = s.pdir === 'up' || s.pdir === 'down';
                          const desired = vertical ? (pSign>0?'up':'down') : (pSign>0?'right':'left');
                          set({ pp:v, pdir: desired as ParaDir });
                        }}
                      />
                    </label>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
      renderFormulas={()=>formulas}
      renderTable={()=>signTable}
      draw={draw}
      toQuery={(s)=>({
        dim:s.dim, rel:s.rel, kind1d:s.kind1d, kind2d:s.kind2d,
        a:String(s.a), b:String(s.b), c:String(s.c),
        A:String(s.A), B:String(s.B), C:String(s.C),
        ch:String(s.ch), ck:String(s.ck), cr:String(s.cr),
        eh:String(s.eh), ek:String(s.ek), ea:String(s.ea), eb:String(s.eb),
        ph:String(s.ph), pk:String(s.pk), pp:String(s.pp), pdir:s.pdir,
        hh:String(s.hh), hk:String(s.hk), ha:String(s.ha), hb:String(s.hb), hdir:s.hdir,  // ← 追加
        sign: s.showSign?'1':'0',
      })}
      fromQuery={(qs)=>{
        const num=(k:string)=>{ const v=qs.get(k); if(v==null) return undefined; const n=Number(v); return Number.isFinite(n)?n:undefined; };
        const pick = <T extends string>(v:string|null, opts: readonly T[]) => (v && (opts as readonly string[]).includes(v)) ? v as T : undefined;
        return {
          dim: pick(qs.get('dim'), ['1d','2d'] as const),
          rel: pick(qs.get('rel'), ['<','<=','>','>='] as const),
          kind1d: pick(qs.get('kind1d')||qs.get('kind'), ['linear','quadratic'] as const),
          kind2d: pick(qs.get('kind2d'), ['linear','circle','ellipse','parabola','hyperbola'] as const),
          a:num('a'), b:num('b'), c:num('c'),
          A:num('A'), B:num('B'), C:num('C'),
          ch:num('ch'), ck:num('ck'), cr:num('cr'),
          eh:num('eh'), ek:num('ek'),
          ea:(()=>{ const v=num('ea'); return v!==undefined && v>0 ? v : undefined; })(),
          eb:(()=>{ const v=num('eb'); return v!==undefined && v>0 ? v : undefined; })(),
          ph:num('ph'), pk:num('pk'), pp:num('pp'), pdir: pick(qs.get('pdir'), ['up','down','left','right'] as const),
          hh:num('hh'), hk:num('hk'),
          ha:(()=>{ const v=num('ha'); return v!==undefined && v>0 ? v : undefined; })(),
          hb:(()=>{ const v=num('hb'); return v!==undefined && v>0 ? v : undefined; })(),
          hdir: pick(qs.get('hdir'), ['horizontal','vertical'] as const),
          showSign: qs.get('sign')? (qs.get('sign')==='1'||qs.get('sign')==='true') : undefined,
        } as Partial<State>;
      }}
    />
  );
}
