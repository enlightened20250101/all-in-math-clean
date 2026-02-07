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

export default function GraphStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromId = searchParams.get('from');   // ← ここで取得
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
  const [colors, setColors] = useState<string[]>([PALETTE[0], PALETTE[1]]);
  const [title, setTitle] = useState('Overlay');

  // ★ 式ごとの定義域（関数: x / 極座標・param: t）
  const [domains, setDomains] = useState<Domain1D[]>([
    { ...DEFAULT_DOMAIN },
    { ...DEFAULT_DOMAIN },
  ]);

  // 軸ラベル（表示用）
  const [xLabel, setXLabel] = useState('x');
  const [yLabel, setYLabel] = useState('y');

  // 陰関数用の共通グリッド範囲
  const [yMin, setYMin] = useState(-3);
  const [yMax, setYMax] = useState(3);
  const [nx, setNx] = useState(80);
  const [ny, setNy] = useState(80);

  // ★ 式ごとのパラメータ（a,b,c）
  const [paramList, setParamList] = useState<
  { a: number; b: number; c: number }[]
  >([
    { a: 1, b: 1, c: 0 }, // 1本目の式
    { a: 1, b: 1, c: 0 }, // 2本目の式
  ]);

  // ★ SP用：式専用入力パネル用の状態
  const [activeEqIndex, setActiveEqIndex] = useState<number | null>(null);
  const [isEqInputOpen, setIsEqInputOpen] = useState(false);

  // ★ SP用：式入力パネルの開閉フラグ
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [equationErrors, setEquationErrors] = useState<string[]>([]);

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

  // X軸の整数tick
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const min = Math.ceil(equalDomain.xMin);
    const max = Math.floor(equalDomain.xMax);
    for (let t = min; t <= max && ticks.length < 41; t++) ticks.push(t);
    return ticks;
  }, [equalDomain]);

  // Y軸の整数tick
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const min = Math.ceil(equalDomain.yMin);
    const max = Math.floor(equalDomain.yMax);
    for (let t = min; t <= max && ticks.length < 41; t++) ticks.push(t);
    return ticks;
  }, [equalDomain]);

  // 凡例ラベル
  const legendLabels =
    tab === 'series'
      ? sConf.series.map((s) => s.name || 'series')
      : legendSnapshot.filter((_, i) => parsedList[i] !== null);

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
  
      const domXMin = equalDomain.xMin;
      const domXMax = equalDomain.xMax;
      const domYMin = equalDomain.yMin;
      const domYMax = equalDomain.yMax;
  
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
  }, [parsedList, paramList, colors, equalDomain, plotBoxEq, chartSizeEq]);  

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
  
      const domXMin = equalDomain.xMin;
      const domXMax = equalDomain.xMax;
      const domYMin = equalDomain.yMin;
      const domYMax = equalDomain.yMax;
  
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
  }, [parsedList, paramList, colors, equalDomain, plotBoxSeries, chartSizeSeries]);  

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
  }, [drawVersion, equalDomain, xTicks, yTicks]);

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
  }, [drawVersion, equalDomain, xTicks, yTicks]);

  // ==== 式入力パネル（PCとSP共通で使う） ====
  const equationInputPanel = (
    <>
      {/* 入力パネル（タイトル + ボタン） */}
      <div className="space-y-3">
        <label className="block text-sm">タイトル</label>
        <input
          className="border rounded px-2 py-1 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
  
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium">式（1行=1式）</span>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 border rounded"
              onClick={addEquation}
            >
              ＋ 式を追加
            </button>
            <button
              className="px-3 py-1 border rounded bg-black text-white disabled:opacity-60"
              onClick={() => setDrawVersion((v) => v + 1)}
              disabled={isDrawing}
            >
              {isDrawing ? 'グラフ作成中…' : 'グラフ作成'}
            </button>
          </div>
        </div>
      </div>
  
      <p className="text-xs text-gray-500">
        例：<code>y = x**2</code>、<code>r = 1 + 2*cos(x)</code>、
        <code>param: x = cos(t); y = sin(t)</code>、
        <code>x**2 + y**2 = 1</code>
      </p>
  
      {/* 複数式の行 */}
      <div className="space-y-4">
        {equations.map((eq, i) => {
          const d = domains[i] ?? DEFAULT_DOMAIN;
          const param = paramList[i] ?? { a: 1, b: 1, c: 0 };

          return (
            <div
              key={i}
              className="border rounded-md p-2 bg-gray-50 space-y-3"
            >
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
                    <span className="text-xs text-gray-500">色</span>
                    <input
                      type="color"
                      value={colors[i] ?? PALETTE[i % PALETTE.length]}
                      onChange={(e) => updateColor(i, e.target.value)}
                      className="w-8 h-8 p-0 border rounded"
                    />
                  </div>
                  <div className="col-span-2 flex items-start justify-end">
                    <button
                      className="px-2 py-1 border rounded text-xs"
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
                        rounded-md px-2 py-1
                        border border-gray-200 bg-white
                        shadow-sm
                        hover:border-sky-400 hover:bg-sky-50
                        focus:ring-2 focus:ring-sky-500/40
                        cursor-pointer
                        transition
                      "
                      onClick={() => {
                        setActiveEqIndex(i);
                        setIsEqInputOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 mb-0.5">
                            式 {i + 1}
                          </div>
                          <div className="text-sm text-gray-800 truncate">
                            <InlineKatex tex={toDisplayTex(eq)} />
                          </div>
                        </div>

                        {/* ペンアイコン風の丸いボタン（実際には装飾） */}
                        <div className="shrink-0 rounded-full border border-gray-300 px-2 py-0.5 text-[10px] text-gray-600 bg-gray-50">
                          編集
                        </div>
                      </div>

                      {equationErrors[i] && (
                        <div className="mt-0.5 text-[11px] text-red-600">
                          {equationErrors[i]}
                        </div>
                      )}

                      <div className="mt-0.5 text-[10px] text-gray-400">
                        タップして数式を編集
                      </div>
                    </button>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-500">色</span>
                        <input
                          type="color"
                          value={colors[i] ?? PALETTE[i % PALETTE.length]}
                          onChange={(e) => updateColor(i, e.target.value)}
                          className="w-7 h-7 p-0 border rounded"
                        />
                      </div>
                      <div className="flex">
                        <button
                          className="px-2 py-1 border rounded text-[11px]"
                          onClick={() => removeEquation(i)}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 以下は PC / SP 共通：定義域・パラメータ ── */}
              <div className="text-xs text-gray-600 space-y-1">
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
                    <label className="block text-[11px]">最小</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={d.xMin}
                      onChange={(e) =>
                        updateDomain(i, { xMin: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px]">最大</label>
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={d.xMax}
                      onChange={(e) =>
                        updateDomain(i, { xMax: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[11px]">step</label>
                    <input
                      type="number"
                      step="0.01"
                      className="border rounded px-2 py-1 w-24"
                      value={d.step}
                      onChange={(e) =>
                        updateDomain(i, { step: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1 mt-2">
                  <span className="font-semibold">パラメータ a, b, c</span>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="block text-[11px]">a</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-24"
                        value={param.a}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setParamList((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, a: v } : p,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px]">b</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-24"
                        value={param.b}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setParamList((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, b: v } : p,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px]">c</label>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-24"
                        value={param.c}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setParamList((prev) =>
                            prev.map((p, idx) =>
                              idx === i ? { ...p, c: v } : p,
                            ),
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

  
      {/* 軸ラベル */}
      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs">X軸ラベル</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={xLabel}
            onChange={(e) => setXLabel(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs">Y軸ラベル</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={yLabel}
            onChange={(e) => setYLabel(e.target.value)}
          />
        </div>
      </div>
  
      {/* 陰関数グリッド範囲（詳細設定） */}
      <details className="border rounded p-2 bg-gray-50">
        <summary className="text-xs font-semibold cursor-pointer">
          陰関数の詳細設定（グリッド範囲）
        </summary>
        <div className="mt-2 grid md:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-xs">yMin</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={yMin}
              onChange={(e) => setYMin(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs">yMax</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={yMax}
              onChange={(e) => setYMax(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs">nx（x方向分割数）</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={nx}
              onChange={(e) =>
                setNx(Math.max(10, Number(e.target.value) || 10))
              }
            />
          </div>
          <div>
            <label className="block text-xs">ny（y方向分割数）</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={ny}
              onChange={(e) =>
                setNy(Math.max(10, Number(e.target.value) || 10))
              }
            />
          </div>
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          これらは <code>x**2 + y**2 = 1</code> などの陰関数を描くときに使われる
          グリッド範囲です。通常の y=f(x)、r=f(θ)、param には影響しません。
        </p>
      </details>
    </>
  );

  // ==== 式タブのグラフビュー（PC/SP共通） ====
  const equationChartView = (
    <div
      ref={equationChartRef}
      className="
        relative w-full max-w-full
        aspect-square                /* SP：常に正方形 */
        md:aspect-square md:h-auto  /* PC：常に正方形 */
        transform
        -translate-x-2    /* SP のときだけ少し左にズラす */
        md:translate-x-0  /* PC では補正しない */
      "
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[equalDomain.xMin, equalDomain.xMax]}
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
            domain={[equalDomain.yMin, equalDomain.yMax]}
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
          <Tooltip />
  
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
    </div>
  );



  // ========= JSX =========
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            グラフスタジオ
          </h1>
          <p className="mt-1 text-xs text-gray-500 md:text-sm">
            数式を入力してグラフを描画・保存できます。スマホでは下のボタンから式を編集できます。
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 justify-end">
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
            className="px-3 py-1 text-xs md:text-sm border rounded"
            onClick={clearDraft}
          >
            下書き削除
          </button>
          <button
            className="px-3 py-1 text-xs md:text-sm border rounded bg-black text-white"
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
      <div className="flex gap-2 border-b pb-2">
        <button
          className={`px-3 py-1 rounded-t border-b-2 text-xs md:text-sm ${
            tab === 'equation'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-gray-500'
          }`}
          onClick={() => setTab('equation')}
        >
          式から描く
        </button>
        <button
          className={`px-3 py-1 rounded-t border-b-2 text-xs md:text-sm ${
            tab === 'series'
              ? 'border-black text-black font-semibold'
              : 'border-transparent text-gray-500'
          }`}
          onClick={() => setTab('series')}
        >
          データから描く
        </button>
      </div>

      {/* ── 式タブ ── */}
      {tab === 'equation' && (
        <div className="space-y-4">
          {/* PC版：上に入力パネル */}
          <div className="hidden md:block space-y-4">
            {equationInputPanel}
          </div>
          
          {/* グラフ本体：PC/SP 共通でここ「だけ」 */}
          {equationChartView}
          
          {/* SP版：下に「式を編集」ボタン */}
          <div className="md:hidden space-y-3">
            <button
              className="w-full mt-2 px-4 py-3 rounded-xl border bg-black text-white text-sm font-medium shadow-sm active:scale-[0.98]"
              onClick={() => setIsPanelOpen(true)}
            >
              式を編集する（入力パネルを開く）
            </button>
          </div>
          
          {drawVersion > 0 && previewEmpty && (
            <div className="text-sm text-red-600">
              描画できませんでした。式や範囲・解像度を見直してください。
            </div>
          )}
        </div>
      )}


      {/* ── データタブ ── */}
      {tab === 'series' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm">
              CSVから読み込み（name,x,y）
            </label>
            <textarea
              className="border rounded w-full text-xs p-1 h-24"
              placeholder={'A,0,1\nA,1,0.5\nB,0,0\nB,1,0.3 など'}
              onBlur={(e) => {
                if (e.target.value.trim()) parseCsv(e.target.value);
              }}
            />
          </div>

          <div className="w-full flex justify-center">
            <div className="border rounded bg-white p-2">
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
                    <CartesianGrid strokeDasharray="3 3" />
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
                    <Tooltip />
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
      {/* ── SP専用：式一覧パネル ＋ 式専用入力パネル ── */}
      {tab === 'equation' && (
        <div
          className={`md:hidden fixed inset-0 z-40 ${
            isPanelOpen ? '' : 'pointer-events-none'
          }`}
        >
          {/* 背景オーバーレイ（タップでパネル全体を閉じる） */}
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${
              isPanelOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => {
              setIsPanelOpen(false);
              setIsEqInputOpen(false);
              setActiveEqIndex(null);
            }}
          />
          
          {/* 式一覧パネル（上側に出るシート） */}
          <div
            className={`
              absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-lg
              max-h-[80vh] overflow-y-auto
              transform transition-transform
              ${isPanelOpen ? 'translate-y-0' : 'translate-y-full'}
            `}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <button
                className="text-xs text-gray-500"
                onClick={() => {
                  setIsPanelOpen(false);
                  setIsEqInputOpen(false);
                  setActiveEqIndex(null);
                }}
              >
                閉じる
              </button>
            </div>
            
            <div className="p-3 space-y-3">
              {equationInputPanel}
            </div>
          </div>
          
          {/* 式専用 SmartInput パネル（さらに上から出るシート） */}
          {isMobile && activeEqIndex !== null && (
            <div
              className={`
                fixed inset-0 z-50 flex items-end justify-center
                ${isEqInputOpen ? '' : 'pointer-events-none'}
              `}
            >
              {/* 内側オーバーレイ：タップで専用パネルだけ閉じる */}
              <div
                className={`absolute inset-0 bg-black/30 transition-opacity ${
                  isEqInputOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={() => setIsEqInputOpen(false)}
              />
              
              <div
                className={`
                  relative w-full bg-white rounded-t-2xl shadow-xl
                  max-height-[70vh] overflow-y-auto
                  transform transition-transform
                  ${isEqInputOpen ? 'translate-y-0' : 'translate-y-full'}
                `}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="text-xs text-gray-600">
                    式 {activeEqIndex + 1} を編集
                  </span>
                  <button
                    className="text-xs text-gray-500"
                    onClick={() => setIsEqInputOpen(false)}
                  >
                    完了
                  </button>
                </div>
                
                <div className="p-3">
                  <SmartMathInput
                    value={equations[activeEqIndex] ?? ''}
                    onChange={(v) => updateEquation(activeEqIndex, v)}
                    label=""
                    description="sin, cos, log, sqrt などの関数が使えます"
                    size="md"
                    // GraphStudio 側でボトムシートを持つので、内蔵シートはオフ
                  />
                </div>
              </div>
            </div>
          )}
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
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {labels.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded"
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
