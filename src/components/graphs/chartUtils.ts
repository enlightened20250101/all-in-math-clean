// src/components/graphs/chartUtils.ts

// ===== 型 =====
export type Series = Array<{ name: string; points: { x: number; y: number }[] }>;
export type Polyline = Array<{ x: number; y: number }>;
export type InequalityCmp = 'le' | 'ge';

// 関数に渡すパラメータ（a,b,c など）
export type EvalParams = Record<string, number> | undefined;

function normalizeExpr(expr: string) {
  let t = (expr ?? '').toString();
  t = t.replace(/[\r\n]+/g, ' ').normalize('NFKC');

  // θ / theta → x（極座標用）
  t = t.replace(/θ/gi, 'x').replace(/\btheta\b/gi, 'x');

  // π, pi → Math.PI
  t = t.replace(/π/gi, 'PI').replace(/\bpi\b/gi, 'PI');

  // 絶対値 |...| → abs(...)
  t = t.replace(/\|([^|]+)\|/g, 'abs($1)');

  // ^ → **, ln(...) → log(...)
  t = t.replace(/\^/g, '**').replace(/\bln\s*\(/gi, 'log(');

  // ★ 追加: √(…) → sqrt(…)
  t = t.replace(/√\s*\(/g, 'sqrt(');

  // ★ 追加: sgn(…) → sign(…)
  t = t.replace(/\bsgn\s*\(/gi, 'sign(');

  // 暗黙の掛け算（関数名は壊さない）
  t = t.replace(/(\d)\s*([xy(])/gi, '$1*$2');   // 2x, 2(x)
  t = t.replace(/([xy])\s*(\d)/gi, '$1*$2');    // x2
  t = t.replace(/([xy])\s*\(/gi, '$1*(');       // x(…)
  t = t.replace(/\)\s*([xy\d])/gi, ')*$1');     // (… )x, (… )2
  t = t.replace(/([xy])\s+([xy])/gi, '$1*$2');  // x y

  return t.trim();
}

// ===== 1変数関数 y = f(x) =====
// SmartMathInput / GraphStudio から利用される「評価エンジン」。
// 利用できる主な関数・定数:
//   - 三角:      sin, cos, tan, asin, acos, atan
//   - 双曲線:    sinh, cosh, tanh
//   - 指数・対数: exp, log (自然対数)
//   - ルート等:  sqrt, abs
//   - 丸め:      floor, ceil, round
//   - その他:    pow, min, max, sign
//   - 定数:      PI, E
// さらに normalizeExpr により:
//   - ln(...)  → log(...)
//   - |x|      → abs(x)
//   - θ,theta → x,   π,pi → PI
// などの前処理が行われる。
export function buildFunction(expr: string, params?: EvalParams) {
  const t = normalizeExpr(expr);
  if (!/^[0-9+\-*/().,\sA-Za-z*_]+$/.test(t)) return (_x: number) => NaN;

  try {
    const body = `
      const {
        sin,cos,tan,asin,acos,atan,
        sinh,cosh,tanh,
        log,exp,sqrt,abs,
        floor,ceil,round,
        pow,min,max,sign,
        PI,E
      } = Math;
      const p = params || {};
      with (Math) { with (p) { return (${t}); } }
    `;
    const fn = new Function('x', 'params', body) as (x: number, params?: EvalParams) => number;

    return (x: number) => {
      try {
        const v = fn(x, params);
        return Number.isFinite(v) ? Number(v) : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return (_x: number) => NaN;
  }
}

// CSV / 設定から Series を生成（直交座標 y=f(x) / series データ用）
export function toSeriesFromConfig(type: 'function' | 'series', config: any): Series {
  if (type === 'function') {
    const {
      expr,
      xMin = -10,
      xMax = 10,
      step,
      name = 'f(x)',
      params,
    } = config ?? {};
    const f = buildFunction(expr ?? 'x', params);
    const pts: Array<{ x: number; y: number }> = [];
    const st = (step && step > 0) ? step : Math.max((xMax - xMin) / 400, 1e-3);
    for (let x = xMin; x <= xMax + 1e-12; x = Number((x + st).toFixed(12))) {
      const y = f(x);
      if (Number.isFinite(y)) pts.push({ x, y });
    }
    return [{ name, points: pts }];
  } else {
    const series = (config?.series ?? []).map((s: any) => ({
      name: s.name ?? 'series',
      points: (s.data ?? []).map(([x, y]: [number, number]) => ({ x, y })),
    }));
    return series;
  }
}

// ===== 2変数関数 F(x,y) 用（陰関数） =====
export function buildFunction2D(expr: string, params?: EvalParams) {
  const t = normalizeExpr(expr);
  if (!/^[0-9+\-*/().,\sA-Za-z*_]+$/.test(t)) return (_x: number, _y: number) => NaN;

  try {
    const body = `
      const {
        sin,cos,tan,asin,acos,atan,
        sinh,cosh,tanh,
        log,exp,sqrt,abs,
        floor,ceil,round,
        pow,min,max,sign,
        PI,E
      } = Math;
      const p = params || {};
      with (Math) { with (p) { return (${t}); } }
    `;
    const fn = new Function('x', 'y', 'params', body) as (x: number, y: number, params?: EvalParams) => number;

    return (x: number, y: number) => {
      try {
        const v = fn(x, y, params);
        return Number.isFinite(v) ? Number(v) : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return (_x: number, _y: number) => NaN;
  }
}

// 2変数の陰関数 F(x, y) の「内側/外側」をサンプリングして塗り用の点を返す
export function implicitRegionPoints(
  lhsExpr: string,
  rhsExpr: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  nx = 80,
  ny = 80,
  cmp: InequalityCmp,          // 'le' → lhs <= rhs, 'ge' → lhs >= rhs
  params?: EvalParams,
): { x: number; y: number }[] {
  const fl = buildFunction2D(lhsExpr, params);
  const fr = buildFunction2D(rhsExpr, params);

  const points: { x: number; y: number }[] = [];
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;

  for (let j = 0; j <= ny; j++) {
    const y = yMin + dy * j;
    for (let i = 0; i <= nx; i++) {
      const x = xMin + dx * i;
      const v = fl(x, y) - fr(x, y);
      if (!Number.isNaN(v)) {
        const ok = cmp === 'le' ? v <= 0 : v >= 0;
        if (ok) {
          points.push({ x, y });
        }
      }
    }
  }
  return points;
}

// マーチングスクエア（level=0）
export function marchingSquaresZero(
  f:(x:number,y:number)=>number,
  xMin:number,xMax:number,yMin:number,yMax:number,
  nx=80, ny=80
): Polyline[] {
  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;

  const z: number[][] = Array.from({length: ny+1}, ()=>Array(nx+1).fill(0));
  for (let j=0;j<=ny;j++){
    const y = yMin + j*dy;
    for (let i=0;i<=nx;i++){
      const x = xMin + i*dx;
      const v = f(x,y);
      z[j][i] = Number.isFinite(v) ? v : NaN;
    }
  }

  const lines: Polyline[] = [];
  for (let j=0;j<ny;j++){
    for (let i=0;i<nx;i++){
      const x0 = xMin + i*dx, x1 = x0 + dx;
      const y0 = yMin + j*dy, y1 = y0 + dy;

      const v = [ z[j][i], z[j][i+1], z[j+1][i+1], z[j+1][i] ];
      if (v.some(Number.isNaN)) continue;

      const s = v.map(_ => (_>=0?1:0));
      const code = (s[0]) | (s[1]<<1) | (s[2]<<2) | (s[3]<<3);
      if (code===0 || code===15) continue;

      const interp = (xa:number, ya:number, va:number, xb:number, yb:number, vb:number) => {
        const t = va===vb ? 0.5 : (0 - va) / (vb - va);
        return { x: xa + t*(xb - xa), y: ya + t*(yb - ya) };
      };
      const edgePoint = (edge:number) => {
        switch(edge){
          case 0: return interp(x0,y0,v[0], x1,y0,v[1]);
          case 1: return interp(x1,y0,v[1], x1,y1,v[2]);
          case 2: return interp(x1,y1,v[2], x0,y1,v[3]);
          case 3: return interp(x0,y1,v[3], x0,y0,v[0]);
          default: return null;
        }
      };

      const edges: number[][] = [];
      switch (code) {
        case 1: case 14: edges.push([3,0]); break;
        case 2: case 13: edges.push([0,1]); break;
        case 3: case 12: edges.push([3,1]); break;
        case 4: case 11: edges.push([1,2]); break;
        case 5:          edges.push([3,2]); edges.push([0,1]); break;
        case 6: case 9:  edges.push([0,2]); break;
        case 7: case 8:  edges.push([3,2]); break;
        case 10:         edges.push([1,3]); edges.push([0,2]); break;
      }

      for (const [e1,e2] of edges){
        const p1 = edgePoint(e1), p2 = edgePoint(e2);
        if (p1 && p2) lines.push([p1,p2]);
      }
    }
  }

  return stitchSegments(lines);
}

function stitchSegments(segs: Polyline[]): Polyline[] {
  const key = (p:{x:number;y:number}) => `${p.x.toFixed(5)},${p.y.toFixed(5)}`;
  const used = new Array(segs.length).fill(false);
  const polylines: Polyline[] = [];

  for (let i=0;i<segs.length;i++){
    if (used[i]) continue;
    used[i] = true;
    let line = [...segs[i]];
    let extended = true;
    while (extended){
      extended = false;
      for (let j=0;j<segs.length;j++){
        if (used[j]) continue;
        const a = segs[j][0], b = segs[j][1];
        if (key(line[line.length-1])===key(a)) { line.push(b); used[j]=true; extended=true; }
        else if (key(line[line.length-1])===key(b)) { line.push(a); used[j]=true; extended=true; }
        else if (key(line[0])===key(b)) { line.unshift(a); used[j]=true; extended=true; }
        else if (key(line[0])===key(a)) { line.unshift(b); used[j]=true; extended=true; }
      }
    }
    polylines.push(line);
  }
  return polylines;
}

// ===== 統合パーサ：1つの式から function / implicit / polar を判定 =====
export type ParsedEquation =
  | {
      kind: 'function';
      label: string;
      conf: { expr: string; xMin: number; xMax: number; step: number; name?: string };
      original?: string;
    }
  | {
      kind: 'implicit';
      label: string;
      conf: {
        lhs: string;
        rhs: string;
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        nx: number;
        ny: number;
      };
      original?: string;
    }
  | {
      kind: 'polar';
      label: string;
      conf: { expr: string; xMin: number; xMax: number; step: number; name?: string };
      original?: string;
    }
  | {
      kind: 'param';
      label: string;
      conf: {
        xExpr: string;
        yExpr: string;
        tMin: number;
        tMax: number;
        step: number;
        name?: string;
      };
      original?: string;
    }
  | {
      kind: 'ineq1d'; // ★ 追加：1次元不等式 y と x の関係
      label: string;
      conf: {
        expr: string;                  // 境界 f(x)
        op: 'ge' | 'le' | 'gt' | 'lt'; // >= <= > <
        xMin: number;
        xMax: number;
        step: number;
        name?: string;
      };
      original?: string;
    }
  | {
      // 2D 不等式（lhs ? rhs）; 実際に塗るときは lhs - rhs の符号で判定
      kind: 'ineq2d';
      label: string;
      conf: {
        Fexpr: string;      // F(x,y) = lhs - rhs
        cmp: InequalityCmp; // ★ 'le' or 'ge' に正規化して持つ
        xMin: number;
        xMax: number;
        yMin: number;
        yMax: number;
        nx: number;
        ny: number;
      };
      original?: string;
    };



export function parseUnifiedInputOne(
  input: string,
  current: {
    xMin: number;
    xMax: number;
    step: number;
    yMin: number;
    yMax: number;
    nx: number;
    ny: number;
  },
  defaultLabel: string,
): ParsedEquation {
  const raw = normalizeRelationOps((input ?? '').trim());

  // ★ 1次不等式（y と x）を先に判定する

  // y ? expr 形式（例: y >= x+1）
  const m1 = raw.match(/^\s*y\s*(<=|>=|<|>)\s*(.+)$/i);
  if (m1) {
    const opSym = m1[1];
    const rhsRaw = m1[2];
    const op: 'ge' | 'le' | 'gt' | 'lt' =
      opSym === '>=' ? 'ge' :
      opSym === '<=' ? 'le' :
      opSym === '>'  ? 'gt' : 'lt';

    const expr = normalizeExpr(rhsRaw);
    return {
      kind: 'ineq1d',
      label: defaultLabel,
      conf: {
        expr,
        op,
        xMin: current.xMin,
        xMax: current.xMax,
        step: current.step,
        name: defaultLabel,
      },
    };
  }

  // 式全体に対する不等号の正規化
  function normalizeRelationOps(raw: string): string {
    return (raw ?? '')
      .normalize('NFKC')
      // 全角・数学記号を ASCII の記号にそろえる
      .replace(/≦|≤/g, '<=')
      .replace(/≧|≥/g, '>=')
      .replace(/＜/g, '<')
      .replace(/＞/g, '>');
  }

  // expr ? y 形式（例: x+1 <= y など）→ y ? expr に反転して扱う
  const m2 = raw.match(/^\s*(.+)\s*(<=|>=|<|>)\s*y\s*$/i);
  if (m2) {
    const lhsRaw = m2[1];
    const opSym = m2[2];

    // x+1 <= y  は y >= x+1 :
    //   <= → >=,  >= → <=,  < → >,  > → <
    const flipOp = (sym: string): 'ge' | 'le' | 'gt' | 'lt' => {
      if (sym === '<=') return 'ge';
      if (sym === '>=') return 'le';
      if (sym === '<')  return 'gt';
      return 'lt';
    };

    const op = flipOp(opSym);
    const expr = normalizeExpr(lhsRaw);
    return {
      kind: 'ineq1d',
      label: defaultLabel,
      conf: {
        expr,
        op,
        xMin: current.xMin,
        xMax: current.xMax,
        step: current.step,
        name: defaultLabel,
      },
    };
  }

  // --- ★ 2D 不等式（x,y を含む） ---
  // 例: x^2 + y^2 <= 1,  x^2 + y^2 - 1 >= 0 など
  const relMatch = raw.match(/^\s*(.+)\s*(<=|>=|<|>)\s*(.+)\s*$/);
  if (relMatch) {
    const lhsRaw = relMatch[1];
    const opSym  = relMatch[2];  // '<', '<=', '>', '>=' のどれか
    const rhsRaw = relMatch[3];

    const hasXY = (s: string) => /[xy]/i.test(s);

    if (hasXY(lhsRaw) || hasXY(rhsRaw)) {
      // ★ '<' と '<=' は 'le'（lhs <= rhs）、 '>' と '>=' は 'ge'（lhs >= rhs）として扱う
      const cmp: InequalityCmp =
        opSym.indexOf('<') !== -1 ? 'le' : 'ge';

      const lhs = normalizeExpr(lhsRaw);
      const rhs = normalizeExpr(rhsRaw);
      const Fexpr = `${lhs} - (${rhs})`; // F(x,y) = lhs - rhs

      return {
        kind: 'ineq2d',
        label: defaultLabel,
        conf: {
          Fexpr,
          cmp,
          xMin: current.xMin,
          xMax: current.xMax,
          yMin: current.yMin,
          yMax: current.yMax,
          nx: current.nx,
          ny: current.ny,
        },
      };
    }
  }

  // ★ パラメトリック: param: x = ...; y = ...
  const paramMatch = raw.match(/^param\s*:(.+)$/i);
  if (paramMatch) {
    const body = paramMatch[1];

    // ; で区切って x=..., y=... を探す
    const parts = body.split(';').map((s) => s.trim()).filter(Boolean);

    let xExprRaw: string | null = null;
    let yExprRaw: string | null = null;

    for (const part of parts) {
      const mx = part.match(/^\s*x\s*=\s*(.+)$/i);
      const my = part.match(/^\s*y\s*=\s*(.+)$/i);
      if (mx) xExprRaw = mx[1];
      if (my) yExprRaw = my[1];
    }

    if (!xExprRaw || !yExprRaw) {
      // パース失敗時は普通の式として扱う
      return {
        kind: 'function',
        label: defaultLabel,
        conf: {
          expr: normalizeExpr(raw),
          xMin: current.xMin,
          xMax: current.xMax,
          step: current.step,
          name: defaultLabel,
        },
      };
    }

    // t を x に置き換えて、既存の buildFunction を流用する
    const norm = (s: string) =>
      normalizeExpr(s).replace(/\bt\b/gi, 'x');

    return {
      kind: 'param',
      label: defaultLabel,
      conf: {
        xExpr: norm(xExprRaw),
        yExpr: norm(yExprRaw),
        tMin: current.xMin,
        tMax: current.xMax,
        step: current.step,
        name: defaultLabel,
      },
    };
  }

  // 極座標: r = ...
  const mp = raw.match(/^\s*r\s*=\s*(.+)$/i);
  if (mp) {
    const rhs = normalizeExpr(mp[1]);
    return {
      kind: 'polar',
      label: defaultLabel,
      conf: {
        expr: rhs,
        xMin: current.xMin,
        xMax: current.xMax,
        step: current.step,
        name: defaultLabel,
      },
    };
  }

  // y= ... → function
  const m = raw.match(/^\s*y\s*=\s*(.+)$/i);
  if (m) {
    const rhs = normalizeExpr(m[1]);
    return {
      kind: 'function',
      label: defaultLabel,
      conf: {
        expr: rhs,
        xMin: current.xMin,
        xMax: current.xMax,
        step: current.step,
        name: defaultLabel,
      },
    };
  }
  // a=b → implicit
  if (raw.includes('=')) {
    const [lhsRaw, rhsRaw] = raw.split('=');
    return {
      kind: 'implicit',
      label: defaultLabel,
      conf: {
        lhs: normalizeExpr(lhsRaw),
        rhs: normalizeExpr(rhsRaw),
        xMin: current.xMin,
        xMax: current.xMax,
        yMin: current.yMin,
        yMax: current.yMax,
        nx: current.nx,
        ny: current.ny,
      },
    };
  }
  // '='なしで y を含めば implicit ( = 0 )
  if (/[yY]/.test(raw)) {
    return {
      kind: 'implicit',
      label: defaultLabel,
      conf: {
        lhs: normalizeExpr(raw),
        rhs: '0',
        xMin: current.xMin,
        xMax: current.xMax,
        yMin: current.yMin,
        yMax: current.yMax,
        nx: current.nx,
        ny: current.ny,
      },
    };
  }
  // それ以外は function
  return {
    kind: 'function',
    label: defaultLabel,
    conf: {
      expr: normalizeExpr(raw),
      xMin: current.xMin,
      xMax: current.xMax,
      step: current.step,
      name: defaultLabel,
    },
  };
}

export function parseUnifiedInputMulti(
  input: string,
  current: {
    xMin: number;
    xMax: number;
    step: number;
    yMin: number;
    yMax: number;
    nx: number;
    ny: number;
  },
): ParsedEquation[] {
  const items = input
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (items.length === 0) return [];
  return items.map((eq, i) => parseUnifiedInputOne(eq, current, `f${i + 1}(x)`));
}

// ===== 陰関数を Series に変換（1式=1本、ポリライン間は線を切る） =====
export function implicitToSeries(
  lhs: string,
  rhs: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  nx = 80,
  ny = 80,
  params?: EvalParams,
): Series {
  const fl = buildFunction2D(lhs, params);
  const fr = buildFunction2D(rhs, params);
  const F = (x: number, y: number) => fl(x, y) - fr(x, y);

  // marchingSquaresZero は複数の折れ線 (Polyline[]) を返す
  const lines = marchingSquaresZero(F, xMin, xMax, yMin, yMax, nx, ny);

  const mergedPoints: { x: number; y: number }[] = [];

  lines.forEach((poly, idx) => {
    // ★ ポリラインが複数ある場合、その間に「NaNポイント」を挟んで線を切る
    if (idx > 0) {
      mergedPoints.push({ x: NaN as any, y: NaN as any });
    }
    for (const p of poly) {
      if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
        mergedPoints.push({ x: p.x, y: p.y });
      }
    }
  });

  if (mergedPoints.length === 0) return [];

  return [
    {
      name: '',
      points: mergedPoints,
    },
  ];
}


// ===== 極座標 r = f(θ) → Series =====
export function polarToSeries(
  conf: { expr: string; xMin: number; xMax: number; step: number; name?: string },
  params?: EvalParams,
): Series {
  const expr = conf.expr ?? '1';
  const tMin = conf.xMin ?? 0;
  const tMax = conf.xMax ?? 2 * Math.PI;
  const step = conf.step;
  const name = conf.name ?? 'r(θ)';

  const f = buildFunction(expr, params);
  const pts: { x: number; y: number }[] = [];

  const dt = step && step > 0 ? step : Math.max((tMax - tMin) / 400, 1e-3);

  for (let t = tMin; t <= tMax + 1e-12; t = Number((t + dt).toFixed(12))) {
    const r = f(t);
    if (!Number.isFinite(r)) continue;
    const x = r * Math.cos(t);
    const y = r * Math.sin(t);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      pts.push({ x, y });
    }
  }

  return [{ name, points: pts }];
}

// ===== パラメトリック (x(t), y(t)) → Series =====
export function parametricToSeries(
  conf: {
    xExpr: string;
    yExpr: string;
    tMin: number;
    tMax: number;
    step: number;
    name?: string;
  },
  params?: EvalParams,
): Series {
  const { xExpr, yExpr, tMin = 0, tMax = 2 * Math.PI, step, name } = conf;

  const fx = buildFunction(xExpr, params);
  const fy = buildFunction(yExpr, params);

  const pts: { x: number; y: number }[] = [];
  const dt =
    step && step > 0 ? step : Math.max((tMax - tMin) / 400, 1e-3);

  for (
    let t = tMin;
    t <= tMax + 1e-12;
    t = Number((t + dt).toFixed(12))
  ) {
    const x = fx(t);
    const y = fy(t);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      pts.push({ x, y });
    }
  }

  return [
    {
      name: name ?? 'param',
      points: pts,
    },
  ];
}


// ===== 全 Series から正方＋余白付きドメインを計算 =====
export function getEqualAspectDomain(
  series: Series,
  paddingRatio = 0.1,
): { xMin: number; xMax: number; yMin: number; yMax: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const s of series) {
    for (const p of s.points) {
      if (typeof p.x === 'number' && Number.isFinite(p.x)) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
      }
      if (typeof p.y === 'number' && Number.isFinite(p.y)) {
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxY)
  ) {
    return { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfX = (maxX - minX) / 2;
  const halfY = (maxY - minY) / 2;
  let half = Math.max(halfX, halfY);
  if (!Number.isFinite(half) || half === 0) half = 1;
  half *= 1 + paddingRatio;

  const round2 = (v: number) => Number(v.toFixed(2));

  return {
    xMin: round2(cx - half),
    xMax: round2(cx + half),
    yMin: round2(cy - half),
    yMax: round2(cy + half),
  };
}

// ==== 追加: 不等式用のグリッド塗りつぶしセルを作るヘルパー ====

export type IneqCell = {
  x0: number; // セルの左
  x1: number; // セルの右
  y0: number; // セルの下
  y1: number; // セルの上
};

/**
 * Fexpr, cmp（'le' | 'ge'）で与えられる 2D 不等式
 *   F(x,y) <= 0 / >= 0
 * を、(xMin..xMax)×(yMin..yMax) の格子上で評価し、
 * 「条件を満たすセル」だけ返す。
 */
export function buildIneqFillCells(
  Fexpr: string,
  cmp: InequalityCmp,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  nx: number,
  ny: number,
  params: EvalParams,
): IneqCell[] {
  const cells: IneqCell[] = [];

  if (
    !Number.isFinite(xMin) || !Number.isFinite(xMax) ||
    !Number.isFinite(yMin) || !Number.isFinite(yMax) ||
    nx <= 0 || ny <= 0
  ) {
    return cells;
  }

  // ★ ここがポイント：既存の buildFunction2D を使う
  const F = buildFunction2D(Fexpr, params);

  const dx = (xMax - xMin) / nx;
  const dy = (yMax - yMin) / ny;

  const isInside = (val: number) => {
    if (!Number.isFinite(val)) return false;
    if (cmp === 'le') return val <= 0;
    if (cmp === 'ge') return val >= 0;
    // 念のため（cmp が 'lt' / 'gt' に拡張されたとき用）
    if ((cmp as any) === 'lt') return val < 0;
    if ((cmp as any) === 'gt') return val > 0;
    return false;
  };

  for (let ix = 0; ix < nx; ix++) {
    const x0 = xMin + dx * ix;
    const x1 = x0 + dx;

    for (let iy = 0; iy < ny; iy++) {
      const y0 = yMin + dy * iy;
      const y1 = y0 + dy;

      const xc = (x0 + x1) / 2;
      const yc = (y0 + y1) / 2;

      let v: number;
      try {
        v = F(xc, yc);
      } catch {
        continue; // 評価失敗セルはスキップ
      }

      if (isInside(v)) {
        cells.push({ x0, x1, y0, y1 });
      }
    }
  }

  return cells;
}
