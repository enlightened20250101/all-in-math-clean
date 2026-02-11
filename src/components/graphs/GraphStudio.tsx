// src/components/graphs/GraphStudio.tsx
'use client';

import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
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
          const yv = a * xv * xv + b * xv + (y0 - a * p0.x * p0.x - b * p0.x);
          maxima.push({ x: xv, y: yv });
          continue;
        }
      }
      maxima.push(p1);
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
          const yv = a * xv * xv + b * xv + (y0 - a * p0.x * p0.x - b * p0.x);
          minima.push({ x: xv, y: yv });
          continue;
        }
      }
      minima.push(p1);
    }
  }
  return {
    maxima: maxima.slice(0, limit),
    minima: minima.slice(0, limit),
  };
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
  const [tab, setTab] = useState<'equation' | 'series'>('equation');
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

      if (draft.tab === 'equation' || draft.tab === 'series') setTab(draft.tab);

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
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error('failed to save GraphStudio draft', e);
    }
  }, [drawVersion, equations, colors, domains, paramList, title, xLabel, yLabel, yMin, yMax, nx, ny, tab]);

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
    if (tab !== 'equation') return;
    setLegendNames((prev) => {
      const next = equations.map((_, i) => prev[i] ?? legendSnapshot[i] ?? `y${i + 1}`);
      const same =
        prev.length === next.length && prev.every((v, idx) => v === next[idx]);
      return same ? prev : next;
    });
  }, [equations.length, tab, legendSnapshot.length]);

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
    const xMin = Number(fillConfig.xMin);
    const xMax = Number(fillConfig.xMax);
    const hasXMin = Number.isFinite(xMin);
    const hasXMax = Number.isFinite(xMax);
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

  const activeChartRef = tab === 'equation' ? equationChartRef : seriesChartRef;

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
      onWheel={(e) => {
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
        const domain = viewDomain ?? equalDomain;
        panState.current = {
          x: e.clientX,
          y: e.clientY,
          domain,
        };
        chartWrapRef.current.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!chartWrapRef.current || !panState.current) return;
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
      onPointerLeave={() => {
        panState.current = null;
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
          {fillBetweenData ? (
            <Area
              data={fillBetweenData}
              type="linear"
              dataKey="y1"
              baseLine={fillBetweenData.map((d) => d.y2)}
              stroke="none"
              fill="#38bdf8"
              fillOpacity={0.16}
              isAnimationActive={false}
            />
          ) : null}
  
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

          {/* SP版：下に「式を編集」ボタン */}
          <div className="lg:hidden space-y-3">
            <button
              className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-white text-sm font-medium shadow-sm active:scale-[0.98]"
              onClick={openEquationPanel}
            >
              式を編集する（入力パネルを開く）
            </button>
          </div>

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
