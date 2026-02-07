// src/components/graphs/GraphEmbed.tsx
'use client';

import { useEffect, useMemo, useState, Fragment, useRef } from 'react';
import katex from 'katex';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
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
  polarToSeries,
  getEqualAspectDomain,
  Series,
  parametricToSeries,
  buildIneqFillCells,
} from './chartUtils';

const CHART_MARGIN = { top: 32, right: 32, bottom: 40, left: 40 };

const PALETTE = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea',
  '#ea580c', '#0891b2', '#eab308', '#4b5563',
];

function toDisplayTex(s: string) {
  return (s || '').replace(/\*\*/g, '^').replace(/\s*=\s*/g, ' = ');
}

export default function GraphEmbed({ id, height = 320 }: { id: number; height?: number }) {
  const [row, setRow] = useState<any>(null);
  const [plotSize, setPlotSize] = useState({ width: 0, height: 0 });
  
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [plotBox, setPlotBox] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  /* ────────────────────────────────────────
     1. グラフデータを Supabase から取得
  ──────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabaseBrowser
        .from('graphs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('GraphEmbed fetch error', error);
      }

      if (!cancelled && data) {
        setRow(data);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const overlay = useMemo(() => row?.config?.overlay ?? [], [row]);
  const render = row?.config?.render ?? row?.config ?? {};

  const colors = render.colors ?? PALETTE;

  const xLabel = render.xLabel ?? 'x';
  const yLabel = render.yLabel ?? 'y';

  const xMinBase = render.xMin ?? -10;
  const xMaxBase = render.xMax ?? 10;
  const yMinBase = render.yMin ?? -10;
  const yMaxBase = render.yMax ?? 10;

  /* ────────────────────────────────────────
     2. 線グラフ（関数/極座標/param/陰関数/ineq1d）
  ──────────────────────────────────────── */
  const seriesList: Series = useMemo(() => {
    const out: Series = [];
    
    overlay.forEach((p: any, idx: number) => {
      if (!p || !p.kind) return;
  
      // ★ 式ごとのパラメータをここで取り出す
      const eqParams = p.params ?? {};  // GraphStudio が保存した {a,b,c} が入ってくる
  
      try {
        if (p.kind === 'function') {
          const conf = p.conf ?? {};
          out.push(
            ...toSeriesFromConfig('function', {
              ...conf,
              name: conf.name ?? p.label ?? `f${idx + 1}(x)`,
              params: eqParams,
            }),
          );
        } else if (p.kind === 'polar') {
          const conf = p.conf ?? {};
          out.push(
            ...polarToSeries(
              { ...conf, name: conf.name ?? p.label ?? `r${idx + 1}(θ)` },
              eqParams,
            ),
          );
        } else if (p.kind === 'param') {
          const conf = p.conf ?? {};
          out.push(
            ...parametricToSeries(
              { ...conf, name: conf.name ?? p.label ?? `param${idx + 1}` },
              eqParams,
            ),
          );
        } else if (p.kind === 'ineq1d') {
          const { expr, xMin, xMax, step } = p.conf ?? {};
          if (!expr) throw new Error('ineq1d: expr is missing');
          out.push(
            ...toSeriesFromConfig('function', {
              expr,
              xMin,
              xMax,
              step,
              params: eqParams,
              name: p.label ?? `ineq${idx + 1}`,
            }),
          );
        } else if (p.kind === 'ineq2d') {
          const { Fexpr, xMin, xMax, yMin, yMax, nx, ny } = p.conf ?? {};
          if (!Fexpr) throw new Error('ineq2d: Fexpr is missing');
          out.push(
            ...implicitToSeries(
              Fexpr,
              '0',
              xMin ?? xMinBase,
              xMax ?? xMaxBase,
              yMin ?? yMinBase,
              yMax ?? yMaxBase,
              nx,
              ny,
              eqParams, // ★ ここも eqParams
            ),
          );
        } else {
          console.warn('GraphEmbed: unknown kind', p.kind, 'at index', idx);
        }
      } catch (e) {
        console.error('GraphEmbed: failed to build series for overlay index', idx, p, e);
      }
    });
  
    return out;
  }, [overlay, xMinBase, xMaxBase, yMinBase, yMaxBase]);  


  /* ────────────────────────────────────────
     3. 等軸 domain の計算
  ──────────────────────────────────────── */
  const equalDomain = useMemo(
    () => getEqualAspectDomain(seriesList, 0.1),
    [seriesList],
  );

  const xTicks = useMemo(() => {
    const t = [];
    for (let i = Math.ceil(equalDomain.xMin); i <= equalDomain.xMax; i++) t.push(i);
    return t.slice(0,40);
  }, [equalDomain]);

  const yTicks = useMemo(() => {
    const t = [];
    for (let i = Math.ceil(equalDomain.yMin); i <= equalDomain.yMax; i++) t.push(i);
    return t.slice(0,40);
  }, [equalDomain]);

  useEffect(() => {
    const root = chartRef.current;
    if (!root) return;
  
    const id = requestAnimationFrame(() => {
      const rootRect = root.getBoundingClientRect();
      const grid = root.querySelector('.recharts-cartesian-grid') as SVGElement | null;
      if (!grid) return;
  
      const gridRect = grid.getBoundingClientRect();
      setPlotBox({
        left: gridRect.left - rootRect.left,
        top: gridRect.top - rootRect.top,
        width: gridRect.width,
        height: gridRect.height,
      });
    });
  
    return () => cancelAnimationFrame(id);
  }, [seriesList, equalDomain, plotSize]);

  /* ────────────────────────────────────────
     4. 1D 不等式 塗りつぶし（Area 相当）
  ──────────────────────────────────────── */
  const Ineq1DFill = () => {
    return (
      <>
        {seriesList.map((s, i) => {
          const p = overlay[i];
          if (!p || p.kind !== 'ineq1d') return null;
  
          const color = colors[i] ?? PALETTE[i % PALETTE.length];
          const op = p.conf?.op;
          const baseValue =
            op === 'ge' || op === 'gt'
              ? equalDomain.yMax
              : equalDomain.yMin;
  
          return (
            <Area
              key={`ineq1d-fill-${i}`}
              data={s.points}
              type="linear"
              dataKey="y"
              baseValue={baseValue}
              stroke="none"
              fill={color}
              fillOpacity={0.15}
              isAnimationActive={false}
              legendType="none"
            />
          );
        })}
      </>
    );
  };


  /* ────────────────────────────────────────
     5. 2D 不等式 塗りつぶし
  ──────────────────────────────────────── */
  const Ineq2DFill = () => {
    if (plotBox.width === 0 || plotBox.height === 0) return null;
  
    const rects: JSX.Element[] = [];
  
    const innerWidth = plotBox.width;
    const innerHeight = plotBox.height;
    const xRange = Math.max(equalDomain.xMax - equalDomain.xMin, 1e-6);
    const yRange = Math.max(equalDomain.yMax - equalDomain.yMin, 1e-6);
  
    const xToPx = (x: number) =>
      plotBox.left + ((x - equalDomain.xMin) / xRange) * innerWidth;
  
    const yToPx = (y: number) =>
      plotBox.top + ((equalDomain.yMax - y) / yRange) * innerHeight;
  
    overlay.forEach((p: any, idx: number) => {
      if (p.kind !== 'ineq2d') return;
  
      const { Fexpr, cmp } = p.conf ?? {};
      if (!Fexpr) return;

      const eqParams = p.params ?? {};  // ★ 式ごとの params
  
      const sampleNx = Math.min(Math.max(Math.floor(innerWidth), 60), 400);
      const sampleNy = Math.min(Math.max(Math.floor(innerHeight), 60), 400);
  
      let cells: any[] = [];
      try {
        cells = buildIneqFillCells(
          Fexpr,
          cmp,
          equalDomain.xMin,
          equalDomain.xMax,
          equalDomain.yMin,
          equalDomain.yMax,
          sampleNx,
          sampleNy,
          eqParams,
        );
      } catch (e) {
        console.error('GraphEmbed: failed to build 2D fill cells at index', idx, p, e);
        cells = [];
      }
  
      const color = colors[idx] ?? PALETTE[idx % PALETTE.length];
  
      cells.forEach((cell: any, ci: number) => {
        const x0 = xToPx(cell.x0);
        const x1 = xToPx(cell.x1);
        const y0 = yToPx(cell.y0);
        const y1 = yToPx(cell.y1);
  
        rects.push(
          <rect
            key={`ineq2d-${idx}-${ci}`}
            x={Math.min(x0, x1)}
            y={Math.min(y0, y1)}
            width={Math.abs(x1 - x0)}
            height={Math.abs(y1 - y0)}
            fill={color}
            fillOpacity={0.15}
          />,
        );
      });
    });
  
    return <>{rects}</>;
  };  


  /* ────────────────────────────────────────
     6. 凡例（保存された original を KaTeX で表示）
  ──────────────────────────────────────── */
  const legendLabels = overlay.map((p: any) => {
    const baseExpr =
      p.original
        ? p.original
        : p.conf?.expr ?? '';
  
    const base = toDisplayTex(baseExpr);
    const params = p.params ?? {};
    const parts: string[] = [];
  
    if (/\ba\b/.test(baseExpr) && params.a !== undefined) {
      parts.push(`a=${params.a}`);
    }
    if (/\bb\b/.test(baseExpr) && params.b !== undefined) {
      parts.push(`b=${params.b}`);
    }
    if (/\bc\b/.test(baseExpr) && params.c !== undefined) {
      parts.push(`c=${params.c}`);
    }
  
    if (parts.length === 0) return base;
    const paramText = `\\;\\;\\text{(${parts.join(', ')})}`;
    return base + paramText;
  });  

  // グラフが空かどうか判定
  const isEmpty =
    seriesList.length === 0 ||
    seriesList.every((s) => s.points.length === 0);

  // ここで row null の場合を処理（hook の後ならOK）
  if (!row) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex items-center justify-center text-sm text-gray-500 bg-white"
      >
        読み込み中…
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex items-center justify-center text-sm text-gray-500 bg-white border rounded"
      >
        グラフデータがありません（式や範囲の設定を確認してください）
      </div>
    );
  }


  /* ────────────────────────────────────────
     7. 出力（Recharts + SVG オーバーレイ）
  ──────────────────────────────────────── */
  return (
    <div className="w-full flex justify-center">
      <div
        ref={chartRef}
        className="bg-white border rounded"
        style={{ width: '100%', maxWidth: 800, aspectRatio: '1 / 1' }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          onResize={(w, h) => {
            if (w && h) setPlotSize({ width: w, height: h });
          }}
        >
          <ComposedChart margin={CHART_MARGIN}>
            <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[equalDomain.xMin, equalDomain.xMax]}
              ticks={xTicks}
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[equalDomain.yMin, equalDomain.yMax]}
              ticks={yTicks}
              label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={(props) => {
                // Legend に渡ってきた payload を受け取る
                const payload = props?.payload ?? [];

                // ★ Line だけに絞る（Area などは捨てる）
                const filtered = payload.filter((entry: any) => entry.type === 'line');

                return (
                  <div className="flex flex-wrap gap-3">
                    {filtered.map((entry, i) => (
                      <span key={i} className="flex gap-2 items-center">
                        <span
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: katex.renderToString(
                              // overlay から作った LaTeXラベルがあればそれを使う
                              (legendLabels[i] ?? entry.value)
                                ?.toString()
                                .replace(/\*\*/g, '^'),
                              { throwOnError: false, strict: false },
                            ),
                          }}
                        />
                      </span>
                    ))}
                  </div>
                );
              }}
            />


            {/* ▼ 2D 不等式 塗りつぶし */}
            <Ineq2DFill />

            {/* ▼ 1D 不等式 塗りつぶし */}
            <Ineq1DFill />

            {/* ▼ 線（境界/通常関数） */}
            {seriesList.map((s, i) => (
              <Line
                key={i}
                data={s.points}
                dataKey="y"
                type="linear"
                dot={false}
                stroke={colors[i] ?? PALETTE[i % PALETTE.length]}
                strokeWidth={overlay[i]?.kind === 'ineq2d' ? 2 : 1}
                strokeDasharray={overlay[i]?.kind === 'ineq2d' ? '4 4' : undefined}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
