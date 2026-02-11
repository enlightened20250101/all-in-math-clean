// src/components/graphs/GraphStudio.tsx
'use client';

import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import BivarSurface from '@/components/graphs/BivarSurface';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from 'recharts';
import {
  toSeriesFromConfig,
  implicitToSeries,
  parseUnifiedInputOne,
  ParsedEquation,
  polarToSeries,
  getEqualAspectDomain,
  Series,
  parametricToSeries,
  buildFunction2D,
} from './chartUtils';
import ExportPngButton from './ExportPngButton';
import ExportSvgButton from './ExportSvgButton';
import InlineKatex from './InlineKatex';
import { useIsMobile } from '@/hooks/useIsMobile';
import SmartMathInput from '@/components/math/SmartMathInput';

type SeriesConfig = {
  title: string;
  series: Array<{ name: string; data: Array<[number, number]> }>;
};

// ★ 式ごとの定義域（x or t）の型
type Domain1D = {
  xMin: number;
  xMax: number;
  step: number;
};

const PALETTE = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#9333ea',
  '#ea580c',
  '#0891b2',
  '#eab308',
  '#4b5563',
];

const DEFAULT_DOMAIN: Domain1D = {
  xMin: -6.28,
  xMax: 6.28,
  step: 0.05,
};

const CHART_MARGIN = { top: 24, right: 24, bottom: 32, left: 24 };

const DRAFT_KEY = 'graphStudioDraft_v1';

// TeX表示用：** → ^ 等の軽変換（見栄え用。実際の評価には影響しない）
function toDisplayTex(s: string) {
  return (s || '').replace(/\*\*/g, '^').replace(/\s*=\s*/g, ' = ');
}

// パラメータを式文字列に埋め込む（a,b,c → 数値）
function substituteParamsInEquation(
  eq: string,
  params: { a: number; b: number; c: number },
) {
  let out = eq ?? '';

  (['a', 'b', 'c'] as const).forEach((key) => {
    const v = params[key];
    const numStr =
      typeof v === 'number' && Number.isFinite(v)
        ? v < 0
          ? `(${v})`
          : String(v)
        : '0';
    const re = new RegExp(`\\b${key}\\b`, 'g');
    out = out.replace(re, numStr);
  });

  return out;
}

function getUsedParams(eq: string) {
  const s = eq ?? "";
  return {
    a: /\ba\b/.test(s),
    b: /\bb\b/.test(s),
    c: /\bc\b/.test(s),
  };
}

function estimateParamRange(eq: string) {
  const nums = (eq || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const maxAbs = nums.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  const base = Math.max(10, Math.min(50, Math.ceil(maxAbs * 2)));
  return base;
}

// ★ 不完全・破損した式を弾くための強力なバリデーション
function validateEquationSyntax(input: string): string | null {
  const s = input.trim();

  // 0. 空
  if (!s) return "式が空です";

  // 1. 明らかに未完成（例：y, x, t だけ）
  if (/^[a-zA-Z]$/.test(s)) {
    return "式として成立していません（右辺が必要です）";
  }

  // 2. 左辺・右辺が '=' を含む場合
  if (/=/.test(s)) {
    const parts = s.split('=');

    if (parts.length !== 2) {
      return "等号 '=' を複数使用しています（式を1つにしてください）";
    }

    const left = parts[0].trim();
    const right = parts[1].trim();

    if (!left) return "左辺が空です";
    if (!right) return "右辺が空です";
  }

  // 3. 不等号のチェック
  if (/[<>]=?=/.test(s)) {
    return "不等号の使い方が不正です";
  }

  // 4. 末尾が演算子で終わる
  if (/[+\-*/^]$/.test(s)) {
    return "式が演算子で終わっています";
  }

  // 5. 先頭が不正な演算子で始まる
  if (/^[*/^]/.test(s)) {
    return "式が演算子で始まっています";
  }

  // 6. 括弧の整合性チェック
  const stack = [];
  for (const ch of s) {
    if (ch === '(') stack.push(ch);
    if (ch === ')') {
      if (stack.length === 0) return "括弧の対応が取れていません";
      stack.pop();
    }
  }
  if (stack.length > 0) return "括弧が閉じられていません";

  return null; // OK
}

function encodeShareState(state: unknown) {
  try {
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
  } catch {
    return null;
  }
}

function decodeShareState(raw: string) {
  try {
    const json = decodeURIComponent(atob(raw));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.abs(value) < 1e-6 ? 0 : value;
  const fixed = Math.abs(rounded) >= 10 ? rounded.toFixed(2) : rounded.toFixed(3);
  return fixed.replace(/\.?0+$/, '');
}

function pickClosestYIntercept(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return null;
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (!Number.isFinite(p0.x) || !Number.isFinite(p1.x)) continue;
    if ((p0.x <= 0 && p1.x >= 0) || (p0.x >= 0 && p1.x <= 0)) {
      if (p0.x === p1.x) return { x: 0, y: p0.y };
      const t = (0 - p0.x) / (p1.x - p0.x);
      const y = p0.y + (p1.y - p0.y) * t;
      return { x: 0, y };
    }
  }
  let best = points[0];
  let bestDist = Math.abs(points[0].x);
  points.forEach((p) => {
    const d = Math.abs(p.x);
    if (d < bestDist) {
      best = p;
      bestDist = d;
    }
  });
  return { x: 0, y: best.y };
}

function findXIntercepts(points: Array<{ x: number; y: number }>, limit = 3) {
  const hits: number[] = [];
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (!Number.isFinite(p0.y) || !Number.isFinite(p1.y)) continue;
    if (p0.y === 0) {
      hits.push(p0.x);
      continue;
    }
    if (p0.y * p1.y < 0) {
      const t = -p0.y / (p1.y - p0.y);
      const x = p0.x + (p1.x - p0.x) * t;
      hits.push(x);
    }
  }
  const unique: number[] = [];
  hits.forEach((x) => {
    if (unique.every((u) => Math.abs(u - x) > 1e-3)) unique.push(x);
  });
  return unique.slice(0, limit);
}

function evalQuadraticSeries(
  pts: Array<{ x: number; y: number }>,
  i: number,
  x: number,
) {
  const p0 = pts[i - 1];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  if (!p0 || !p1 || !p2) {
    const a0 = pts[i - 1];
    const a1 = pts[i];
    if (!a0 || !a1) return NaN;
    const t = (x - a0.x) / (a1.x - a0.x);
    return a0.y + (a1.y - a0.y) * t;
  }
  const x0 = p0.x;
  const x1 = p1.x;
  const x2 = p2.x;
  const denom = (x0 - x1) * (x0 - x2) * (x1 - x2);
  if (Math.abs(denom) < 1e-9) {
    const t = (x - p0.x) / (p1.x - p0.x);
    return p0.y + (p1.y - p0.y) * t;
  }
  const aCoef =
    (x2 * (p1.y - p0.y) + x1 * (p0.y - p2.y) + x0 * (p2.y - p1.y)) / denom;
  const bCoef =
    (x2 * x2 * (p0.y - p1.y) +
      x1 * x1 * (p2.y - p0.y) +
      x0 * x0 * (p1.y - p2.y)) /
    denom;
  const cCoef = p0.y - aCoef * x0 * x0 - bCoef * x0;
  return aCoef * x * x + bCoef * x + cCoef;
}

function refineExtremum(points: Array<{ x: number; y: number }>, i: number) {
  const p0 = points[i - 1];
  const p1 = points[i];
  const p2 = points[i + 1];
  if (!p0 || !p1 || !p2) return p1;
  let x = p1.x;
  const left = Math.min(p0.x, p2.x);
  const right = Math.max(p0.x, p2.x);
  const span = Math.max(1e-6, right - left);
  const h = span * 0.05;
  for (let k = 0; k < 6; k += 1) {
    const f1 = evalQuadraticSeries(points, i, x + h);
    const f0 = evalQuadraticSeries(points, i, x - h);
    const fp = (f1 - f0) / (2 * h);
    const f2 = evalQuadraticSeries(points, i, x + h * 1.1);
    const f3 = evalQuadraticSeries(points, i, x - h * 1.1);
    const fpp = (f2 - 2 * evalQuadraticSeries(points, i, x) + f3) / (h * h * 1.21);
    if (!Number.isFinite(fp) || !Number.isFinite(fpp) || Math.abs(fpp) < 1e-8) break;
    const next = x - fp / fpp;
    if (!Number.isFinite(next)) break;
    x = Math.min(right, Math.max(left, next));
  }
  return { x, y: evalQuadraticSeries(points, i, x) };
}

function findExtrema(points: Array<{ x: number; y: number }>, limit = 2) {
  const maxima: Array<{ x: number; y: number }> = [];
  const minima: Array<{ x: number; y: number }> = [];
  for (let i = 1; i < points.length - 1; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const y0 = p0.y;
    const y1 = p1.y;
    const y2 = p2.y;
    if (![p0.x, p1.x, p2.x, y0, y1, y2].every(Number.isFinite)) continue;
    const dy1 = y1 - y0;
    const dy2 = y2 - y1;
    if (dy1 > 0 && dy2 < 0) {
      const denom = (p0.x - p1.x) * (p0.x - p2.x) * (p1.x - p2.x);
      if (Math.abs(denom) > 1e-9) {
        const a =
          (p2.x * (y1 - y0) + p1.x * (y0 - y2) + p0.x * (y2 - y1)) / denom;
        const b =
          (p2.x * p2.x * (y0 - y1) +
            p1.x * p1.x * (y2 - y0) +
            p0.x * p0.x * (y1 - y2)) /
          denom;
        const xv = -b / (2 * a);
        if (xv >= Math.min(p0.x, p2.x) && xv <= Math.max(p0.x, p2.x)) {
          maxima.push(refineExtremum(points, i));
          continue;
        }
      }
      maxima.push(refineExtremum(points, i));
    }
    if (dy1 < 0 && dy2 > 0) {
      const denom = (p0.x - p1.x) * (p0.x - p2.x) * (p1.x - p2.x);
      if (Math.abs(denom) > 1e-9) {
        const a =
          (p2.x * (y1 - y0) + p1.x * (y0 - y2) + p0.x * (y2 - y1)) / denom;
        const b =
          (p2.x * p2.x * (y0 - y1) +
            p1.x * p1.x * (y2 - y0) +
            p0.x * p0.x * (y1 - y2)) /
          denom;
        const xv = -b / (2 * a);
        if (xv >= Math.min(p0.x, p2.x) && xv <= Math.max(p0.x, p2.x)) {
          minima.push(refineExtremum(points, i));
          continue;
        }
      }
      minima.push(refineExtremum(points, i));
    }
  }
  return {
    maxima: maxima.slice(0, limit),
    minima: minima.slice(0, limit),
  };
}

function findIntersections(
  a: Array<{ x: number; y: number }>,
  b: Array<{ x: number; y: number }>,
  limit = 3,
) {
  const len = Math.min(a.length, b.length);
  const hits: Array<{ x: number; y: number }> = [];

  const evalQuadratic = evalQuadraticSeries;

  for (let i = 1; i < len - 1; i += 1) {
    const p0 = a[i - 1];
    const p1 = a[i];
    const q0 = b[i - 1];
    const q1 = b[i];
    if (![p0.x, p0.y, p1.x, p1.y, q0.y, q1.y].every(Number.isFinite)) continue;
    const d0 = p0.y - q0.y;
    const d1 = p1.y - q1.y;
    if (d0 === 0) {
      hits.push({ x: p0.x, y: p0.y });
      continue;
    }
    if (d0 * d1 < 0) {
      let left = p0.x;
      let right = p1.x;
      let mid = (left + right) / 2;
      for (let k = 0; k < 12; k += 1) {
        mid = (left + right) / 2;
        const yA = evalQuadratic(a, i, mid);
        const yB = evalQuadratic(b, i, mid);
        const d = yA - yB;
        if (!Number.isFinite(d)) break;
        if (d === 0) break;
        if (d0 * d < 0) {
          right = mid;
        } else {
          left = mid;
        }
      }
      const yFinal = evalQuadratic(a, i, mid);
      if (Number.isFinite(yFinal)) {
        hits.push({ x: mid, y: yFinal });
      }
    }
  }

  const unique: Array<{ x: number; y: number }> = [];
  hits.forEach((p) => {
    if (unique.every((u) => Math.abs(u.x - p.x) > 1e-3)) unique.push(p);
  });
  return unique.slice(0, limit);
}

function buildContourSegments(
  xs: number[],
  ys: number[],
  grid: number[][],
  level: number,
) {
  const segments: Array<[number, number, number, number]> = [];
  const ny = ys.length;
  const nx = xs.length;
  if (nx < 2 || ny < 2) return segments;

  const interp = (
    x1: number,
    y1: number,
    v1: number,
    x2: number,
    y2: number,
    v2: number,
  ) => {
    const t = (level - v1) / (v2 - v1);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t] as const;
  };

  for (let j = 0; j < ny - 1; j += 1) {
    for (let i = 0; i < nx - 1; i += 1) {
      const v0 = grid[j]?.[i];
      const v1 = grid[j]?.[i + 1];
      const v2 = grid[j + 1]?.[i + 1];
      const v3 = grid[j + 1]?.[i];
      if (![v0, v1, v2, v3].every(Number.isFinite)) continue;
      const x0 = xs[i];
      const x1 = xs[i + 1];
      const y0 = ys[j];
      const y1 = ys[j + 1];
      const c0 = v0 >= level ? 1 : 0;
      const c1 = v1 >= level ? 1 : 0;
      const c2 = v2 >= level ? 1 : 0;
      const c3 = v3 >= level ? 1 : 0;
      const idx = (c0 << 3) | (c1 << 2) | (c2 << 1) | c3;
      if (idx === 0 || idx === 15) continue;

      const top = interp(x0, y0, v0, x1, y0, v1);
      const right = interp(x1, y0, v1, x1, y1, v2);
      const bottom = interp(x0, y1, v3, x1, y1, v2);
      const left = interp(x0, y0, v0, x0, y1, v3);

      switch (idx) {
        case 1:
        case 14:
          segments.push(left.concat(bottom) as [number, number, number, number]);
          break;
        case 2:
        case 13:
          segments.push(bottom.concat(right) as [number, number, number, number]);
          break;
        case 3:
        case 12:
          segments.push(left.concat(right) as [number, number, number, number]);
          break;
        case 4:
        case 11:
          segments.push(top.concat(right) as [number, number, number, number]);
          break;
        case 5:
          segments.push(top.concat(left) as [number, number, number, number]);
          segments.push(bottom.concat(right) as [number, number, number, number]);
          break;
        case 6:
        case 9:
          segments.push(top.concat(bottom) as [number, number, number, number]);
          break;
        case 7:
        case 8:
          segments.push(top.concat(left) as [number, number, number, number]);
          break;
        case 10:
          segments.push(top.concat(right) as [number, number, number, number]);
          segments.push(bottom.concat(left) as [number, number, number, number]);
          break;
        default:
          break;
      }
    }
  }

  return segments;
}

function lerpColor(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ] as const;
}

function rgbToCss(c: [number, number, number]) {
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

type HistorySnapshot = {
  equations: string[];
  colors: string[];
  domains: Domain1D[];
  paramList: { a: number; b: number; c: number }[];
  enabledList: boolean[];
  xLabel: string;
  yLabel: string;
  title: string;
  legendNames: string[];
};

export default function GraphStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get('from');   // ← ここで取得
  const shareParam = searchParams.get('g');
  const [userId, setUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const isMobile = useIsMobile();

  // SP のときだけ margin を小さくする
  const chartMargin = isMobile
    ? { top: 8, right: 8, bottom: 12, left: 8 }
    : CHART_MARGIN;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // === DOM参照 ===
  const equationChartRef = useRef<HTMLDivElement | null>(null);
  const seriesChartRef = useRef<HTMLDivElement | null>(null);
  const bivarChartRef = useRef<HTMLDivElement | null>(null);

  // プロット領域（実測値）: 式タブ
  const [plotBoxEq, setPlotBoxEq] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({ left: 0, top: 0, width: 0, height: 0 });

  const [chartSizeEq, setChartSizeEq] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // プロット領域（実測値）: seriesタブ
  const [plotBoxSeries, setPlotBoxSeries] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>({ left: 0, top: 0, width: 0, height: 0 });
  const pushHistory = (snap: HistorySnapshot) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(snap);
      return next.slice(-50);
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  };
  const restoreSnapshot = (snap: HistorySnapshot) => {
    setEquations(snap.equations);
    setColors(snap.colors);
    setDomains(snap.domains);
    setParamList(snap.paramList);
    setEnabledList(snap.enabledList);
    setXLabel(snap.xLabel);
    setYLabel(snap.yLabel);
    setTitle(snap.title);
    setLegendNames(snap.legendNames ?? []);
  };

  const [chartSizeSeries, setChartSizeSeries] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [chartSizeBivar, setChartSizeBivar] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // グラフ再計算トリガー（「グラフ作成」ボタンで増やす）
  const [drawVersion, setDrawVersion] = useState(0);

  // ---- 入力：複数式を配列で管理（+ で増やす / 削除可）----
  const [equations, setEquations] = useState<string[]>([
    'y=sin(x)',
    'y=cos(x)',
  ]);
  const [enabledList, setEnabledList] = useState<boolean[]>([
    true,
    true,
  ]);
  // ---- 2変数関数（等高線/3D用） ----
  const [bivarExpr, setBivarExpr] = useState<string>('x^2 + y^2');
  const [bivarView, setBivarView] = useState<'contour' | 'surface'>('contour');
  const [bivarDomain, setBivarDomain] = useState({
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
  });
  const [bivarGrid, setBivarGrid] = useState({ nx: 60, ny: 60 });
  const [bivarLevels, setBivarLevels] = useState<string>('');
  const [bivarParams, setBivarParams] = useState({ a: 1, b: 1, c: 1 });
  const [showBivarHeatmap, setShowBivarHeatmap] = useState(true);
  const [showBivarLabels, setShowBivarLabels] = useState(true);
  const [bivarColorScale, setBivarColorScale] = useState<
    'blueRed' | 'viridis' | 'mono'
  >('blueRed');
  const [bivarLevelShift, setBivarLevelShift] = useState(0);
  const [bivarLevelShiftLive, setBivarLevelShiftLive] = useState(0);
  const [bivarRotateSensitivity, setBivarRotateSensitivity] = useState(0.008);
  const [bivarResetNonce, setBivarResetNonce] = useState(0);
  const bivarShiftTrackRef = useRef<HTMLDivElement | null>(null);
  const bivarShiftDragRef = useRef(false);
  const bivarShiftRafRef = useRef<number | null>(null);
  const bivarShiftNextRef = useRef<number | null>(null);
  const bivarShiftCommitRef = useRef<number | null>(null);
  const bivarShiftLastTsRef = useRef(0);
  const [isBivarDragging, setIsBivarDragging] = useState(false);
  const [isBivarPanelOpen, setIsBivarPanelOpen] = useState(false);
  const [bivarParamDrafts, setBivarParamDrafts] = useState({
    a: '1',
    b: '1',
    c: '1',
  });
  const [bivarDomainDrafts, setBivarDomainDrafts] = useState({
    xMin: '-5',
    xMax: '5',
    yMin: '-5',
    yMax: '5',
  });
  const [bivarGridDrafts, setBivarGridDrafts] = useState({
    nx: '60',
    ny: '60',
  });
  const bivarGridRef = useRef(bivarGrid);
  const bivarGridDraftRef = useRef(bivarGridDrafts);
  const legendSnapshotRef = useRef<string[]>([]);
  const [colors, setColors] = useState<string[]>([PALETTE[0], PALETTE[1]]);
  const [title, setTitle] = useState('Overlay');

  // ★ 式ごとの定義域（関数: x / 極座標・param: t）
  const [domains, setDomains] = useState<Domain1D[]>([
    { ...DEFAULT_DOMAIN },
    { ...DEFAULT_DOMAIN },
  ]);
  const [domainDrafts, setDomainDrafts] = useState<
    { xMin?: string; xMax?: string; step?: string }[]
  >([]);

  // 軸ラベル（表示用）
  const [xLabel, setXLabel] = useState('x');
  const [yLabel, setYLabel] = useState('y');

  // 陰関数用の共通グリッド範囲
  const [yMin, setYMin] = useState(-3);
  const [yMax, setYMax] = useState(3);
  const [nx, setNx] = useState(80);
  const [ny, setNy] = useState(80);
  const [gridDraft, setGridDraft] = useState<{
    yMin: string;
    yMax: string;
    nx: string;
    ny: string;
  }>({
    yMin: String(-3),
    yMax: String(3),
    nx: String(80),
    ny: String(80),
  });

  // ★ 式ごとのパラメータ（a,b,c）
  const [paramList, setParamList] = useState<
  { a: number; b: number; c: number }[]
  >([
    { a: 1, b: 1, c: 0 }, // 1本目の式
    { a: 1, b: 1, c: 0 }, // 2本目の式
  ]);
  const [paramDrafts, setParamDrafts] = useState<
    { a?: string; b?: string; c?: string }[]
  >([]);

  useEffect(() => {
    setParamDrafts((prev) => {
      if (prev.length === equations.length) return prev;
      const next = [...prev];
      while (next.length < equations.length) next.push({});
      return next.slice(0, equations.length);
    });
  }, [equations.length]);

  useEffect(() => {
    setDomainDrafts((prev) => {
      if (prev.length === domains.length) return prev;
      const next = [...prev];
      while (next.length < domains.length) next.push({});
      return next.slice(0, domains.length);
    });
  }, [domains.length]);

  useEffect(() => {
    bivarGridRef.current = bivarGrid;
  }, [bivarGrid]);

  useEffect(() => {
    bivarGridDraftRef.current = bivarGridDrafts;
  }, [bivarGridDrafts]);

  useEffect(() => {
    setParamDrafts((prev) => {
      const next = [...prev];
      let changed = false;
      for (let i = 0; i < paramList.length; i += 1) {
        if (!next[i]) {
          next[i] = {};
          changed = true;
        }
        (["a", "b", "c"] as const).forEach((key) => {
          if (next[i]![key] === undefined) {
            next[i]![key] = String(paramList[i]?.[key] ?? "");
            changed = true;
          }
        });
      }
      return changed ? next : prev;
    });
  }, [paramList]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!panelDragRef.current?.active) return;
      const delta = panelDragRef.current.startY - e.clientY;
      const deltaVh = (delta / window.innerHeight) * 100;
      const next = Math.max(30, Math.min(70, panelDragRef.current.startVh + deltaVh));
      setPanelHeightVh(next);
    };
    const handleUp = () => {
      if (!panelDragRef.current) return;
      panelDragRef.current.active = false;
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  // ★ SP用：式専用入力パネル用の状態
  const [activeEqIndex, setActiveEqIndex] = useState<number | null>(null);
  const [isEqInputOpen, setIsEqInputOpen] = useState(false);

  // ★ SP用：式入力パネルの開閉フラグ
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelHeightVh, setPanelHeightVh] = useState(45);
  const panelDragRef = useRef<{
    active: boolean;
    startY: number;
    startVh: number;
  } | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef<{
    x: number;
    y: number;
    domain: { xMin: number; xMax: number; yMin: number; yMax: number };
  } | null>(null);
  const shareReady = useRef(false);
  const lastShare = useRef<string | null>(null);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (historyIndex <= 0) return;
        const nextIndex = historyIndex - 1;
        const snap = history[nextIndex];
        if (snap) {
          setHistoryIndex(nextIndex);
          restoreSnapshot(snap);
        }
        return;
      }
      if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        if (historyIndex >= history.length - 1) return;
        const nextIndex = historyIndex + 1;
        const snap = history[nextIndex];
        if (snap) {
          setHistoryIndex(nextIndex);
          restoreSnapshot(snap);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [history, historyIndex]);

  useEffect(() => {
    if (!shareParam) {
      shareReady.current = true;
      return;
    }
    const decoded = decodeShareState(shareParam);
    if (decoded && typeof decoded === 'object') {
      const state = decoded as Partial<{
        equations: string[];
        colors: string[];
        domains: Domain1D[];
        paramList: { a: number; b: number; c: number }[];
        enabledList: boolean[];
        xLabel: string;
        yLabel: string;
        title: string;
        legendNames: string[];
      }>;
      if (Array.isArray(state.equations)) setEquations(state.equations);
      if (Array.isArray(state.colors)) setColors(state.colors);
      if (Array.isArray(state.domains)) setDomains(state.domains);
      if (Array.isArray(state.paramList)) setParamList(state.paramList);
      if (Array.isArray(state.enabledList)) setEnabledList(state.enabledList);
      if (typeof state.xLabel === 'string') setXLabel(state.xLabel);
      if (typeof state.yLabel === 'string') setYLabel(state.yLabel);
      if (typeof state.title === 'string') setTitle(state.title);
      if (Array.isArray(state.legendNames)) setLegendNames(state.legendNames);
    }
    shareReady.current = true;
  }, [shareParam]);

  useEffect(() => {
    if (!shareReady.current) return;
    const snapshot = captureSnapshot();
    pushHistory(snapshot);
    const encoded = encodeShareState(snapshot);
    if (!encoded || encoded === lastShare.current) return;
    lastShare.current = encoded;
    const params = new URLSearchParams(searchParams.toString());
    params.set('g', encoded);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [
    equations,
    colors,
    domains,
    paramList,
    enabledList,
    xLabel,
    yLabel,
    title,
    router,
    searchParams,
  ]);
  const openEquationPanel = () => {
    setIsPanelOpen(true);
    if (activeEqIndex === null && equations.length) {
      setActiveEqIndex(0);
    }
    setIsEqInputOpen(true);
  };

  // データタブ（任意）
  const [tab, setTab] = useState<'equation' | 'series' | 'bivar'>('equation');
  const [sConf, setSConf] = useState<SeriesConfig>({
    title: 'Sample series',
    series: [
      {
        name: 'A',
        data: [
          [0, 0],
          [1, 0.84],
          [2, 0.91],
          [3, 0.14],
          [4, -0.76],
          [5, -0.96],
        ],
      },
      {
        name: 'B',
        data: [
          [0, 1],
          [1, 0.54],
          [2, -0.42],
          [3, -0.99],
          [4, -0.65],
          [5, 0.28],
        ],
      },
    ],
  });

  // 🔥 未ログインでもリダイレクトしない
  // drawVersion をトリガーに最新値で再解析するため deps を限定
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        // ログイン済みなら userId を保存。未ログインなら null のまま
        setUserId(user?.id ?? null);
      } catch (e) {
        console.error('auth check error', e);
        setUserId(null);
      }
    })();
  }, []);

  // 🔸 ローカル下書きの読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (fromId) return; // ← from 指定があるときはローカル下書きは無視

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;

      let restored = false;

      // 各 state を下書きから復元（存在するものだけ）
      if (Array.isArray(draft.equations)) {
        setEquations(draft.equations);
        restored = true;          // ★ ここで true に
      }
      if (Array.isArray(draft.colors)) setColors(draft.colors);
      if (Array.isArray(draft.domains)) setDomains(draft.domains);
      if (Array.isArray(draft.paramList)) setParamList(draft.paramList);

      if (typeof draft.title === 'string') setTitle(draft.title);
      if (typeof draft.xLabel === 'string') setXLabel(draft.xLabel);
      if (typeof draft.yLabel === 'string') setYLabel(draft.yLabel);

      if (typeof draft.yMin === 'number') setYMin(draft.yMin);
      if (typeof draft.yMax === 'number') setYMax(draft.yMax);
      if (typeof draft.nx === 'number') setNx(draft.nx);
      if (typeof draft.ny === 'number') setNy(draft.ny);
      if (typeof draft.bivarExpr === 'string') setBivarExpr(draft.bivarExpr);
      if (draft.bivarDomain && typeof draft.bivarDomain === 'object') {
        setBivarDomain((prev) => ({
          xMin: Number.isFinite(draft.bivarDomain.xMin) ? draft.bivarDomain.xMin : prev.xMin,
          xMax: Number.isFinite(draft.bivarDomain.xMax) ? draft.bivarDomain.xMax : prev.xMax,
          yMin: Number.isFinite(draft.bivarDomain.yMin) ? draft.bivarDomain.yMin : prev.yMin,
          yMax: Number.isFinite(draft.bivarDomain.yMax) ? draft.bivarDomain.yMax : prev.yMax,
        }));
      }
      if (draft.bivarGrid && typeof draft.bivarGrid === 'object') {
        setBivarGrid((prev) => ({
          nx: Number.isFinite(draft.bivarGrid.nx) ? draft.bivarGrid.nx : prev.nx,
          ny: Number.isFinite(draft.bivarGrid.ny) ? draft.bivarGrid.ny : prev.ny,
        }));
      }
      if (typeof draft.bivarLevels === 'string') setBivarLevels(draft.bivarLevels);
      if (draft.bivarParams && typeof draft.bivarParams === 'object') {
        const next = {
          a: Number.isFinite(draft.bivarParams.a) ? draft.bivarParams.a : bivarParams.a,
          b: Number.isFinite(draft.bivarParams.b) ? draft.bivarParams.b : bivarParams.b,
          c: Number.isFinite(draft.bivarParams.c) ? draft.bivarParams.c : bivarParams.c,
        };
        setBivarParams(next);
        setBivarParamDrafts({
          a: String(next.a),
          b: String(next.b),
          c: String(next.c),
        });
      }
      if (typeof draft.showBivarHeatmap === 'boolean') {
        setShowBivarHeatmap(draft.showBivarHeatmap);
      }
      if (typeof draft.showBivarLabels === 'boolean') {
        setShowBivarLabels(draft.showBivarLabels);
      }
      if (
        draft.bivarColorScale === 'blueRed' ||
        draft.bivarColorScale === 'viridis' ||
        draft.bivarColorScale === 'mono'
      ) {
        setBivarColorScale(draft.bivarColorScale);
      }
      if (typeof draft.bivarLevelShift === 'number' && Number.isFinite(draft.bivarLevelShift)) {
        setBivarLevelShift(draft.bivarLevelShift);
        setBivarLevelShiftLive(draft.bivarLevelShift);
      }

      if (draft.tab === 'equation' || draft.tab === 'series' || draft.tab === 'bivar') {
        setTab(draft.tab);
      }

      // ★ 何かしら復元できていたら、自動で一度だけグラフを描画
      if (restored) {
        setDrawVersion((v) => v + 1);
      }
    } catch (e) {
      console.error('failed to load GraphStudio draft', e);
    }
  }, [fromId]);

  // ---- 解析結果（パース済みリスト） ----
  const [parsedList, setParsedList] = useState<(ParsedEquation | null)[]>([]);
  const [legendSnapshot, setLegendSnapshot] = useState<string[]>([]);
  const [legendNames, setLegendNames] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [equationErrors, setEquationErrors] = useState<string[]>([]);
  const captureSnapshot = () => ({
    equations: [...equations],
    colors: [...colors],
    domains: domains.map((d) => ({ ...d })),
    paramList: paramList.map((p) => ({ ...p })),
    enabledList: [...enabledList],
    xLabel,
    yLabel,
    title,
    legendNames: [...legendNames],
  });
  const [fillConfig, setFillConfig] = useState<{
    enabled: boolean;
    idxA: number;
    idxB: number;
    xMin: string;
    xMax: string;
  }>({
    enabled: false,
    idxA: 0,
    idxB: 1,
    xMin: '',
    xMax: '',
  });
  const [paramAuto, setParamAuto] = useState<Record<number, boolean>>({});
  const [showAutoMarkers, setShowAutoMarkers] = useState(false);
  const [paramAutoConfig, setParamAutoConfig] = useState<
    Record<number, { speed: number; range: number }>
  >({});
  const paramAutoDir = useRef<Record<number, { a: number; b: number; c: number }>>({});
  const autoDrawTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const activeIndices = Object.entries(paramAuto)
      .filter(([, v]) => v)
      .map(([k]) => Number(k))
      .filter((n) => Number.isFinite(n));
    if (!activeIndices.length) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      setParamList((prev) => {
        const next = [...prev];
        let changed = false;

        activeIndices.forEach((idx) => {
          const eq = equations[idx] ?? '';
          const baseRange = estimateParamRange(eq);
          const config = paramAutoConfig[idx];
          const range = config?.range && Number.isFinite(config.range) ? config.range : baseRange;
          const speedBase = config?.speed && Number.isFinite(config.speed) ? config.speed : 0.35;
          const speed = range * speedBase;
          const used = getUsedParams(eq);
          const dir = paramAutoDir.current[idx] ?? { a: 1, b: 1, c: 1 };
          const current = next[idx] ?? { a: 0, b: 0, c: 0 };
          const updated = { ...current };

          (['a', 'b', 'c'] as const).forEach((key) => {
            if (!used[key]) return;
            let value = current[key] ?? 0;
            value += dir[key] * speed * dt;
            if (value > range) {
              value = range;
              dir[key] = -1;
            } else if (value < -range) {
              value = -range;
              dir[key] = 1;
            }
            updated[key] = value;
          });

          paramAutoDir.current[idx] = dir;
          next[idx] = updated;
          changed = true;
        });

        return changed ? next : prev;
      });

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [paramAuto, paramAutoConfig, equations]);

  useEffect(() => {
    if (tab !== 'equation') return;
    if (autoDrawTimerRef.current) {
      window.clearTimeout(autoDrawTimerRef.current);
    }
    autoDrawTimerRef.current = window.setTimeout(() => {
      setDrawVersion((v) => v + 1);
    }, 80);
    return () => {
      if (autoDrawTimerRef.current) {
        window.clearTimeout(autoDrawTimerRef.current);
      }
    };
  }, [tab, equations, domains, paramList, enabledList, yMin, yMax, nx, ny]);

  useEffect(() => {
    if (!fromId) return;         // from がないなら何もしない
  
    (async () => {
      const idNum = Number(fromId);
      if (!Number.isFinite(idNum)) return;
  
      const { data, error } = await supabaseBrowser
        .from('graphs')
        .select('title, config')
        .eq('id', idNum)
        .maybeSingle();
  
      if (error) {
        console.error('GraphStudio: failed to load graph for edit', error);
        return;
      }
      if (!data) return;
  
      try {
        const config = data.config ?? {};
        const overlay = config.overlay ?? [];
        const render = config.render ?? {};
  
        // タイトル
        if (typeof data.title === 'string') {
          setTitle(data.title);
        }
  
        // 式・パラメータ・定義域
        if (Array.isArray(overlay) && overlay.length > 0) {
          // 式の文字列（original）を復元
          setEquations(
            overlay.map((o: any) => (o.original as string) ?? ''),
          );
  
          // a,b,c パラメータ
          setParamList(
            overlay.map(
              (o: any) =>
                o.params ?? { a: 0, b: 0, c: 0 },
            ),
          );
  
          // 定義域（xMin, xMax, step）
          setDomains(
            overlay.map((o: any) => {
              const conf = o.conf ?? {};
              return {
                xMin:
                  typeof conf.xMin === 'number'
                    ? conf.xMin
                    : DEFAULT_DOMAIN.xMin,
                xMax:
                  typeof conf.xMax === 'number'
                    ? conf.xMax
                    : DEFAULT_DOMAIN.xMax,
                step:
                  typeof conf.step === 'number'
                    ? conf.step
                    : DEFAULT_DOMAIN.step,
              };
            }),
          );
        }
  
        // 軸ラベル / グリッド範囲
        if (typeof render.xLabel === 'string') setXLabel(render.xLabel);
        if (typeof render.yLabel === 'string') setYLabel(render.yLabel);
  
        if (typeof render.yMin === 'number') setYMin(render.yMin);
        if (typeof render.yMax === 'number') setYMax(render.yMax);
        if (typeof render.nx === 'number') setNx(render.nx);
        if (typeof render.ny === 'number') setNy(render.ny);
  
        // 色（足りなければパレットで埋める）
        if (Array.isArray(render.colors)) {
          const savedColors: string[] = render.colors;
          const needed = overlay.length;
          const padded = [...savedColors];
          while (padded.length < needed) {
            padded.push(
              PALETTE[padded.length % PALETTE.length],
            );
          }
          setColors(padded);
        }
  
        // 前回の解析結果やエラーは一旦リセット
        setParsedList([]);
        setLegendSnapshot([]);
        setEquationErrors([]);
  
        // 画面を「equation」タブにしておく
        setTab('equation');

        // ★ ここを追加：from=ID で編集開始時に自動で一度だけ描画
        if (overlay.length > 0) {
          setDrawVersion((v) => v + 1);
        }
      } catch (e) {
        console.error('GraphStudio: failed to apply loaded graph config', e);
      }
    })();
  }, [fromId]);  

  // 🔸 グラフ作成のたびに下書きを保存
  useEffect(() => {
    if (drawVersion === 0) return; // 初期ロードの 0 回目はスキップ
    if (typeof window === 'undefined') return;
  
    try {
      const draft = {
        equations,
        colors,
        domains,
        paramList,
        title,
        xLabel,
        yLabel,
        yMin,
        yMax,
        nx,
        ny,
        tab,
        bivarExpr,
        bivarDomain,
        bivarGrid,
        bivarLevels,
        bivarParams,
        showBivarHeatmap,
        showBivarLabels,
        bivarColorScale,
        bivarLevelShift,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('failed to save GraphStudio draft', e);
    }
  }, [
    drawVersion,
    equations,
    colors,
    domains,
    paramList,
    title,
    xLabel,
    yLabel,
    yMin,
    yMax,
    nx,
    ny,
    tab,
    bivarExpr,
    bivarDomain,
    bivarGrid,
    bivarLevels,
    bivarParams,
    showBivarHeatmap,
    showBivarLabels,
    bivarColorScale,
    bivarLevelShift,
  ]);

  useEffect(() => {
    setGridDraft((prev) => ({
      yMin: prev.yMin !== '' ? prev.yMin : String(yMin),
      yMax: prev.yMax !== '' ? prev.yMax : String(yMax),
      nx: prev.nx !== '' ? prev.nx : String(nx),
      ny: prev.ny !== '' ? prev.ny : String(ny),
    }));
  }, [yMin, yMax, nx, ny]);

  useEffect(() => {
    setDomainDrafts((prev) =>
      prev.map((draft, idx) => ({
        xMin: draft?.xMin ?? String(domains[idx]?.xMin ?? ''),
        xMax: draft?.xMax ?? String(domains[idx]?.xMax ?? ''),
        step: draft?.step ?? String(domains[idx]?.step ?? ''),
      })),
    );
  }, [domains]);

  useEffect(() => {
    setBivarDomainDrafts((prev) => ({
      xMin: prev.xMin !== '' ? prev.xMin : String(bivarDomain.xMin),
      xMax: prev.xMax !== '' ? prev.xMax : String(bivarDomain.xMax),
      yMin: prev.yMin !== '' ? prev.yMin : String(bivarDomain.yMin),
      yMax: prev.yMax !== '' ? prev.yMax : String(bivarDomain.yMax),
    }));
  }, [bivarDomain]);

  useEffect(() => {
    setBivarGridDrafts((prev) => ({
      nx: prev.nx !== '' ? prev.nx : String(bivarGrid.nx),
      ny: prev.ny !== '' ? prev.ny : String(bivarGrid.ny),
    }));
  }, [bivarGrid]);

  // 「グラフ作成」ボタンを押したときだけ再計算
  useEffect(() => {
    if (drawVersion === 0) return;
  
    let cancelled = false;
  
    (async () => {
      setIsDrawing(true);
  
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
  
      const eqs = [...equations];
      const dList = [...domains];
      const curYMin = yMin;
      const curYMax = yMax;
      const curNx = nx;
      const curNy = ny;
  
      // ★ ここでエラー配列を用意
      const newErrors: string[] = eqs.map(() => '');
  
      const next = eqs.map((eq, i) => {
        const d = dList[i] ?? DEFAULT_DOMAIN;
        const cur = {
          xMin: d.xMin,
          xMax: d.xMax,
          step: d.step,
          yMin: curYMin,
          yMax: curYMax,
          nx: curNx,
          ny: curNy,
        };
  
        const trimmed = eq.trim();
        const isEnabled = enabledList[i] ?? true;
        if (!isEnabled) {
          return null;
        }
        if (!trimmed) {
          // 式が空
          newErrors[i] = '式が空です';
          return null;
        }

        const syntaxError = validateEquationSyntax(trimmed);
        if (syntaxError) {
          newErrors[i] = syntaxError;
          return null;
        }

        // ★ これを追加： y・x・t だけの入力は無効扱い
        if (/^[xyz]$/i.test(trimmed)) {
          newErrors[i] = '式として成立しません（右辺が必要です）';
          return null;
        }
  
        let parsed: ParsedEquation;
        try {
          parsed = parseUnifiedInputOne(trimmed, cur, `f${i + 1}(x)`);
        } catch (e) {
          console.error('parse error at equation', i, eq, e);
          newErrors[i] = 'この式は解釈できません（構文を確認してください）';
          
          return null;
        }
        return parsed;
      });
  
      const labels: string[] = next.map((p, idx) => {
        if (!p) return '';  // 空式は空文字にする
      
        const raw = eqs[idx] ?? '';
      
        if (p.kind === 'implicit') {
          const { lhs, rhs } = p.conf;
          return toDisplayTex(raw || `${lhs}=${rhs}`);
        }
        return toDisplayTex(raw || (p as any).conf?.expr || '');
      });      
  
      if (!cancelled) {
        setParsedList(next);
        setLegendSnapshot(labels);
        setEquationErrors(newErrors);   // ★ ここでエラーを反映
        setIsDrawing(false);
      }
    })();
  
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawVersion]);  

  // ---- プレビュー用 Series の合成（Series 型の配列）----
  const previewSeriesList: Series = useMemo(() => {
    if (tab === 'series') {
      return toSeriesFromConfig('series', { series: sConf.series });
    }
  
    const out: Series = [];
  
    parsedList.forEach((p, idx) => {
      if (!p) return;

      const pParams = paramList[idx] ?? { a: 0, b: 0, c: 0 };
  
      if (p.kind === 'function') {
        const s = toSeriesFromConfig('function', {
          ...p.conf,
          name: p.conf.name || p.label,
          params: pParams,
        });
        out.push(...s);
      } else if (p.kind === 'polar') {
        const s = polarToSeries(
          { ...p.conf, name: p.conf.name || p.label },
          pParams,
        );
        out.push(...s);
      } else if (p.kind === 'param') {
        const s = parametricToSeries(
          { ...(p as any).conf, name: (p as any).conf?.name || p.label },
          pParams,
        );
        out.push(...s);
      } else if (p.kind === 'ineq1d') {
        const { expr, xMin, xMax, step } = p.conf;
        const s = toSeriesFromConfig('function', {
          expr,
          xMin,
          xMax,
          step,
          name: p.label,
          params: pParams,
        });
        out.push(...s);
      } else if (p.kind === 'ineq2d') {
        const { Fexpr, xMin, xMax, yMin, yMax, nx, ny } = p.conf;
        const s = implicitToSeries(
          Fexpr,
          '0',
          xMin,
          xMax,
          yMin,
          yMax,
          nx,
          ny,
          pParams,
        );
        out.push(...s);
      } else {
        const { lhs, rhs, xMin, xMax, yMin, yMax, nx, ny } = p.conf;
        const s = implicitToSeries(
          lhs,
          rhs,
          xMin,
          xMax,
          yMin,
          yMax,
          nx,
          ny,
          pParams,
        );
        out.push(...s);
      }
    });
  
    return out;
    // ★ equalDomain は「この中では使ってない」ので依存から外す
  }, [tab, parsedList, sConf.series, paramList]);
  

  const previewEmpty =
    previewSeriesList.length === 0 ||
    previewSeriesList.every((s) => s.points.length === 0);

  // 正方＆余白付きドメイン（全 Series から計算）
  const equalDomain = useMemo(
    () => getEqualAspectDomain(previewSeriesList, 0.1),
    [previewSeriesList],
  );

  const [viewDomain, setViewDomain] = useState<{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  } | null>(null);
  const [isUserViewport, setIsUserViewport] = useState(false);
  const [isChartHover, setIsChartHover] = useState(false);

  const isInsidePlot = (e: React.PointerEvent | React.WheelEvent) => {
    if (!chartWrapRef.current) return false;
    if (plotBoxEq.width <= 0 || plotBoxEq.height <= 0) return false;
    const rect = chartWrapRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    return (
      localX >= plotBoxEq.left &&
      localX <= plotBoxEq.left + plotBoxEq.width &&
      localY >= plotBoxEq.top &&
      localY <= plotBoxEq.top + plotBoxEq.height
    );
  };

  useEffect(() => {
    if (!isUserViewport) {
      setViewDomain(equalDomain);
    }
  }, [equalDomain, isUserViewport]);

  // X軸の整数tick
  const xTicks = useMemo(() => {
    const domain = viewDomain ?? equalDomain;
    const ticks: number[] = [];
    const min = Math.ceil(domain.xMin);
    const max = Math.floor(domain.xMax);
    for (let t = min; t <= max && ticks.length < 41; t++) ticks.push(t);
    return ticks;
  }, [viewDomain, equalDomain]);

  // Y軸の整数tick
  const yTicks = useMemo(() => {
    const domain = viewDomain ?? equalDomain;
    const ticks: number[] = [];
    const min = Math.ceil(domain.yMin);
    const max = Math.floor(domain.yMax);
    for (let t = min; t <= max && ticks.length < 41; t++) ticks.push(t);
    return ticks;
  }, [viewDomain, equalDomain]);

  // 凡例ラベル
  const baseLegendLabels =
    tab === 'series'
      ? sConf.series.map((s) => s.name || 'series')
      : legendSnapshot.filter((_, i) => parsedList[i] !== null);

  const legendLabels =
    tab === 'series'
      ? baseLegendLabels
      : baseLegendLabels.map((label, i) => legendNames[i] || label);

  useEffect(() => {
    legendSnapshotRef.current = legendSnapshot;
  }, [legendSnapshot]);

  useEffect(() => {
    if (tab !== 'equation') return;
    setLegendNames((prev) => {
      const snapshot = legendSnapshotRef.current;
      const next = equations.map((_, i) => prev[i] ?? snapshot[i] ?? `y${i + 1}`);
      const same =
        prev.length === next.length && prev.every((v, idx) => v === next[idx]);
      return same ? prev : next;
    });
  }, [equations.length, tab]);

  const functionSeries = useMemo(() => {
    if (tab !== 'equation') return [];
    const list: Array<{
      label: string;
      color: string;
      points: Array<{ x: number; y: number }>;
    }> = [];
    let cursor = 0;
    parsedList.forEach((p, idx) => {
      if (!p) return;
      const series = previewSeriesList[cursor];
      if (p.kind === 'function' && series) {
        list.push({
          label: legendLabels[idx] ?? series.name ?? `y${idx + 1}`,
          color: colors[idx] ?? PALETTE[idx % PALETTE.length],
          points: series.points,
        });
      }
      cursor += 1;
    });
    return list;
  }, [tab, parsedList, previewSeriesList, legendLabels, colors]);

  const fillBetweenData = useMemo(() => {
    if (!fillConfig.enabled) return null;
    if (functionSeries.length < 2) return null;
    const idxA = Math.min(functionSeries.length - 1, Math.max(0, fillConfig.idxA));
    const idxB = Math.min(functionSeries.length - 1, Math.max(0, fillConfig.idxB));
    if (idxA === idxB) return null;
    const a = functionSeries[idxA].points;
    const b = functionSeries[idxB].points;
    const len = Math.min(a.length, b.length);
    const data: Array<{ x: number; y1: number; y2: number }> = [];
    const xMinRaw = fillConfig.xMin.trim();
    const xMaxRaw = fillConfig.xMax.trim();
    const xMin = Number(xMinRaw);
    const xMax = Number(xMaxRaw);
    const hasXMin = xMinRaw !== '' && Number.isFinite(xMin);
    const hasXMax = xMaxRaw !== '' && Number.isFinite(xMax);
    for (let i = 0; i < len; i += 1) {
      const p0 = a[i];
      const p1 = b[i];
      if (![p0?.x, p0?.y, p1?.y].every(Number.isFinite)) continue;
      if (hasXMin && p0.x < xMin) continue;
      if (hasXMax && p0.x > xMax) continue;
      data.push({ x: p0.x, y1: p0.y, y2: p1.y });
    }
    return data.length ? data : null;
  }, [fillConfig, functionSeries]);

  const fillBetweenIntersections = useMemo(() => {
    if (!fillBetweenData) return [];
    if (functionSeries.length < 2) return [];
    const idxA = Math.min(functionSeries.length - 1, Math.max(0, fillConfig.idxA));
    const idxB = Math.min(functionSeries.length - 1, Math.max(0, fillConfig.idxB));
    if (idxA === idxB) return [];
    return findIntersections(functionSeries[idxA].points, functionSeries[idxB].points, 3);
  }, [fillBetweenData, functionSeries, fillConfig.idxA, fillConfig.idxB]);

  const fillBetweenArea = useMemo(() => {
    if (!fillBetweenData || fillBetweenData.length < 2) return null;
    let area = 0;
    const n = fillBetweenData.length - 1;
    const step = fillBetweenData[1].x - fillBetweenData[0].x;
    if (n >= 2 && n % 2 === 0 && Number.isFinite(step)) {
      // Simpson's rule
      let sum = 0;
      for (let i = 0; i <= n; i += 1) {
        const p = fillBetweenData[i];
        if (!p || ![p.x, p.y1, p.y2].every(Number.isFinite)) continue;
        const f = Math.abs(p.y1 - p.y2);
        if (i === 0 || i === n) {
          sum += f;
        } else if (i % 2 === 0) {
          sum += 2 * f;
        } else {
          sum += 4 * f;
        }
      }
      area = (step / 3) * sum;
    } else {
      // Trapezoid fallback
      for (let i = 1; i < fillBetweenData.length; i += 1) {
        const p0 = fillBetweenData[i - 1];
        const p1 = fillBetweenData[i];
        if (
          ![p0.x, p0.y1, p0.y2, p1.x, p1.y1, p1.y2].every(Number.isFinite)
        ) {
          continue;
        }
        const h = p1.x - p0.x;
        const f0 = Math.abs(p0.y1 - p0.y2);
        const f1 = Math.abs(p1.y1 - p1.y2);
        area += (f0 + f1) * 0.5 * h;
      }
    }
    return area;
  }, [fillBetweenData]);

  const bivarGridData = useMemo(() => {
    const nx = Math.max(10, Math.min(200, Math.round(bivarGrid.nx)));
    const ny = Math.max(10, Math.min(200, Math.round(bivarGrid.ny)));
    const xMin = bivarDomain.xMin;
    const xMax = bivarDomain.xMax;
    const yMin = bivarDomain.yMin;
    const yMax = bivarDomain.yMax;
    if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || !Number.isFinite(yMin) || !Number.isFinite(yMax)) {
      return null;
    }
    const f = buildFunction2D(bivarExpr, bivarParams);
    const xs = Array.from({ length: nx }, (_, i) => xMin + (i / (nx - 1)) * (xMax - xMin));
    const ys = Array.from({ length: ny }, (_, j) => yMin + (j / (ny - 1)) * (yMax - yMin));
    const grid: number[][] = [];
    let zMin = Infinity;
    let zMax = -Infinity;
    for (let j = 0; j < ny; j += 1) {
      const row: number[] = [];
      const y = ys[j];
      for (let i = 0; i < nx; i += 1) {
        const x = xs[i];
        const z = f(x, y);
        row.push(z);
        if (Number.isFinite(z)) {
          zMin = Math.min(zMin, z);
          zMax = Math.max(zMax, z);
        }
      }
      grid.push(row);
    }
    if (!Number.isFinite(zMin) || !Number.isFinite(zMax)) return null;
    return { xs, ys, grid, zMin, zMax };
  }, [bivarExpr, bivarDomain, bivarGrid, bivarParams]);

  const bivarLevelsList = useMemo(() => {
    if (!bivarGridData) return [];
    const raw = bivarLevels.trim();
    if (raw) {
    return raw
        .split(/[\\s,]+/)
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
        .map((v) => v + bivarLevelShift)
        .sort((a, b) => a - b);
    }
    const { zMin, zMax } = bivarGridData;
    const count = 8;
    if (zMax - zMin <= 1e-8) return [zMin];
    return Array.from({ length: count }, (_, i) => zMin + ((i + 1) / (count + 1)) * (zMax - zMin)).map(
      (v) => v + bivarLevelShift,
    );
  }, [bivarLevels, bivarGridData, bivarLevelShift]);

  const bivarContours = useMemo(() => {
    if (bivarView !== 'contour') return [];
    if (!bivarGridData || bivarLevelsList.length === 0 || isBivarDragging) return [];
    const { xs, ys, grid } = bivarGridData;
    return bivarLevelsList.map((level) => ({
      level,
      segments: buildContourSegments(xs, ys, grid, level),
    }));
  }, [bivarGridData, bivarLevelsList, isBivarDragging]);

  const bivarWidth = Math.max(chartSizeBivar.width, 1);
  const bivarHeight = Math.max(chartSizeBivar.height, 1);
  const bivarXScale = (x: number) =>
    ((x - bivarDomain.xMin) / Math.max(bivarDomain.xMax - bivarDomain.xMin, 1e-6)) *
    bivarWidth;
  const bivarYScale = (y: number) =>
    bivarHeight -
    ((y - bivarDomain.yMin) / Math.max(bivarDomain.yMax - bivarDomain.yMin, 1e-6)) *
      bivarHeight;
  const bivarLevelColors = useMemo(() => {
    if (!bivarGridData) return [];
    const { zMin, zMax } = bivarGridData;
    const span = Math.max(1e-6, zMax - zMin);
    return bivarLevelsList.map((level) => {
      const t = Math.min(1, Math.max(0, (level - zMin) / span));
      if (bivarColorScale === 'mono') {
        const g = Math.round(40 + t * 140);
        return `rgb(${g},${g},${g})`;
      }
      if (bivarColorScale === 'viridis') {
        const c = lerpColor([68, 1, 84], [253, 231, 37], t);
        return rgbToCss(c);
      }
      const hue = 210 - 180 * t; // blue -> red
      return `hsl(${hue}, 70%, 45%)`;
    });
  }, [bivarGridData, bivarLevelsList, bivarColorScale]);

  const bivarHeatmap = useMemo(() => {
    if (bivarView !== 'contour' || isBivarDragging) return [];
    if (!bivarGridData || chartSizeBivar.width <= 0 || chartSizeBivar.height <= 0) return [];
    const { xs, ys, grid, zMin, zMax } = bivarGridData;
    const span = Math.max(1e-6, zMax - zMin);
    const colorA: [number, number, number] =
      bivarColorScale === 'viridis' ? [68, 1, 84] : [59, 130, 246];
    const colorB: [number, number, number] =
      bivarColorScale === 'viridis' ? [253, 231, 37] : [239, 68, 68];
    const cells: Array<{ x: number; y: number; w: number; h: number; color: string }> = [];
    const nx = xs.length;
    const ny = ys.length;
    const stepX = bivarWidth / Math.max(1, nx - 1);
    const stepY = bivarHeight / Math.max(1, ny - 1);
    for (let j = 0; j < ny - 1; j += 1) {
      for (let i = 0; i < nx - 1; i += 1) {
        const z = grid[j]?.[i];
        if (!Number.isFinite(z)) continue;
        const t = Math.min(1, Math.max(0, (z - zMin) / span));
        const color =
          bivarColorScale === 'mono'
            ? `rgb(${Math.round(230 - 180 * t)},${Math.round(230 - 180 * t)},${Math.round(
                230 - 180 * t,
              )})`
            : rgbToCss(lerpColor(colorA, colorB, t));
        cells.push({
          x: i * stepX,
          y: bivarHeight - (j + 1) * stepY,
          w: stepX,
          h: stepY,
          color,
        });
      }
    }
    return cells;
  }, [
    bivarGridData,
    bivarWidth,
    bivarHeight,
    chartSizeBivar.width,
    chartSizeBivar.height,
    bivarColorScale,
  ]);

  const bivarContourLabels = useMemo(() => {
    if (bivarView !== 'contour' || isBivarDragging) return [];
    if (!bivarContours.length || bivarWidth <= 1 || bivarHeight <= 1) return [];
    const labels: Array<{ x: number; y: number; text: string; color: string }> = [];
    const minDist = 56; // px
    const maxTotal = 36;
    const maxPerLevel = 3;

    const tooClose = (x: number, y: number) =>
      labels.some((l) => {
        const dx = l.x - x;
        const dy = l.y - y;
        return dx * dx + dy * dy < minDist * minDist;
      });

    bivarContours.forEach((contour, idx) => {
      if (labels.length >= maxTotal) return;
      const segs = contour.segments;
      if (!segs.length) return;
      const step = Math.max(1, Math.floor(segs.length / 3));
      let placed = 0;
      for (let i = 0; i < segs.length; i += step) {
        if (placed >= maxPerLevel || labels.length >= maxTotal) break;
        const seg = segs[i];
        if (!seg) continue;
        const x = bivarXScale((seg[0] + seg[2]) / 2);
        const y = bivarYScale((seg[1] + seg[3]) / 2);
        if (tooClose(x, y)) continue;
        labels.push({
          x,
          y,
          text: formatNumber(contour.level),
          color: bivarLevelColors[idx] ?? '#0ea5e9',
        });
        placed += 1;
      }
    });
    return labels;
  }, [bivarContours, bivarLevelColors, bivarWidth, bivarHeight, bivarXScale, bivarYScale]);

  const fillBetweenPathEq = useMemo(() => {
    if (
      !fillBetweenData ||
      chartSizeEq.width <= 0 ||
      chartSizeEq.height <= 0 ||
      plotBoxEq.width <= 0 ||
      plotBoxEq.height <= 0
    ) {
      return null;
    }
    const dom = viewDomain ?? equalDomain;
    const xRange = Math.max(dom.xMax - dom.xMin, 1e-6);
    const yRange = Math.max(dom.yMax - dom.yMin, 1e-6);
    const xScale = (x: number) =>
      plotBoxEq.left + ((x - dom.xMin) / xRange) * plotBoxEq.width;
    const yScale = (y: number) =>
      plotBoxEq.top + (1 - (y - dom.yMin) / yRange) * plotBoxEq.height;

    const top = fillBetweenData.map((d) => [xScale(d.x), yScale(d.y1)] as const);
    const bottom = [...fillBetweenData]
      .reverse()
      .map((d) => [xScale(d.x), yScale(d.y2)] as const);
    if (top.length < 2 || bottom.length < 2) return null;

    const path = [
      `M ${top[0][0]} ${top[0][1]}`,
      ...top.slice(1).map(([x, y]) => `L ${x} ${y}`),
      ...bottom.map(([x, y]) => `L ${x} ${y}`),
      'Z',
    ].join(' ');

    return path;
  }, [
    fillBetweenData,
    plotBoxEq,
    chartSizeEq,
    viewDomain,
    equalDomain,
  ]);

  const autoInsights = useMemo(() => {
    return functionSeries.slice(0, 3).map((series) => {
      const points = series.points;
      const xIntercepts = findXIntercepts(points, 3);
      const yIntercept = pickClosestYIntercept(points);
      const { maxima, minima } = findExtrema(points, 2);
      return {
        label: series.label,
        color: series.color,
        xIntercepts,
        yIntercept,
        maxima,
        minima,
      };
    });
  }, [functionSeries]);

  const [pinnedMarkers, setPinnedMarkers] = useState<
    Array<{ kind: 'x' | 'y' | 'max' | 'min'; x: number; y: number; label: string }>
  >([]);

  const autoMarkers = useMemo(() => {
    const markers: Array<{ kind: 'x' | 'y' | 'max' | 'min'; x: number; y: number; label: string }> = [];
    autoInsights.forEach((insight) => {
      insight.xIntercepts.forEach((x) => {
        markers.push({
          kind: 'x',
          x,
          y: 0,
          label: insight.label,
        });
      });
      if (insight.yIntercept) {
        markers.push({
          kind: 'y',
          x: 0,
          y: insight.yIntercept.y,
          label: insight.label,
        });
      }
      insight.maxima.forEach((p) => {
        markers.push({
          kind: 'max',
          x: p.x,
          y: p.y,
          label: insight.label,
        });
      });
      insight.minima.forEach((p) => {
        markers.push({
          kind: 'min',
          x: p.x,
          y: p.y,
          label: insight.label,
        });
      });
    });
    return markers.slice(0, 12);
  }, [autoInsights]);

  const addPinnedMarker = (m: { kind: 'x' | 'y' | 'max' | 'min'; x: number; y: number; label: string }) => {
    setPinnedMarkers((prev) => {
      const exists = prev.some(
        (p) => p.kind === m.kind && Math.abs(p.x - m.x) < 1e-4 && Math.abs(p.y - m.y) < 1e-4,
      );
      if (exists) {
        return prev.filter(
          (p) => !(p.kind === m.kind && Math.abs(p.x - m.x) < 1e-4 && Math.abs(p.y - m.y) < 1e-4),
        );
      }
      return [...prev, m].slice(-12);
    });
  };

  // 保存：overlay と描画設定を一括保存
  async function handleSave() {
    if (!userId) {
      // ★ 未ログインなら保存できない → ログイン画面へ
      router.push('/login?next=/graphs/new');
      return;
    }
  
    const overlay = parsedList
      .map((p, idx) => {
        if (!p) return null;
        const rawEq = equations[idx] ?? '';
        const eqParams = paramList[idx] ?? { a: 0, b: 0, c: 0 };

        return {
          kind: p.kind,
          label: p.label,
          original: rawEq,
          params: eqParams,
          conf: p.conf,
        };
      })
      .filter(Boolean);   
  
    const d0 = domains[0] ?? DEFAULT_DOMAIN;
  
    const payload = {
      author_id: userId,
      title,
      type: 'series' as const,
      config: {
        overlay,
        render: {
          xMin: d0.xMin,
          xMax: d0.xMax,
          yMin,
          yMax,
          step: d0.step,
          nx,
          ny,
          xLabel,
          yLabel,
          colors,
        },
      },
    };
  
    const { data, error } = await supabaseBrowser
      .from('graphs')
      .insert(payload)
      .select('id')
      .single();
  
    if (error) {
      console.error(error);
      setToast({ message: '保存に失敗しました', type: 'error' });
      return;
    }
  
    const id = data!.id;
    setToast({ message: `保存しました。埋め込み: [graph:id=${id}]`, type: 'success' });
    router.push(`/graphs/${id}`);
  }  

  const ineqFillEq = useMemo(() => {
    if (
      chartSizeEq.width <= 0 ||
      chartSizeEq.height <= 0 ||
      plotBoxEq.width <= 0 ||
      plotBoxEq.height <= 0
    ) {
      return null;
    }
  
    const elements: JSX.Element[] = [];
  
    parsedList.forEach((p, idx) => {
      if (!p) return;
  
      const color = colors[idx] ?? PALETTE[idx % PALETTE.length];
      const { Fexpr } = p.conf as any;
      let cmpRaw = (p.conf as any).cmp as string | undefined;
  
      const cmpNorm: 'ge' | 'le' =
        cmpRaw === 'le' || cmpRaw === 'lt' || cmpRaw === '<' ? 'le' : 'ge';
  
      const F = buildFunction2D(Fexpr, paramList[idx] ?? { a: 0, b: 0, c: 0 });
  
      const isInside = (val: number) => {
        if (!Number.isFinite(val)) return false;
        return cmpNorm === 'le' ? val <= 0 : val >= 0;
      };
  
      const dom = viewDomain ?? equalDomain;
      const domXMin = dom.xMin;
      const domXMax = dom.xMax;
      const domYMin = dom.yMin;
      const domYMax = dom.yMax;
  
      const xRange = Math.max(domXMax - domXMin, 1e-6);
      const yRange = Math.max(domYMax - domYMin, 1e-6);
  
      const xScale = (x: number) =>
        plotBoxEq.left + ((x - domXMin) / xRange) * plotBoxEq.width;
      const yScale = (y: number) =>
        plotBoxEq.top + (1 - (y - domYMin) / yRange) * plotBoxEq.height;
  
      const sampleNx = Math.min(
        Math.max(Math.floor(plotBoxEq.width), 60),
        300, // 少し減らして軽くする
      );
      const sampleNy = Math.min(
        Math.max(Math.floor(plotBoxEq.height), 60),
        300,
      );
  
      const dx = (domXMax - domXMin) / sampleNx;
      const dy = (domYMax - domYMin) / sampleNy;
  
      const rects: JSX.Element[] = [];
  
      for (let ix = 0; ix < sampleNx; ix++) {
        const x0 = domXMin + dx * ix;
        const x1 = x0 + dx;
  
        for (let iy = 0; iy < sampleNy; iy++) {
          const y0 = domYMin + dy * iy;
          const y1 = y0 + dy;
  
          const xc = (x0 + x1) * 0.5;
          const yc = (y0 + y1) * 0.5;
  
          let v: number;
          try {
            v = F(xc, yc);
          } catch {
            continue;
          }
          if (!isInside(v)) continue;
  
          const X0 = xScale(x0);
          const X1 = xScale(x1);
          const Y0 = yScale(y0);
          const Y1 = yScale(y1);
  
          rects.push(
            <rect
              key={`${idx}-${ix}-${iy}`}
              x={Math.min(X0, X1)}
              y={Math.min(Y0, Y1)}
              width={Math.abs(X1 - X0)}
              height={Math.abs(Y1 - Y0)}
              fill={color}
              fillOpacity={0.15}
            />,
          );
        }
      }
  
      if (rects.length > 0) {
        elements.push(
          <Fragment key={`ineq2d-fill-eq-${idx}`}>{rects}</Fragment>,
        );
      }
    });
  
    if (!elements.length) return null;
  
    return (
      <>
        <defs>
          <clipPath id="ineq2d-clip-eq">
            <rect
              x={plotBoxEq.left}
              y={plotBoxEq.top}
              width={plotBoxEq.width}
              height={plotBoxEq.height}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#ineq2d-clip-eq)">{elements}</g>
      </>
    );
  }, [parsedList, paramList, colors, equalDomain, viewDomain, plotBoxEq, chartSizeEq]);  

  const ineqFillSeries = useMemo(() => {
    if (
      chartSizeSeries.width <= 0 ||
      chartSizeSeries.height <= 0 ||
      plotBoxSeries.width <= 0 ||
      plotBoxSeries.height <= 0
    ) {
      return null;
    }
  
    const elements: JSX.Element[] = [];
  
    parsedList.forEach((p, idx) => {
      if (!p) return;
  
      const color = colors[idx] ?? PALETTE[idx % PALETTE.length];
      const { Fexpr } = p.conf as any;
      let cmpRaw = (p.conf as any).cmp as string | undefined;
  
      const cmpNorm: 'ge' | 'le' =
        cmpRaw === 'le' || cmpRaw === 'lt' || cmpRaw === '<' ? 'le' : 'ge';
  
      const F = buildFunction2D(Fexpr, paramList[idx] ?? { a: 0, b: 0, c: 0 });
  
      const isInside = (val: number) => {
        if (!Number.isFinite(val)) return false;
        return cmpNorm === 'le' ? val <= 0 : val >= 0;
      };
  
      const dom = viewDomain ?? equalDomain;
      const domXMin = dom.xMin;
      const domXMax = dom.xMax;
      const domYMin = dom.yMin;
      const domYMax = dom.yMax;
  
      const xRange = Math.max(domXMax - domXMin, 1e-6);
      const yRange = Math.max(domYMax - domYMin, 1e-6);
  
      const xScale = (x: number) =>
        plotBoxSeries.left + ((x - domXMin) / xRange) * plotBoxSeries.width;
      const yScale = (y: number) =>
        plotBoxSeries.top +
        (1 - (y - domYMin) / yRange) * plotBoxSeries.height;
  
      const sampleNx = Math.min(
        Math.max(Math.floor(plotBoxSeries.width), 60),
        300,
      );
      const sampleNy = Math.min(
        Math.max(Math.floor(plotBoxSeries.height), 60),
        300,
      );
  
      const dx = (domXMax - domXMin) / sampleNx;
      const dy = (domYMax - domYMin) / sampleNy;
  
      const rects: JSX.Element[] = [];
  
      for (let ix = 0; ix < sampleNx; ix++) {
        const x0 = domXMin + dx * ix;
        const x1 = x0 + dx;
  
        for (let iy = 0; iy < sampleNy; iy++) {
          const y0 = domYMin + dy * iy;
          const y1 = y0 + dy;
  
          const xc = (x0 + x1) * 0.5;
          const yc = (y0 + y1) * 0.5;
  
          let v: number;
          try {
            v = F(xc, yc);
          } catch {
            continue;
          }
          if (!isInside(v)) continue;
  
          const X0 = xScale(x0);
          const X1 = xScale(x1);
          const Y0 = yScale(y0);
          const Y1 = yScale(y1);
  
          rects.push(
            <rect
              key={`${idx}-${ix}-${iy}`}
              x={Math.min(X0, X1)}
              y={Math.min(Y0, Y1)}
              width={Math.abs(X1 - X0)}
              height={Math.abs(Y1 - Y0)}
              fill={color}
              fillOpacity={0.15}
            />,
          );
        }
      }
  
      if (rects.length > 0) {
        elements.push(
          <Fragment key={`ineq2d-fill-series-${idx}`}>{rects}</Fragment>,
        );
      }
    });
  
    if (!elements.length) return null;
  
    return (
      <>
        <defs>
          <clipPath id="ineq2d-clip-series">
            <rect
              x={plotBoxSeries.left}
              y={plotBoxSeries.top}
              width={plotBoxSeries.width}
              height={plotBoxSeries.height}
            />
          </clipPath>
        </defs>
        <g clipPath="url(#ineq2d-clip-series)">{elements}</g>
      </>
    );
  }, [parsedList, paramList, colors, equalDomain, viewDomain, plotBoxSeries, chartSizeSeries]);  

  // CSV → series（seriesタブ用）
  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const groups = new Map<string, Array<[number, number]>>();
    for (const line of lines) {
      const [name, xs, ys] = line.split(',').map((s) => s.trim());
      const x = Number(xs);
      const y = Number(ys);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name)!.push([x, y]);
    }
    const series = Array.from(groups.entries()).map(([name, data]) => ({
      name,
      data,
    }));
    setSConf((prev) => ({ ...prev, series }));
  }

  function clearDraft() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(DRAFT_KEY);
      setToast({ message: 'ローカル下書きを削除しました', type: 'success' });
    } catch (e) {
      console.error('failed to clear GraphStudio draft', e);
    }
  }  

  // 入力欄を追加・削除・更新
  function addEquation() {
    const newIndex = equations.length; // 追加されるインデックス
  
    setEquations((prev) => [...prev, 'y=']);
  
    setColors((prev) => {
      const nextColor =
        PALETTE[prev.length % PALETTE.length];
      return [...prev, nextColor];
    });
  
    setDomains((prev) => [...prev, { ...DEFAULT_DOMAIN }]);
    setParamList((prev) => [...prev, { a: 1, b: 1, c: 0 }]);
    setEnabledList((prev) => [...prev, true]);
  
    // SP の場合は即座に「式を編集」パネル＋専用入力パネルを開く
    if (isMobile) {
      setTab('equation');
      setIsPanelOpen(true);
      setActiveEqIndex(newIndex);
      setIsEqInputOpen(true);
    }
  }  
  
  function removeEquation(idx: number) {
    // 入力用の状態（equations / colors / domains / paramList）を揃えて削除
    setEquations((prev) => prev.filter((_, i) => i !== idx));
    setColors((prev) => prev.filter((_, i) => i !== idx));
    setDomains((prev) => prev.filter((_, i) => i !== idx));
    setParamList((prev) => prev.filter((_, i) => i !== idx));
    setEnabledList((prev) => prev.filter((_, i) => i !== idx));
  
    // すでに描画済み（parsedList に反映済み）の式があれば、その分も削除しておく
    setParsedList((prev) =>
      idx < prev.length ? prev.filter((_, i) => i !== idx) : prev,
    );
    setLegendSnapshot((prev) =>
      idx < prev.length ? prev.filter((_, i) => i !== idx) : prev,
    );
  }  
  function updateEquation(idx: number, val: string) {
    setEquations((prev) => prev.map((v, i) => (i === idx ? val : v)));
  }

  function moveEquation(idx: number, dir: 'up' | 'down') {
    const next = idx + (dir === 'up' ? -1 : 1);
    if (next < 0 || next >= equations.length) return;
    const swap = <T,>(arr: T[]) => {
      const copy = [...arr];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    };
    setEquations((prev) => swap(prev));
    setColors((prev) => swap(prev));
    setDomains((prev) => swap(prev));
    setParamList((prev) => swap(prev));
    setEnabledList((prev) => swap(prev));
  }
  function updateColor(idx: number, val: string) {
    setColors((prev) => prev.map((c, i) => (i === idx ? val : c)));
  }
  function updateDomain(idx: number, patch: Partial<Domain1D>) {
    setDomains((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)),
    );
  }

  const activeChartRef =
    tab === 'equation'
      ? equationChartRef
      : tab === 'series'
      ? seriesChartRef
      : bivarChartRef;

  // === プロット領域の実測 ===

  // 式タブ用
  useEffect(() => {
    const root = equationChartRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => {
      const rootRect = root.getBoundingClientRect();
      const grid = root.querySelector(
        '.recharts-cartesian-grid',
      ) as SVGElement | null;
      if (!grid) return;
      const gridRect = grid.getBoundingClientRect();
      setChartSizeEq({
        width: rootRect.width,
        height: rootRect.height,
      });
      setPlotBoxEq({
        left: gridRect.left - rootRect.left,
        top: gridRect.top - rootRect.top,
        width: gridRect.width,
        height: gridRect.height,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [drawVersion, equalDomain, viewDomain, xTicks, yTicks]);

  // seriesタブ用
  useEffect(() => {
    const root = seriesChartRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => {
      const rootRect = root.getBoundingClientRect();
      const grid = root.querySelector(
        '.recharts-cartesian-grid',
      ) as SVGElement | null;
      if (!grid) return;
      const gridRect = grid.getBoundingClientRect();
      setChartSizeSeries({
        width: rootRect.width,
        height: rootRect.height,
      });
      setPlotBoxSeries({
        left: gridRect.left - rootRect.left,
        top: gridRect.top - rootRect.top,
        width: gridRect.width,
        height: gridRect.height,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [drawVersion, equalDomain, viewDomain, xTicks, yTicks]);

  // bivarタブ用（等高線）
  useEffect(() => {
    if (tab !== 'bivar') return;
    const root = bivarChartRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      setChartSizeBivar({
        width: rect.width,
        height: rect.height,
      });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(() => measure());
    obs.observe(root);
    return () => obs.disconnect();
  }, [tab]);

  // ==== 式入力パネル（PCとSP共通で使う） ====
  const equationInputPanel = (
    <>
      {/* 入力パネル（タイトル + ボタン） */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-600">タイトル</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700">式（1行=1式）</div>
            <div className="text-[11px] text-slate-500">
              例：y = x**2 / r = 1 + 2*cos(x) / param: x = cos(t); y = sin(t)
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={addEquation}
            >
              ＋ 式を追加
            </button>
            <button
              className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-60"
              onClick={() => setDrawVersion((v) => v + 1)}
              disabled={isDrawing}
            >
              {isDrawing ? 'グラフ作成中…' : 'グラフ作成'}
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              onClick={() => {
                setIsUserViewport(false);
                setViewDomain(equalDomain);
              }}
            >
              自動スケール
            </button>
            <button
              className={`rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition ${
                showAutoMarkers
                  ? 'border-slate-300 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() => setShowAutoMarkers((prev) => !prev)}
            >
              {showAutoMarkers ? 'ラベル非表示' : 'ラベル表示'}
            </button>
            <button
              className={`rounded-full border px-3 py-2 text-xs font-medium shadow-sm transition ${
                fillConfig.enabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              onClick={() =>
                setFillConfig((prev) => ({ ...prev, enabled: !prev.enabled }))
              }
            >
              面積塗りつぶし{fillConfig.enabled ? '（ON）' : ''}
            </button>
          </div>
        </div>
      </div>
      {fillConfig.enabled ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
          {functionSeries.length < 2 ? (
            <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              面積塗りつぶしは「関数（y=...）」が2本以上あるときに有効です。
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500">対象</span>
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
              value={fillConfig.idxA}
              onChange={(e) =>
                setFillConfig((prev) => ({
                  ...prev,
                  idxA: Number(e.target.value),
                }))
              }
            >
              {functionSeries.map((s, idx) => (
                <option key={`${s.label}-a-${idx}`} value={idx}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">と</span>
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
              value={fillConfig.idxB}
              onChange={(e) =>
                setFillConfig((prev) => ({
                  ...prev,
                  idxB: Number(e.target.value),
                }))
              }
            >
              {functionSeries.map((s, idx) => (
                <option key={`${s.label}-b-${idx}`} value={idx}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">の間</span>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-[10px] text-slate-400">x最小</label>
              <input
                type="text"
                inputMode="decimal"
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                value={fillConfig.xMin}
                onChange={(e) =>
                  setFillConfig((prev) => ({ ...prev, xMin: e.target.value }))
                }
                placeholder="任意"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400">x最大</label>
              <input
                type="text"
                inputMode="decimal"
                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                value={fillConfig.xMax}
                onChange={(e) =>
                  setFillConfig((prev) => ({ ...prev, xMax: e.target.value }))
                }
                placeholder="任意"
              />
            </div>
          </div>
          {fillBetweenIntersections.length ? (
            <div className="mt-2 text-[11px] text-slate-500">
              交点:{" "}
              {fillBetweenIntersections.map((p, i) => (
                <span key={i} className="mr-1">
                  <InlineKatex tex={`(${formatNumber(p.x)},${formatNumber(p.y)})`} />
                </span>
              ))}
            </div>
          ) : null}
          {fillBetweenArea !== null ? (
            <div className="mt-1 text-[11px] text-slate-500">
              近似面積: <InlineKatex tex={`${formatNumber(fillBetweenArea)}`} />
            </div>
          ) : null}
        </div>
      ) : null}
  
      {/* 複数式の行 */}
      <div className="space-y-4">
        {equations.map((eq, i) => {
          const d = domains[i] ?? DEFAULT_DOMAIN;
          const param = paramList[i] ?? { a: 1, b: 1, c: 0 };
          const usedParams = getUsedParams(eq);
          const range = estimateParamRange(eq);

          return (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: colors[i] ?? PALETTE[i % PALETTE.length] }} />
                  <span>凡例</span>
                </div>
                <input
                  value={legendNames[i] ?? ''}
                  onChange={(e) =>
                    setLegendNames((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v)),
                    )
                  }
                  className="w-36 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 shadow-sm"
                  placeholder={`式 ${i + 1}`}
                />
              </div>
              {/* 上段：PC と SP で表示を分岐 */}
              {!isMobile ? (
                // ── PC: これまで通り SmartMathInput を行内に直接置く ──
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-8">
                    <SmartMathInput
                      value={eq}
                      onChange={(v) => updateEquation(i, v)}
                      label={`式 ${i + 1}`}
                      description="y = ..., x**2 + y**2 = 1, param: ... など"
                      placeholder="y = 3*x / r = 1 + 2*cos(x) / param: x = cos(t); y = sin(t)"
                      error={equationErrors[i]}
                      showPreview={true}
                      size="md"
                    />
                  </div>
                  <div className="col-span-2 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">色</span>
                    <input
                      type="color"
                      value={colors[i] ?? PALETTE[i % PALETTE.length]}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="h-9 w-9 rounded-lg border border-slate-200 bg-white"
                    />
                    <label className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500">
                      <input
                        type="checkbox"
                        className="h-3 w-3 accent-slate-700"
                        checked={enabledList[i] ?? true}
                        onChange={(e) =>
                          setEnabledList((prev) =>
                            prev.map((v, idx) => (idx === i ? e.target.checked : v)),
                          )
                        }
                      />
                      表示
                    </label>
                  </div>
                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 shadow-sm disabled:opacity-40"
                        onClick={() => moveEquation(i, 'up')}
                        disabled={i === 0}
                      >
                        ↑
                      </button>
                      <button
                        className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600 shadow-sm disabled:opacity-40"
                        onClick={() => moveEquation(i, 'down')}
                        disabled={i === equations.length - 1}
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm transition hover:bg-slate-50"
                      onClick={() => removeEquation(i)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                // ── SP: プレビュー + 色 + 削除 + 「編集」ボタンだけ ──
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    {/* プレビュー全体をタップすると編集モードを開く */}
                    <button
                      type="button"
                      className="
                        flex-1 min-w-0 text-left
                        rounded-xl px-3 py-2
                        border border-slate-200 bg-white
                        shadow-sm
                        hover:border-slate-300 hover:bg-slate-50
                        focus:ring-2 focus:ring-slate-300/60
                        cursor-pointer
                        transition
                      "
                      onClick={() => {
                        setActiveEqIndex(i);
                        setIsEqInputOpen((prev) => (activeEqIndex === i ? !prev : true));
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs text-slate-500 mb-0.5">
                            式 {i + 1}
                          </div>
                          <div className="text-sm text-slate-800 truncate">
                            <InlineKatex tex={toDisplayTex(eq)} />
                          </div>
                        </div>

                        {/* ペンアイコン風の丸いボタン（実際には装飾） */}
                        <div className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 bg-slate-50">
                          編集
                        </div>
                      </div>

                      {equationErrors[i] && (
                        <div className="mt-0.5 text-[11px] text-rose-600">
                          {equationErrors[i]}
                        </div>
                      )}

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        タップして数式を編集
                      </div>
                    </button>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 shadow-sm disabled:opacity-40"
                          onClick={() => moveEquation(i, 'up')}
                          disabled={i === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 shadow-sm disabled:opacity-40"
                          onClick={() => moveEquation(i, 'down')}
                          disabled={i === equations.length - 1}
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-500">色</span>
                        <input
                          type="color"
                          value={colors[i] ?? PALETTE[i % PALETTE.length]}
                          onChange={(e) => updateColor(i, e.target.value)}
                          className="h-7 w-7 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <label className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        <input
                          type="checkbox"
                          className="h-3 w-3 accent-slate-700"
                          checked={enabledList[i] ?? true}
                          onChange={(e) =>
                            setEnabledList((prev) =>
                              prev.map((v, idx) => (idx === i ? e.target.checked : v)),
                            )
                          }
                        />
                        表示
                      </label>
                      <div className="flex">
                        <button
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 shadow-sm"
                          onClick={() => removeEquation(i)}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeEqIndex === i && isEqInputOpen ? (
                <div className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-2">
                  <SmartMathInput
                    value={equations[activeEqIndex] ?? ""}
                    onChange={(v) => updateEquation(activeEqIndex, v)}
                    label=""
                    description="sin, cos, log, sqrt などの関数が使えます"
                    size="sm"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 shadow-sm"
                      onClick={() => setIsEqInputOpen(false)}
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              ) : null}

              {/* ── 以下は PC / SP 共通：定義域・パラメータ ── */}
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold">
                    定義域（関数なら x、極座標 / param なら t）
                  </span>
                  <p>
                    param や r= の式では、ここで指定した範囲がパラメータt / θ の範囲として使われます。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-[11px] text-slate-500">最小</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={domainDrafts[i]?.xMin ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDomainDrafts((prev) => {
                          const next = [...prev];
                          next[i] = { ...(next[i] ?? {}), xMin: raw };
                          return next;
                        });
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          updateDomain(i, { xMin: parsed });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">最大</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={domainDrafts[i]?.xMax ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDomainDrafts((prev) => {
                          const next = [...prev];
                          next[i] = { ...(next[i] ?? {}), xMax: raw };
                          return next;
                        });
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          updateDomain(i, { xMax: parsed });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">step</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={domainDrafts[i]?.step ?? ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDomainDrafts((prev) => {
                          const next = [...prev];
                          next[i] = { ...(next[i] ?? {}), step: raw };
                          return next;
                        });
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          updateDomain(i, { step: parsed });
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2 mt-2">
                  <span className="font-semibold text-slate-700">パラメータ a, b, c</span>
                  {usedParams.a || usedParams.b || usedParams.c ? (
                    <>
                    <div className="grid gap-2">
                      {(["a", "b", "c"] as const).map((key) => {
                        if (!usedParams[key]) return null;
                        const value = param[key];
                        const draft = paramDrafts[i]?.[key];
                        const displayValue = draft ?? '';
                        return (
                          <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">{key}</span>
                              <input
                                type="text"
                                inputMode="decimal"
                                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                                value={displayValue}
                                onFocus={() => {
                                  if (
                                    value === 0 &&
                                    (paramDrafts[i]?.[key] === undefined ||
                                      paramDrafts[i]?.[key] === '0')
                                  ) {
                                    setParamDrafts((prev) => {
                                      const next = [...prev];
                                      next[i] = { ...(next[i] ?? {}), [key]: '' };
                                      return next;
                                    });
                                  }
                                }}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setParamDrafts((prev) => {
                                    const next = [...prev];
                                    next[i] = { ...(next[i] ?? {}), [key]: raw };
                                    return next;
                                  });
                                  const parsed = Number(raw);
                                  if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                                    setParamList((prev) =>
                                      prev.map((p, idx) =>
                                        idx === i ? { ...p, [key]: parsed } : p,
                                      ),
                                    );
                                  }
                                }}
                              />
                            </div>
                            <input
                              type="range"
                              min={-range}
                              max={range}
                              step={0.1}
                              value={value}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setParamList((prev) =>
                                  prev.map((p, idx) =>
                                    idx === i ? { ...p, [key]: v } : p,
                                  ),
                                );
                                setParamDrafts((prev) => {
                                  const next = [...prev];
                                  next[i] = { ...(next[i] ?? {}), [key]: String(v) };
                                  return next;
                                });
                              }}
                              className="mt-2 w-full accent-slate-700"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end">
                      <button
                        className={`rounded-full border px-3 py-1.5 text-[11px] shadow-sm transition ${
                          paramAuto[i]
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                        onClick={() =>
                          setParamAuto((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                      >
                        {paramAuto[i] ? '停止' : '再生'}
                      </button>
                    </div>
                    </>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-500">
                      a, b, c を式に含めるとスライダーが自動で表示されます。
                    </div>
                  )}
                  {usedParams.a || usedParams.b || usedParams.c ? (
                    <div className="mt-2 grid gap-2 rounded-xl border border-slate-200 bg-white p-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">再生速度</span>
                        <input
                          type="range"
                          min={0.1}
                          max={1.5}
                          step={0.05}
                          value={paramAutoConfig[i]?.speed ?? 0.35}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setParamAutoConfig((prev) => ({
                              ...prev,
                              [i]: {
                                speed: v,
                                range: prev[i]?.range ?? estimateParamRange(eq),
                              },
                            }));
                          }}
                          className="w-32 accent-slate-700"
                        />
                        <span className="text-[11px] text-slate-400">
                          {formatNumber((paramAutoConfig[i]?.speed ?? 0.35) * 100)}%
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">再生範囲</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                          value={
                            paramAutoConfig[i]?.range !== undefined
                              ? String(paramAutoConfig[i]?.range)
                              : ''
                          }
                          placeholder={String(estimateParamRange(eq))}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const parsed = Number(raw);
                            setParamAutoConfig((prev) => ({
                              ...prev,
                              [i]: {
                                speed: prev[i]?.speed ?? 0.35,
                                range: Number.isFinite(parsed) ? parsed : prev[i]?.range ?? estimateParamRange(eq),
                              },
                            }));
                          }}
                        />
                        <span className="text-[11px] text-slate-400">
                          目安 {estimateParamRange(eq)}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

  
      {/* 軸ラベル */}
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-500">X軸ラベル</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
            value={xLabel}
            onChange={(e) => setXLabel(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Y軸ラベル</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
            value={yLabel}
            onChange={(e) => setYLabel(e.target.value)}
          />
        </div>
      </div>

      {/* 陰関数グリッド範囲（詳細設定） */}
      <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <summary className="text-xs font-semibold text-slate-700 cursor-pointer">
          陰関数の詳細設定（グリッド範囲）
        </summary>
        <div className="mt-2 grid md:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-xs text-slate-500">yMin</label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              value={gridDraft.yMin}
              onChange={(e) => {
                const raw = e.target.value;
                setGridDraft((prev) => ({ ...prev, yMin: raw }));
                const parsed = Number(raw);
                if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                  setYMin(parsed);
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">yMax</label>
            <input
              type="text"
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              value={gridDraft.yMax}
              onChange={(e) => {
                const raw = e.target.value;
                setGridDraft((prev) => ({ ...prev, yMax: raw }));
                const parsed = Number(raw);
                if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                  setYMax(parsed);
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">nx（x方向分割数）</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              value={gridDraft.nx}
              onChange={(e) => {
                const raw = e.target.value;
                setGridDraft((prev) => ({ ...prev, nx: raw }));
                const parsed = Number(raw);
                if (Number.isFinite(parsed) && raw !== '') {
                  setNx(Math.max(10, parsed));
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500">ny（y方向分割数）</label>
            <input
              type="text"
              inputMode="numeric"
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
              value={gridDraft.ny}
              onChange={(e) => {
                const raw = e.target.value;
                setGridDraft((prev) => ({ ...prev, ny: raw }));
                const parsed = Number(raw);
                if (Number.isFinite(parsed) && raw !== '') {
                  setNy(Math.max(10, parsed));
                }
              }}
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          これらは <code>x**2 + y**2 = 1</code> などの陰関数を描くときに使われる
          グリッド範囲です。通常の y=f(x)、r=f(θ)、param には影響しません。
        </p>
      </details>
    </>
  );

  // ==== 式タブのグラフビュー（PC/SP共通） ====
  const equationChartView = (
    <div
      ref={(node) => {
        equationChartRef.current = node;
        chartWrapRef.current = node;
      }}
      className="
        relative w-full max-w-full
        aspect-square                /* SP：常に正方形 */
        md:aspect-square md:h-auto  /* PC：常に正方形 */
        transform
        -translate-x-2    /* SP のときだけ少し左にズラす */
        md:translate-x-0  /* PC では補正しない */
        touch-none
      "
      onPointerEnter={() => setIsChartHover(true)}
      onPointerLeave={() => {
        setIsChartHover(false);
        panState.current = null;
      }}
      onWheel={(e) => {
        if (!isInsidePlot(e)) return;
        if (!chartWrapRef.current) return;
        e.preventDefault();
        const domain = viewDomain ?? equalDomain;
        const rect = chartWrapRef.current.getBoundingClientRect();
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;
        const x = domain.xMin + fx * (domain.xMax - domain.xMin);
        const y = domain.yMax - fy * (domain.yMax - domain.yMin);
        const zoom = e.deltaY > 0 ? 1.12 : 0.88;
        const nextRangeX = (domain.xMax - domain.xMin) * zoom;
        const nextRangeY = (domain.yMax - domain.yMin) * zoom;
        const nextXMin = x - fx * nextRangeX;
        const nextXMax = nextXMin + nextRangeX;
        const nextYMax = y + fy * nextRangeY;
        const nextYMin = nextYMax - nextRangeY;
        setViewDomain({
          xMin: nextXMin,
          xMax: nextXMax,
          yMin: nextYMin,
          yMax: nextYMax,
        });
        setIsUserViewport(true);
      }}
      onPointerDown={(e) => {
        if (!chartWrapRef.current) return;
        if (!isInsidePlot(e)) return;
        setIsChartHover(true);
        const domain = viewDomain ?? equalDomain;
        panState.current = {
          x: e.clientX,
          y: e.clientY,
          domain,
        };
        chartWrapRef.current.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isChartHover || !chartWrapRef.current || !panState.current) return;
        const rect = chartWrapRef.current.getBoundingClientRect();
        const dx = e.clientX - panState.current.x;
        const dy = e.clientY - panState.current.y;
        const base = panState.current.domain;
        const rangeX = base.xMax - base.xMin;
        const rangeY = base.yMax - base.yMin;
        const shiftX = (dx / rect.width) * rangeX;
        const shiftY = (dy / rect.height) * rangeY;
        setViewDomain({
          xMin: base.xMin - shiftX,
          xMax: base.xMax - shiftX,
          yMin: base.yMin + shiftY,
          yMax: base.yMax + shiftY,
        });
        setIsUserViewport(true);
      }}
      onPointerUp={(e) => {
        panState.current = null;
        chartWrapRef.current?.releasePointerCapture(e.pointerId);
      }}
    >
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2">
        {isUserViewport ? (
          <button
            className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] text-slate-600 shadow-sm"
            onClick={() => {
              setIsUserViewport(false);
              setViewDomain(equalDomain);
            }}
          >
            表示リセット
          </button>
        ) : null}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={chartMargin}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[
              (viewDomain ?? equalDomain).xMin,
              (viewDomain ?? equalDomain).xMax,
            ]}
            ticks={xTicks}
            label={
              isMobile
                ? { value: xLabel, position: 'insideBottom', offset: -5, style: { fontSize: 10 } }
                : { value: xLabel, position: 'insideBottom', offset: -5 }
            }
            tick={
              isMobile
                ? { fill: '#6b7280', fontSize: 10 }
                : { fill: '#374151', fontSize: 12 }
            }
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={{ stroke: '#9ca3af' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[
              (viewDomain ?? equalDomain).yMin,
              (viewDomain ?? equalDomain).yMax,
            ]}
            ticks={yTicks}
            label={
              isMobile
                ? {
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    style: { fontSize: 10 },
                  }
                : {
                    value: yLabel,
                    angle: -90,
                    position: 'insideLeft',
                  }
            }
            tick={
              isMobile
                ? { fill: '#6b7280', fontSize: 10 }
                : { fill: '#374151', fontSize: 12 }
            }
            // ★ SP ではY軸に割く横幅をかなり小さく固定
            width={isMobile ? 32 : 48}
            axisLine={{ stroke: '#9ca3af' }}
            tickLine={{ stroke: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              fontSize: 12,
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
            }}
          />
          {previewSeriesList.map((s, i) => {
            const kind = parsedList[i]?.kind;
            const color =
              colors[i] ?? PALETTE[i % PALETTE.length];
  
            const isIneq1d = kind === 'ineq1d';
            const isIneq2d = kind === 'ineq2d';
            const op = isIneq1d
              ? (parsedList[i] as any).conf?.op
              : null;
  
            const baseForIneq1d =
              isIneq1d && op
                ? op === 'ge' || op === 'gt'
                  ? equalDomain.yMax
                  : equalDomain.yMin
                : undefined;
  
            return (
              <Fragment key={i}>
                {isIneq1d && baseForIneq1d !== undefined && (
                  <Area
                    data={s.points}
                    type="linear"
                    dataKey="y"
                    baseValue={baseForIneq1d}
                    stroke="none"
                    fill={color}
                    fillOpacity={0.15}
                    isAnimationActive={false}
                  />
                )}
  
                <Line
                  name={legendLabels[i] ?? s.name ?? `y${i}`}
                  data={s.points}
                  type="linear"
                  dataKey="y"
                  dot={false}
                  isAnimationActive={false}
                  stroke={color}
                  strokeDasharray={
                    isIneq1d
                      ? '6 4'
                      : isIneq2d
                      ? '4 4'
                      : undefined
                  }
                  strokeWidth={isIneq1d || isIneq2d ? 2 : 1}
                />
              </Fragment>
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
  
      {/* 2D 不等式塗りつぶしオーバーレイ */}
      <svg
        className="pointer-events-none absolute inset-0 z-10"
        width={chartSizeEq.width}
        height={chartSizeEq.height}
      >
        {ineqFillEq}
      </svg>
      {fillBetweenPathEq ? (
        <svg
          className="pointer-events-none absolute inset-0 z-[5]"
          width={chartSizeEq.width}
          height={chartSizeEq.height}
        >
          <defs>
            <clipPath id="fill-between-clip-eq">
              <rect
                x={plotBoxEq.left}
                y={plotBoxEq.top}
                width={plotBoxEq.width}
                height={plotBoxEq.height}
              />
            </clipPath>
          </defs>
          <path
            d={fillBetweenPathEq}
            clipPath="url(#fill-between-clip-eq)"
            fill="#38bdf8"
            fillOpacity={0.16}
            stroke="none"
          />
        </svg>
      ) : null}
      {showAutoMarkers && (autoMarkers.length || pinnedMarkers.length) ? (
        <svg
          className="absolute z-20"
          width={chartSizeEq.width}
          height={chartSizeEq.height}
          style={{ left: 0, top: 0 }}
        >
          <defs>
            <clipPath id="marker-clip-eq">
              <rect
                x={plotBoxEq.left}
                y={plotBoxEq.top}
                width={plotBoxEq.width}
                height={plotBoxEq.height}
              />
            </clipPath>
          </defs>
          <g clipPath="url(#marker-clip-eq)">
            {[...autoMarkers, ...pinnedMarkers].map((m, idx) => {
              const dom = viewDomain ?? equalDomain;
              const xRange = Math.max(dom.xMax - dom.xMin, 1e-6);
              const yRange = Math.max(dom.yMax - dom.yMin, 1e-6);
              const x = plotBoxEq.left + ((m.x - dom.xMin) / xRange) * plotBoxEq.width;
              const y = plotBoxEq.top + (1 - (m.y - dom.yMin) / yRange) * plotBoxEq.height;
              const label = `${m.label}: (${formatNumber(m.x)}, ${formatNumber(m.y)})`;
              const isPinned = pinnedMarkers.some(
                (p) => p.kind === m.kind && Math.abs(p.x - m.x) < 1e-4 && Math.abs(p.y - m.y) < 1e-4,
              );
              return (
                <g
                  key={`${m.kind}-${idx}-${m.x}`}
                  transform={`translate(${x},${y})`}
                  onClick={() => addPinnedMarker(m)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={3.5}
                    fill={isPinned ? '#111827' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                  <rect
                    x={6}
                    y={-10}
                    width={Math.min(160, label.length * 6.4)}
                    height={18}
                    rx={8}
                    fill="white"
                    opacity={0.9}
                    stroke="#e2e8f0"
                  />
                  <text
                    x={12}
                    y={3}
                    fontSize={10}
                    fill="#0f172a"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      ) : null}

      {/* ▼ Legend をチャートの外に出す */}
      <div className="mt-2 flex justify-center">
        <CustomLegend labels={legendLabels} colors={colors} />
      </div>
      {autoInsights.length ? (
        <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600 shadow-sm md:grid-cols-3">
          {autoInsights.map((insight, idx) => (
            <div key={`${insight.label}-${idx}`} className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: insight.color }}
                />
                {insight.label}
              </div>
              <div>
                x切片:{' '}
                {insight.xIntercepts.length ? (
                  insight.xIntercepts.map((x, i) => (
                    <span key={i} className="mr-1">
                      <InlineKatex tex={`(${formatNumber(x)},0)`} />
                    </span>
                  ))
                ) : (
                  'なし'
                )}
              </div>
              <div>
                y切片:{' '}
                {insight.yIntercept ? (
                  <InlineKatex
                    tex={`(0,${formatNumber(insight.yIntercept.y)})`}
                  />
                ) : (
                  'なし'
                )}
              </div>
              <div>
                極大:
                {insight.maxima.length ? (
                  insight.maxima.map((p, i) => (
                    <span key={i} className="ml-1">
                      <InlineKatex tex={`(${formatNumber(p.x)},${formatNumber(p.y)})`} />
                    </span>
                  ))
                ) : (
                  <span className="ml-1">なし</span>
                )}
              </div>
              <div>
                極小:
                {insight.minima.length ? (
                  insight.minima.map((p, i) => (
                    <span key={i} className="ml-1">
                      <InlineKatex tex={`(${formatNumber(p.x)},${formatNumber(p.y)})`} />
                    </span>
                  ))
                ) : (
                  <span className="ml-1">なし</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {pinnedMarkers.length ? (
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
            固定ラベル: {pinnedMarkers.length}
          </span>
          <button
            className="rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:bg-slate-50"
            onClick={() => setPinnedMarkers([])}
          >
            解除
          </button>
        </div>
      ) : null}
    </div>
  );



  // ========= JSX =========
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] text-slate-500">
            Graph Studio
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            グラフスタジオ
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            数式やデータを入力して、洗練されたグラフを描画・保存できます。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 md:text-sm"
            onClick={() => {
              if (historyIndex <= 0) return;
              const nextIndex = historyIndex - 1;
              const snap = history[nextIndex];
              if (snap) {
                setHistoryIndex(nextIndex);
                restoreSnapshot(snap);
              }
            }}
            disabled={historyIndex <= 0}
          >
            元に戻す
          </button>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 md:text-sm"
            onClick={() => {
              if (historyIndex >= history.length - 1) return;
              const nextIndex = historyIndex + 1;
              const snap = history[nextIndex];
              if (snap) {
                setHistoryIndex(nextIndex);
                restoreSnapshot(snap);
              }
            }}
            disabled={historyIndex >= history.length - 1}
          >
            やり直す
          </button>
          <ExportSvgButton
            targetRef={activeChartRef}
            filename={`${title || 'graph'}.svg`}
            onError={(message) => setToast({ message, type: 'error' })}
          />
          <ExportPngButton
            targetRef={activeChartRef}
            filename={`${title || 'graph'}.png`}
            onError={(message) => setToast({ message, type: 'error' })}
          />
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:text-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
                setToast({ message: '共有リンクをコピーしました', type: 'success' });
              } catch {
                setToast({ message: 'リンクのコピーに失敗しました', type: 'error' });
              }
            }}
          >
            共有リンク
          </button>
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:text-sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('g');
              router.replace(params.toString() ? `?${params.toString()}` : '?', {
                scroll: false,
              });
              setToast({ message: '共有状態をリセットしました', type: 'success' });
            }}
          >
            共有リセット
          </button>
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:text-sm"
            onClick={clearDraft}
          >
            下書き削除
          </button>
          <button
            className="rounded-full bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-black md:text-sm"
            onClick={handleSave}
          >
            保存{!userId ? '（ログインが必要）' : ''}
          </button>
        </div>
      </header>

      {toast ? (
        <div
          className={`rounded-lg border px-3 py-2 text-xs md:text-sm ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}

      {/* タブ */}
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
        <button
          className={`px-4 py-2 rounded-full text-xs md:text-sm transition ${
            tab === 'equation'
              ? 'bg-white text-slate-900 font-semibold shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('equation')}
        >
          式から描く
        </button>
        <button
          className={`px-4 py-2 rounded-full text-xs md:text-sm transition ${
            tab === 'series'
              ? 'bg-white text-slate-900 font-semibold shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('series')}
        >
          データから描く
        </button>
        <button
          className={`px-4 py-2 rounded-full text-xs md:text-sm transition ${
            tab === 'bivar'
              ? 'bg-white text-slate-900 font-semibold shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setTab('bivar')}
        >
          2変数関数
        </button>
      </div>

      {/* ── 式タブ ── */}
      {tab === 'equation' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
            <div className="hidden md:block">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {equationInputPanel}
              </div>
            </div>
            <div
              className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${
                isMobile && isPanelOpen ? "pb-[45vh]" : ""
              }`}
              style={
                isMobile && isPanelOpen
                  ? { paddingBottom: `${panelHeightVh}vh` }
                  : undefined
              }
            >
              {equationChartView}
            </div>
          </div>
          {isMobile ? (
            <div className="space-y-3">
              <button
                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-white text-sm font-medium shadow-sm active:scale-[0.98]"
                onClick={openEquationPanel}
              >
                式を編集する（入力パネルを開く）
              </button>
            </div>
          ) : null}

          {drawVersion > 0 && previewEmpty && (
            <div className="text-sm text-rose-600">
              描画できませんでした。式や範囲・解像度を見直してください。
            </div>
          )}
        </div>
      )}


      {/* ── データタブ ── */}
      {tab === 'series' && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700">
                CSVから読み込み（name,x,y）
              </label>
              <p className="mt-1 text-[11px] text-slate-500">
                例：A,0,1 / A,1,0.5 / B,0,0 / B,1,0.3
              </p>
              <textarea
                className="mt-2 h-32 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none transition focus:border-slate-400"
                placeholder={'A,0,1\nA,1,0.5\nB,0,0\nB,1,0.3'}
                onBlur={(e) => {
                  if (e.target.value.trim()) parseCsv(e.target.value);
                }}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div
                ref={seriesChartRef}
                className="
                  relative w-full max-w-full
                  aspect-square
                  md:aspect-square md:h-auto
                "
              >
                {isDrawing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20 text-sm">
                    計算中…
                  </div>
                )}
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <ComposedChart margin={chartMargin}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      domain={[equalDomain.xMin, equalDomain.xMax]}
                      ticks={xTicks}
                      label={{
                        value: xLabel,
                        position: 'insideBottom',
                        offset: -5,
                      }}
                      tick={{ fill: '#374151', fontSize: 12 }}
                      axisLine={{ stroke: '#9ca3af' }}
                      tickLine={{ stroke: '#9ca3af' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      domain={[equalDomain.yMin, equalDomain.yMax]}
                      ticks={yTicks}
                      label={{
                        value: yLabel,
                        angle: -90,
                        position: 'insideLeft',
                      }}
                      tick={{ fill: '#374151', fontSize: 12 }}
                      axisLine={{ stroke: '#9ca3af' }}
                      tickLine={{ stroke: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        fontSize: 12,
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      content={() => (
                        <CustomLegend
                          labels={legendLabels}
                          colors={colors}
                        />
                      )}
                      wrapperStyle={{ paddingTop: 4 }}
                    />

                    {previewSeriesList.map((s, i) => {
                      const kind = parsedList[i]?.kind;
                      const color =
                        colors[i] ?? PALETTE[i % PALETTE.length];

                      const isIneq1d = kind === 'ineq1d';
                      const isIneq2d = kind === 'ineq2d';
                      const op = isIneq1d
                        ? (parsedList[i] as any).conf?.op
                        : null;

                      const baseForIneq1d =
                        isIneq1d && op
                          ? op === 'ge' || op === 'gt'
                            ? equalDomain.yMax
                            : equalDomain.yMin
                          : undefined;

                      return (
                        <Fragment key={i}>
                          {isIneq1d && baseForIneq1d !== undefined && (
                            <Area
                              data={s.points}
                              type="linear"
                              dataKey="y"
                              baseValue={baseForIneq1d}
                              stroke="none"
                              fill={color}
                              fillOpacity={0.15}
                              isAnimationActive={false}
                            />
                          )}

                          <Line
                            name={legendLabels[i] ?? s.name ?? `y${i}`}
                            data={s.points}
                            type="linear"
                            dataKey="y"
                            dot={false}
                            isAnimationActive={false}
                            stroke={color}
                            strokeDasharray={
                              isIneq1d
                                ? '6 4'
                                : isIneq2d
                                ? '4 4'
                                : undefined
                            }
                            strokeWidth={isIneq1d || isIneq2d ? 2 : 1}
                          />
                        </Fragment>
                      );
                    })}
                  </ComposedChart>
                </ResponsiveContainer>

                {/* ▼ 2D不等式の塗りつぶしオーバーレイ（seriesタブ） */}
                <svg
                  className="absolute inset-0 pointer-events-none z-10"
                  width={chartSizeSeries.width}
                  height={chartSizeSeries.height}
                >
                  {ineqFillSeries}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2変数関数タブ（等高線） ── */}
      {tab === 'bivar' && (
        <div className="space-y-4 pb-24 md:pb-0">
          <div className="grid gap-4 lg:grid-cols-[360px,1fr]">
            <div className="hidden md:block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  2変数関数（z = f(x, y)）
                </label>
                <SmartMathInput
                  value={bivarExpr}
                  onChange={(v) => {
                    const trimmed = v.replace(/^z\\s*=/i, '').trim();
                    setBivarExpr(trimmed);
                  }}
                  label=""
                  description="x, y を使って z を表す式（例: x^2 + y^2）"
                  placeholder="x^2 + y^2"
                  size="sm"
                />
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">表示範囲</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500">x 最小</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarDomainDrafts.xMin}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarDomainDrafts((prev) => ({ ...prev, xMin: raw }));
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          setBivarDomain((prev) => ({ ...prev, xMin: parsed }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">x 最大</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarDomainDrafts.xMax}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarDomainDrafts((prev) => ({ ...prev, xMax: raw }));
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          setBivarDomain((prev) => ({ ...prev, xMax: parsed }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">y 最小</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarDomainDrafts.yMin}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarDomainDrafts((prev) => ({ ...prev, yMin: raw }));
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          setBivarDomain((prev) => ({ ...prev, yMin: parsed }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">y 最大</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarDomainDrafts.yMax}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarDomainDrafts((prev) => ({ ...prev, yMax: raw }));
                        const parsed = Number(raw);
                        if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                          setBivarDomain((prev) => ({ ...prev, yMax: parsed }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">グリッド解像度</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500">x 分割</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarGridDrafts.nx}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarGridDrafts((prev) => ({ ...prev, nx: raw }));
                        const parsed = Number(raw);
                        if (Number.isFinite(parsed) && raw !== '') {
                          setBivarGrid((prev) => ({ ...prev, nx: Math.max(10, parsed) }));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">y 分割</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                      value={bivarGridDrafts.ny}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setBivarGridDrafts((prev) => ({ ...prev, ny: raw }));
                        const parsed = Number(raw);
                        if (Number.isFinite(parsed) && raw !== '') {
                          setBivarGrid((prev) => ({ ...prev, ny: Math.max(10, parsed) }));
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">等高線レベル</div>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                  value={bivarLevels}
                  placeholder="例: -4,-2,0,2,4（空なら自動）"
                  onChange={(e) => setBivarLevels(e.target.value)}
                />
                <p className="text-[11px] text-slate-500">
                  空欄の場合は自動でレベルを作成します。
                </p>
                <div className="mt-2">
                  <label className="block text-[11px] text-slate-500">レベルオフセット</label>
                  <div className="flex items-center gap-2">
                    <div
                      ref={bivarShiftTrackRef}
                      className="relative h-7 w-full cursor-pointer touch-none"
                      onPointerDown={(e) => {
                        const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        bivarShiftDragRef.current = true;
                        setIsBivarDragging(true);
                        const ratio = (e.clientX - rect.left) / rect.width;
                        const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                        setBivarLevelShiftLive(Number(next.toFixed(2)));
                        (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        if (!bivarShiftDragRef.current) return;
                        const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        const now = e.timeStamp ?? performance.now();
                        if (now - bivarShiftLastTsRef.current < 16) return;
                        bivarShiftLastTsRef.current = now;
                        const ratio = (e.clientX - rect.left) / rect.width;
                        const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                        const nextValue = Number(next.toFixed(2));
                        bivarShiftNextRef.current = nextValue;
                        if (bivarGridRef.current.nx > 24 || bivarGridRef.current.ny > 24) {
                          setBivarGrid({ nx: 24, ny: 24 });
                          setBivarGridDrafts({ nx: '24', ny: '24' });
                        }
                        if (bivarShiftRafRef.current == null) {
                          bivarShiftRafRef.current = window.requestAnimationFrame(() => {
                            bivarShiftRafRef.current = null;
                            if (bivarShiftNextRef.current != null) {
                              setBivarLevelShiftLive(bivarShiftNextRef.current);
                            }
                          });
                        }
                        if (bivarShiftCommitRef.current != null) {
                          window.clearTimeout(bivarShiftCommitRef.current);
                        }
                        bivarShiftCommitRef.current = window.setTimeout(() => {
                          if (bivarShiftNextRef.current != null) {
                            setBivarLevelShift(bivarShiftNextRef.current);
                          }
                        }, 120);
                      }}
                      onTouchStart={(e) => {
                        const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        bivarShiftDragRef.current = true;
                        setIsBivarDragging(true);
                        const touch = e.touches[0];
                        if (!touch) return;
                        const ratio = (touch.clientX - rect.left) / rect.width;
                        const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                        setBivarLevelShiftLive(Number(next.toFixed(2)));
                        e.preventDefault();
                      }}
                      onTouchMove={(e) => {
                        if (!bivarShiftDragRef.current) return;
                        const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        const now = e.timeStamp ?? performance.now();
                        if (now - bivarShiftLastTsRef.current < 16) return;
                        bivarShiftLastTsRef.current = now;
                        const touch = e.touches[0];
                        if (!touch) return;
                        const ratio = (touch.clientX - rect.left) / rect.width;
                        const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                        const nextValue = Number(next.toFixed(2));
                        bivarShiftNextRef.current = nextValue;
                        if (bivarGridRef.current.nx > 24 || bivarGridRef.current.ny > 24) {
                          setBivarGrid({ nx: 24, ny: 24 });
                          setBivarGridDrafts({ nx: '24', ny: '24' });
                        }
                        if (bivarShiftRafRef.current == null) {
                          bivarShiftRafRef.current = window.requestAnimationFrame(() => {
                            bivarShiftRafRef.current = null;
                            if (bivarShiftNextRef.current != null) {
                              setBivarLevelShiftLive(bivarShiftNextRef.current);
                            }
                          });
                        }
                        if (bivarShiftCommitRef.current != null) {
                          window.clearTimeout(bivarShiftCommitRef.current);
                        }
                        bivarShiftCommitRef.current = window.setTimeout(() => {
                          if (bivarShiftNextRef.current != null) {
                            setBivarLevelShift(bivarShiftNextRef.current);
                          }
                        }, 120);
                        e.preventDefault();
                      }}
                      onTouchEnd={() => {
                        bivarShiftDragRef.current = false;
                        setIsBivarDragging(false);
                        setBivarLevelShift(bivarShiftNextRef.current ?? bivarLevelShiftLive);
                        const restoreGrid = bivarGridRef.current;
                        const restoreDraft = bivarGridDraftRef.current;
                        if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                          setBivarGrid(restoreGrid);
                          if (restoreDraft) setBivarGridDrafts(restoreDraft);
                        }
                        if (bivarShiftRafRef.current != null) {
                          window.cancelAnimationFrame(bivarShiftRafRef.current);
                          bivarShiftRafRef.current = null;
                        }
                        if (bivarShiftCommitRef.current != null) {
                          window.clearTimeout(bivarShiftCommitRef.current);
                          bivarShiftCommitRef.current = null;
                        }
                      }}
                      onPointerUp={(e) => {
                        bivarShiftDragRef.current = false;
                        setIsBivarDragging(false);
                        setBivarLevelShift(bivarShiftNextRef.current ?? bivarLevelShiftLive);
                        const restoreGrid = bivarGridRef.current;
                        const restoreDraft = bivarGridDraftRef.current;
                        if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                          setBivarGrid(restoreGrid);
                          if (restoreDraft) setBivarGridDrafts(restoreDraft);
                        }
                        if (bivarShiftRafRef.current != null) {
                          window.cancelAnimationFrame(bivarShiftRafRef.current);
                          bivarShiftRafRef.current = null;
                        }
                        if (bivarShiftCommitRef.current != null) {
                          window.clearTimeout(bivarShiftCommitRef.current);
                          bivarShiftCommitRef.current = null;
                        }
                        (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
                      }}
                      onPointerLeave={() => {
                        bivarShiftDragRef.current = false;
                        setIsBivarDragging(false);
                        const restoreGrid = bivarGridRef.current;
                        const restoreDraft = bivarGridDraftRef.current;
                        if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                          setBivarGrid(restoreGrid);
                          if (restoreDraft) setBivarGridDrafts(restoreDraft);
                        }
                        if (bivarShiftRafRef.current != null) {
                          window.cancelAnimationFrame(bivarShiftRafRef.current);
                          bivarShiftRafRef.current = null;
                        }
                        if (bivarShiftCommitRef.current != null) {
                          window.clearTimeout(bivarShiftCommitRef.current);
                          bivarShiftCommitRef.current = null;
                        }
                      }}
                    >
                      <div className="absolute left-0 right-0 top-1/2 h-1 rounded-full bg-slate-200" />
                      <div
                        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-900 shadow-sm"
                        style={{
                          left: `${((bivarLevelShiftLive + 10) / 20) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </div>
                    <span className="min-w-[3rem] text-right text-[11px] text-slate-600">
                      {formatNumber(bivarLevelShiftLive)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ドラッグで等高線レベルをまとめて上下できます。
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="font-semibold text-slate-700">表示オプション</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      bivarView === 'contour'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setBivarView('contour')}
                  >
                    等高線
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      bivarView === 'surface'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setBivarView('surface')}
                  >
                    3D
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      showBivarHeatmap
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setShowBivarHeatmap((prev) => !prev)}
                  >
                    ヒートマップ {showBivarHeatmap ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      showBivarLabels
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setShowBivarLabels((prev) => !prev)}
                  >
                    レベル表示 {showBivarLabels ? 'ON' : 'OFF'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'blueRed', label: 'ブルー→レッド' },
                    { key: 'viridis', label: 'ビリディス' },
                    { key: 'mono', label: 'モノクロ' },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                        bivarColorScale === opt.key
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setBivarColorScale(opt.key as typeof bivarColorScale)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">パラメータ（a,b,c）</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['a', 'b', 'c'] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-[11px] text-slate-500">{key}</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        value={bivarParamDrafts[key]}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setBivarParamDrafts((prev) => ({ ...prev, [key]: raw }));
                          const parsed = Number(raw);
                          if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                            setBivarParams((prev) => ({ ...prev, [key]: parsed }));
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`order-1 lg:order-none rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${
                isMobile && isBivarPanelOpen ? 'pb-[45vh]' : ''
              }`}
              style={
                isMobile && isBivarPanelOpen
                  ? { paddingBottom: `${panelHeightVh}vh` }
                  : undefined
              }
            >
              {bivarView === 'contour' ? (
                <>
                  <div
                    ref={bivarChartRef}
                    className="relative h-[320px] sm:h-[420px] lg:h-[520px] w-full overflow-hidden touch-pan-y"
                  >
                <svg
                  className="absolute inset-0 pointer-events-none"
                  width={bivarWidth}
                  height={bivarHeight}
                  viewBox={`0 0 ${bivarWidth} ${bivarHeight}`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={bivarWidth}
                    height={bivarHeight}
                    fill="#ffffff"
                  />
                  {bivarGridData && showBivarHeatmap
                    ? bivarHeatmap.map((cell, idx) => (
                        <rect
                          key={`heat-${idx}`}
                          x={cell.x}
                          y={cell.y}
                          width={cell.w}
                          height={cell.h}
                          fill={cell.color}
                          opacity={0.35}
                        />
                      ))
                    : null}
                  {bivarGridData ? (
                    bivarContours.map((contour, idx) => (
                      <g key={`lvl-${idx}`}>
                        {contour.segments.map((seg, i) => (
                          <line
                            key={`seg-${idx}-${i}`}
                            x1={bivarXScale(seg[0])}
                            y1={bivarYScale(seg[1])}
                            x2={bivarXScale(seg[2])}
                            y2={bivarYScale(seg[3])}
                            stroke={bivarLevelColors[idx] ?? '#0ea5e9'}
                            strokeOpacity={0.8}
                            strokeWidth={1}
                          />
                        ))}
                      </g>
                    ))
                  ) : (
                    <text
                      x={bivarWidth / 2}
                      y={bivarHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#94a3b8"
                      fontSize="12"
                    >
                      入力内容を確認してください
                    </text>
                  )}
                  {bivarGridData && showBivarLabels
                    ? bivarContourLabels.map((label, idx) => (
                        <text
                          key={`lvl-text-${idx}`}
                          x={label.x}
                          y={label.y}
                          fill={label.color}
                          fontSize="11"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          opacity={0.85}
                          paintOrder="stroke"
                          stroke="#ffffff"
                          strokeWidth="3"
                        >
                          {label.text}
                        </text>
                      ))
                    : null}
                </svg>
                  </div>
                  {bivarGridData && bivarLevelsList.length ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      {bivarLevelsList.map((level, i) => (
                        <div
                          key={`lvl-label-${i}`}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: bivarLevelColors[i] ?? '#0ea5e9' }}
                          />
                          <span>{formatNumber(level)}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : bivarGridData ? (
                <div
                  ref={bivarChartRef}
                  className="relative h-[320px] sm:h-[420px] lg:h-[520px] w-full overflow-hidden"
                >
                  <BivarSurface
                    gridData={bivarGridData}
                    width={bivarWidth}
                    height={bivarHeight}
                    colorScale={bivarColorScale}
                    sensitivity={bivarRotateSensitivity}
                    resetNonce={bivarResetNonce}
                  />
                  <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] text-slate-600 shadow-sm">
                    ドラッグで回転
                  </div>
                </div>
              ) : (
                <div className="flex h-[320px] sm:h-[420px] lg:h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  計算中…
                </div>
              )}
            </div>
          </div>
          {isMobile ? (
            <div className="space-y-3">
              <button
                className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-white text-sm font-medium shadow-sm active:scale-[0.98]"
                onClick={() => setIsBivarPanelOpen(true)}
              >
                2変数設定を開く
              </button>
            </div>
          ) : null}
        </div>
      )}
      {/* ── SP専用：式一覧パネル（画面下に固定、グラフは見える） ── */}
      {tab === 'equation' && (
        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-40 ${
            isPanelOpen ? '' : 'pointer-events-none'
          }`}
        >
          <div
            className={`
              rounded-t-2xl border-t border-slate-200 bg-white/95 backdrop-blur
              shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.35)]
              overflow-y-auto
              transform transition-transform
              ${isPanelOpen ? 'translate-y-0' : 'translate-y-full'}
            `}
            style={{ height: `${panelHeightVh}vh` }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-white/90">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">式パネル</span>
              </div>
              <button
                className="text-xs text-slate-500"
                onClick={() => {
                  setIsPanelOpen(false);
                  setIsEqInputOpen(false);
                  setActiveEqIndex(null);
                }}
              >
                閉じる
              </button>
            </div>

            <div
              className="flex items-center justify-center cursor-row-resize select-none touch-none py-2"
              onPointerDown={(e) => {
                panelDragRef.current = {
                  active: true,
                  startY: e.clientY,
                  startVh: panelHeightVh,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
            >
              <div className="h-1.5 w-16 rounded-full bg-slate-300" />
            </div>

            <div className="p-3 space-y-3 w-full">{equationInputPanel}</div>
          </div>
        </div>
      )}

      {/* ── SP専用：2変数関数パネル ── */}
      {tab === 'bivar' && (
        <div
          className={`md:hidden fixed inset-x-0 bottom-0 z-40 ${
            isBivarPanelOpen ? '' : 'pointer-events-none'
          }`}
        >
          <div
            className={`
              rounded-t-2xl border-t border-slate-200 bg-white/95 backdrop-blur
              shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.35)]
              overflow-y-auto
              transform transition-transform
              ${isBivarPanelOpen ? 'translate-y-0' : 'translate-y-full'}
            `}
            style={{ height: `${panelHeightVh}vh` }}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b bg-white/90">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">2変数設定</span>
              </div>
              <button
                className="text-xs text-slate-500"
                onClick={() => setIsBivarPanelOpen(false)}
              >
                閉じる
              </button>
            </div>
            <div
              className="flex items-center justify-center cursor-row-resize select-none touch-none py-2"
              onPointerDown={(e) => {
                panelDragRef.current = {
                  active: true,
                  startY: e.clientY,
                  startVh: panelHeightVh,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
            >
              <div className="h-1 w-12 rounded-full bg-slate-300" />
            </div>
            <div className="px-4 pb-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                {/*
                  デスクトップ用の左パネルと同じ内容を再利用
                */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">表示モード</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      bivarView === 'contour'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setBivarView('contour')}
                  >
                    等高線
                  </button>
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                      bivarView === 'surface'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => setBivarView('surface')}
                  >
                    3D
                  </button>
                </div>
                {bivarView === 'surface' && (
                  <div className="mt-2 space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>回転感度</span>
                      <span>{bivarRotateSensitivity.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.003}
                      max={0.02}
                      step={0.001}
                      value={bivarRotateSensitivity}
                      onChange={(e) => setBivarRotateSensitivity(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 shadow-sm"
                        onClick={() => setBivarResetNonce((n) => n + 1)}
                      >
                        視点リセット
                      </button>
                    </div>
                  </div>
                )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    2変数関数（z = f(x, y)）
                  </label>
                  <SmartMathInput
                    value={bivarExpr}
                    onChange={(v) => {
                      const trimmed = v.replace(/^z\\s*=/i, '').trim();
                      setBivarExpr(trimmed);
                    }}
                    label=""
                    description="x, y を使って z を表す式（例: x^2 + y^2）"
                    placeholder="x^2 + y^2"
                    size="sm"
                  />
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">表示範囲</div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'xMin', label: 'x 最小' },
                      { key: 'xMax', label: 'x 最大' },
                      { key: 'yMin', label: 'y 最小' },
                      { key: 'yMax', label: 'y 最大' },
                    ] as const).map((item) => (
                      <div key={item.key}>
                        <label className="block text-[11px] text-slate-500">{item.label}</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                          value={bivarDomainDrafts[item.key]}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setBivarDomainDrafts((prev) => ({ ...prev, [item.key]: raw }));
                            const parsed = Number(raw);
                            if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                              setBivarDomain((prev) => ({ ...prev, [item.key]: parsed }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">グリッド解像度</div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'nx', label: 'x 分割' },
                      { key: 'ny', label: 'y 分割' },
                    ] as const).map((item) => (
                      <div key={item.key}>
                        <label className="block text-[11px] text-slate-500">{item.label}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                          value={bivarGridDrafts[item.key]}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setBivarGridDrafts((prev) => ({ ...prev, [item.key]: raw }));
                            const parsed = Number(raw);
                            if (Number.isFinite(parsed) && raw !== '') {
                              setBivarGrid((prev) => ({
                                ...prev,
                                [item.key]: Math.max(10, parsed),
                              }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">等高線レベル</div>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                    value={bivarLevels}
                    placeholder="例: -4,-2,0,2,4（空なら自動）"
                    onChange={(e) => setBivarLevels(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500">
                    空欄の場合は自動でレベルを作成します。
                  </p>
                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-500">レベルオフセット</label>
                    <div className="flex items-center gap-2">
                      <div
                        ref={bivarShiftTrackRef}
                        className="relative h-7 w-full cursor-pointer touch-none"
                        onPointerDown={(e) => {
                          const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          bivarShiftDragRef.current = true;
                          setIsBivarDragging(true);
                          const ratio = (e.clientX - rect.left) / rect.width;
                          const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                          setBivarLevelShiftLive(Number(next.toFixed(2)));
                          (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
                        }}
                        onPointerMove={(e) => {
                          if (!bivarShiftDragRef.current) return;
                          const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          const now = e.timeStamp ?? performance.now();
                          if (now - bivarShiftLastTsRef.current < 16) return;
                          bivarShiftLastTsRef.current = now;
                          const ratio = (e.clientX - rect.left) / rect.width;
                          const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                          const nextValue = Number(next.toFixed(2));
                          bivarShiftNextRef.current = nextValue;
                          if (bivarGridRef.current.nx > 24 || bivarGridRef.current.ny > 24) {
                            setBivarGrid({ nx: 24, ny: 24 });
                            setBivarGridDrafts({ nx: '24', ny: '24' });
                          }
                          if (bivarShiftRafRef.current == null) {
                            bivarShiftRafRef.current = window.requestAnimationFrame(() => {
                              bivarShiftRafRef.current = null;
                              if (bivarShiftNextRef.current != null) {
                                setBivarLevelShiftLive(bivarShiftNextRef.current);
                              }
                            });
                          }
                          if (bivarShiftCommitRef.current != null) {
                            window.clearTimeout(bivarShiftCommitRef.current);
                          }
                          bivarShiftCommitRef.current = window.setTimeout(() => {
                            if (bivarShiftNextRef.current != null) {
                              setBivarLevelShift(bivarShiftNextRef.current);
                            }
                          }, 120);
                        }}
                        onTouchStart={(e) => {
                          const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          bivarShiftDragRef.current = true;
                          setIsBivarDragging(true);
                          const touch = e.touches[0];
                          if (!touch) return;
                          const ratio = (touch.clientX - rect.left) / rect.width;
                          const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                          setBivarLevelShiftLive(Number(next.toFixed(2)));
                          e.preventDefault();
                        }}
                        onTouchMove={(e) => {
                          if (!bivarShiftDragRef.current) return;
                          const rect = bivarShiftTrackRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          const now = e.timeStamp ?? performance.now();
                          if (now - bivarShiftLastTsRef.current < 16) return;
                          bivarShiftLastTsRef.current = now;
                          const touch = e.touches[0];
                          if (!touch) return;
                          const ratio = (touch.clientX - rect.left) / rect.width;
                          const next = -10 + Math.min(1, Math.max(0, ratio)) * 20;
                          const nextValue = Number(next.toFixed(2));
                          bivarShiftNextRef.current = nextValue;
                          if (bivarGridRef.current.nx > 24 || bivarGridRef.current.ny > 24) {
                            setBivarGrid({ nx: 24, ny: 24 });
                            setBivarGridDrafts({ nx: '24', ny: '24' });
                          }
                          if (bivarShiftRafRef.current == null) {
                            bivarShiftRafRef.current = window.requestAnimationFrame(() => {
                              bivarShiftRafRef.current = null;
                              if (bivarShiftNextRef.current != null) {
                                setBivarLevelShiftLive(bivarShiftNextRef.current);
                              }
                            });
                          }
                          if (bivarShiftCommitRef.current != null) {
                            window.clearTimeout(bivarShiftCommitRef.current);
                          }
                          bivarShiftCommitRef.current = window.setTimeout(() => {
                            if (bivarShiftNextRef.current != null) {
                              setBivarLevelShift(bivarShiftNextRef.current);
                            }
                          }, 120);
                          e.preventDefault();
                        }}
                        onTouchEnd={() => {
                          bivarShiftDragRef.current = false;
                          setIsBivarDragging(false);
                          setBivarLevelShift(bivarShiftNextRef.current ?? bivarLevelShiftLive);
                          const restoreGrid = bivarGridRef.current;
                          const restoreDraft = bivarGridDraftRef.current;
                          if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                            setBivarGrid(restoreGrid);
                            if (restoreDraft) setBivarGridDrafts(restoreDraft);
                          }
                          if (bivarShiftRafRef.current != null) {
                            window.cancelAnimationFrame(bivarShiftRafRef.current);
                            bivarShiftRafRef.current = null;
                          }
                          if (bivarShiftCommitRef.current != null) {
                            window.clearTimeout(bivarShiftCommitRef.current);
                            bivarShiftCommitRef.current = null;
                          }
                        }}
                        onPointerUp={(e) => {
                          bivarShiftDragRef.current = false;
                          setIsBivarDragging(false);
                          setBivarLevelShift(bivarShiftNextRef.current ?? bivarLevelShiftLive);
                          const restoreGrid = bivarGridRef.current;
                          const restoreDraft = bivarGridDraftRef.current;
                          if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                            setBivarGrid(restoreGrid);
                            if (restoreDraft) setBivarGridDrafts(restoreDraft);
                          }
                          if (bivarShiftRafRef.current != null) {
                            window.cancelAnimationFrame(bivarShiftRafRef.current);
                            bivarShiftRafRef.current = null;
                          }
                          if (bivarShiftCommitRef.current != null) {
                            window.clearTimeout(bivarShiftCommitRef.current);
                            bivarShiftCommitRef.current = null;
                          }
                          (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
                        }}
                        onPointerLeave={() => {
                          bivarShiftDragRef.current = false;
                          setIsBivarDragging(false);
                          const restoreGrid = bivarGridRef.current;
                          const restoreDraft = bivarGridDraftRef.current;
                          if (restoreGrid && (restoreGrid.nx !== bivarGrid.nx || restoreGrid.ny !== bivarGrid.ny)) {
                            setBivarGrid(restoreGrid);
                            if (restoreDraft) setBivarGridDrafts(restoreDraft);
                          }
                          if (bivarShiftRafRef.current != null) {
                            window.cancelAnimationFrame(bivarShiftRafRef.current);
                            bivarShiftRafRef.current = null;
                          }
                          if (bivarShiftCommitRef.current != null) {
                            window.clearTimeout(bivarShiftCommitRef.current);
                            bivarShiftCommitRef.current = null;
                          }
                        }}
                      >
                        <div className="absolute left-0 right-0 top-1/2 h-1 rounded-full bg-slate-200" />
                        <div
                          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-slate-900 shadow-sm"
                          style={{
                            left: `${((bivarLevelShiftLive + 10) / 20) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      </div>
                      <span className="min-w-[3rem] text-right text-[11px] text-slate-600">
                        {formatNumber(bivarLevelShiftLive)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      ドラッグで等高線レベルをまとめて上下できます。
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">表示オプション</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                        showBivarHeatmap
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setShowBivarHeatmap((prev) => !prev)}
                    >
                      ヒートマップ {showBivarHeatmap ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                        showBivarLabels
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setShowBivarLabels((prev) => !prev)}
                    >
                      レベル表示 {showBivarLabels ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'blueRed', label: 'ブルー→レッド' },
                      { key: 'viridis', label: 'ビリディス' },
                      { key: 'mono', label: 'モノクロ' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-[11px] shadow-sm transition ${
                          bivarColorScale === opt.key
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                        onClick={() => setBivarColorScale(opt.key as typeof bivarColorScale)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="font-semibold text-slate-700">パラメータ（a,b,c）</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['a', 'b', 'c'] as const).map((key) => (
                      <div key={key}>
                        <label className="block text-[11px] text-slate-500">{key}</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                          value={bivarParamDrafts[key]}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setBivarParamDrafts((prev) => ({ ...prev, [key]: raw }));
                            const parsed = Number(raw);
                            if (!Number.isNaN(parsed) && raw !== '' && raw !== '-') {
                              setBivarParams((prev) => ({ ...prev, [key]: parsed }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomLegend({
  labels,
  colors,
}: {
  labels: string[];
  colors: string[];
}) {
  if (!labels || labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: colors[i] ?? PALETTE[i % PALETTE.length],
            }}
          />
          <InlineKatex tex={label} />
        </div>
      ))}
    </div>
  );
}
