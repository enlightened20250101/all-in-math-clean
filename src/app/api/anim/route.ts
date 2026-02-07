// src/app/api/anim/route.ts
import { NextResponse } from 'next/server';
import { tryGenerateVizSpecWithLLM } from '@/server/anim/llmSpec';
import { selectCandidates } from '@/server/anim/selectCandidates';
import { sanitizeVizSpec } from '@/server/anim/sanitize';

type VizSpec = {
  preset: string;
  params?: Record<string, unknown>;
  objects?: any[];
  steps?: Array<{ reveal?: string[]; highlight?: string[]; note?: string }>;
  notes?: Array<{ text: string; anchor?: string }>;
  bbox?: [number, number, number, number];
  seed?: number;
};

// ── フォールバック（既存の式ベース実装を流用）
const allowedMath = Object.freeze({
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  exp: Math.exp, log: Math.log, sqrt: Math.sqrt, abs: Math.abs,
  PI: Math.PI, E: Math.E, pow: Math.pow, min: Math.min, max: Math.max,
});
function evalFx(fx: string) {
  const body = `"use strict"; const {sin,cos,tan,exp,log,sqrt,abs,PI,E,pow,min,max} = this; return (${fx});`;
  const fn = Function("x", body).bind(allowedMath) as (x:number)=>number;
  return (x:number) => {
    const y = fn(x);
    if (!Number.isFinite(y)) throw new Error("evalFx: non-finite");
    return y;
  };
}
function derivNum(f:(x:number)=>number, x0:number, h=1e-4){ return (f(x0+h)-f(x0-h))/(2*h); }

function specParabolaVertex(a=1, h=0, k=0): VizSpec {
  return {
    preset: 'parabola_vertex_shift',
    params: { a, h, k, xRange: [-5, 5] },
    bbox: [-6, 6, 6, -6],
    objects: [
      { type: 'grid', id: 'grid' },
      { type: 'axes', id: 'axes' },
      { type: 'point', id: 'V', coords: [h, k], label: 'V' },
      { type: 'line', id: 'axis', expr: `x=${h}`, style: 'dashed' },
      { type: 'curve', id: 'curve', fx: `${a}*(x-(${h}))**2 + (${k})` },
      { type: 'text', id: 'form', pos: [-5.5, 5.5], text: `y = ${a}(x - ${h})^2 + ${k}` },
    ],
    steps: [
      { reveal: ['grid', 'axes'] },
      { reveal: ['curve'] },
      { reveal: ['V', 'axis'], highlight: ['V', 'axis'], note: '頂点と軸を確認' },
    ],
    notes: [{ text: '平方完成 y = a(x-h)^2 + k', anchor: 'V' }],
  };
}

function specTangentGeneric(fxStr='x**2', x0=1): VizSpec {
  const f = evalFx(fxStr);
  const y0 = f(x0);
  const m  = derivNum(f, x0);
  const b  = y0 - m * x0;
  const ymax = Math.max(10, f(Math.max(x0, 3)) + 1);

  return {
    preset: 'tangent_at_point',
    params: { f: fxStr, x0, xRange: [-5, 5] },
    bbox: [-6, ymax, 6, -1],
    objects: [
      { type: 'grid', id: 'grid' },
      { type: 'axes', id: 'axes' },
      { type: 'curve', id: 'f', fx: fxStr, xRange: [-5, 5] },
      { type: 'point', id: 'P', coords: [x0, y0], label: 'P' },
      { type: 'line', id: 'tangent', expr: `y=${m}*x+(${b})` },
      { type: 'text', id: 'form', pos: [-5.5, ymax-0.5], text: `f(x)=${fxStr},  x0=${x0},  f'(x0)≈${Number(m.toFixed(4))}` },
    ],
    steps: [
      { reveal: ['grid', 'axes'] },
      { reveal: ['f'] },
      { reveal: ['P'], highlight: ['P'], note: '接点 P(x0,f(x0)) を確認' },
      { reveal: ['tangent'], highlight: ['tangent'], note: '接線 y = m x + b' },
    ],
  };
}

function specRiemannGeneric(fxStr='x**2', a=0, b=3, n=6, mode:'left'|'right'|'mid'='mid'): VizSpec {
  const f = evalFx(fxStr);
  const dx = (b - a) / n;
  const rects: any[] = [];
  let ymax = 0;

  for (let i = 0; i < n; i++) {
    const xL = a + i * dx;
    const xR = xL + dx;
    let xS = xL;
    if (mode === 'right') xS = xR;
    if (mode === 'mid')   xS = (xL + xR) / 2;

    const h = f(xS);
    ymax = Math.max(ymax, h);
    rects.push({ type: 'polygon', id: `rect-${i}`, points: [[xL,0],[xL,h],[xR,h],[xR,0]], fillColor:'#9bd1ff', fillOpacity:0.25 });
  }

  return {
    preset: 'riemann_sum_left_right_mid',
    params: { f: fxStr, a, b, n, mode },
    bbox: [a-1, Math.max(2, ymax+1), b+1, -1],
    objects: [
      { type: 'grid', id: 'grid' },
      { type: 'axes', id: 'axes' },
      { type: 'curve', id: 'f', fx: fxStr, xRange: [a - 0.5, b + 0.5] },
      ...rects,
      { type: 'text', id: 'info', pos: [a, Math.max(1.5, ymax+0.5)], text: `Riemann ${mode}, n=${n}` },
    ],
    steps: [
      { reveal: ['grid', 'axes'] },
      { reveal: ['f'] },
      { reveal: rects.map(r => r.id), note: '長方形近似を重ねる' },
    ],
  };
}

function specIneq1D(expr='(x-2)(x-3) ≤ 0'): VizSpec {
  return {
    preset: 'inequality_region_1d',
    params: { expr },
    bbox: [-1, 1, 7, -1],
    objects: [
      { type: 'axes', id: 'axes' },
      { type: 'text', id: 't', pos: [0, 0.5], text: expr },
      { type: 'point', id: 'r1', coords: [2, 0], label: '2' },
      { type: 'point', id: 'r2', coords: [3, 0], label: '3' },
      { type: 'segment', id: 'seg', ends: ['r1', 'r2'] },
    ],
    steps: [
      { reveal: ['axes', 't'] },
      { reveal: ['r1', 'r2', 'seg'], highlight: ['seg'] },
    ],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      kind, f, x0, a, b, n, mode, expr,
      problemLatex, summary, topic,
    } = body ?? {};

    // 1) 候補選定（軽量解析）
    const { candidates, hints } = selectCandidates({ summary, latex: problemLatex, topic });

    // 明示パラメータがあればヒントに上書き
    if (typeof f === 'string') hints.f = f;
    if (x0 !== undefined) hints.x0 = Number(x0);
    if (a !== undefined) hints.a = Number(a);
    if (b !== undefined) hints.b = Number(b);
    if (n !== undefined) hints.n = Number(n);
    if (mode && (mode === 'left' || mode === 'right' || mode === 'mid')) hints.mode = mode;
    if (typeof expr === 'string') hints.expr = expr;

    // 2) LLM に vizSpec 生成を依頼（成功したらサニタイズして返却）
    const llmSpec = await tryGenerateVizSpecWithLLM({
      summary,
      latex: problemLatex,
      topic,
      candidates,
      maxObjects: 24,
    });

    if (llmSpec) {
      const clean = sanitizeVizSpec(llmSpec, { maxObjects: 24 });
      return NextResponse.json({ ok: true, spec: clean, source: "llm" });
    }

    // 3) 失敗→フォールバック（式ベース or 以前のキーワード推定）
    if ((kind === 'tangent' || candidates.includes('tangent_at_point')) && typeof (hints.f ?? f) === 'string') {
      return NextResponse.json({ ok:true, spec: specTangentGeneric(String(hints.f ?? f), Number(hints.x0 ?? 1)), source: "rule" });
    }
    if ((kind === 'riemann' || candidates.includes('riemann_sum_left_right_mid')) && typeof (hints.f ?? f) === 'string') {
      const aa = Number(hints.a ?? a ?? 0), bb = Number(hints.b ?? b ?? 3), nn = Number(hints.n ?? n ?? 6);
      const mm = (hints.mode ?? mode);
      const m2 = (mm === 'left' || mm === 'right' || mm === 'mid') ? mm : 'mid';
      return NextResponse.json({ ok:true, spec: specRiemannGeneric(String(hints.f ?? f), aa, bb, nn, m2), source: "rule" });
    }
    if ((kind === 'ineq' || candidates.includes('inequality_region_1d')) && typeof (hints.expr ?? expr) === 'string') {
      return NextResponse.json({ ok:true, spec: specIneq1D(String(hints.expr ?? expr)), source: "rule" });
    }
    if ((kind === 'parabola' || candidates.includes('parabola_vertex_shift'))) {
      return NextResponse.json({ ok:true, spec: specParabolaVertex(1, 2, -1), source: "rule" });
    }

    // 4) それでも決まらなければ無難に
    return NextResponse.json({ ok:true, spec: specParabolaVertex(1, 0, 0), source: "fallback" });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message ?? 'unknown' }, { status: 400 });
  }
}
