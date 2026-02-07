// src/app/labs/animation/vizspec/VizSpecLabClient.tsx
'use client';

import React, { useState } from 'react';
import { VizRunner } from '@/components/viz';
import { VizSpec, VizSpecSchema } from '@/lib/vizSpec';

type PresetBtn = { label: string; make: () => VizSpec };

// サンプル（/api 側のルールベースと整合するプリセット）
const PresetSamples: PresetBtn[] = [
  {
    label: 'Parabola (vertex)',
    make: () => ({
      preset: 'parabola_vertex_shift',
      params: { a: 1, h: 2, k: -1, xRange: [-5, 5] },
      bbox: [-6, 6, 6, -6],
      objects: [
        { type: 'grid', id: 'grid' },
        { type: 'axes', id: 'axes' },
        { type: 'point', id: 'V', coords: [2, -1], label: 'V' },
        { type: 'line', id: 'axis', expr: 'x=2', style: 'dashed' },
        { type: 'curve', id: 'curve', fx: '1*(x-(2))**2 + (-1)' },
        { type: 'text', id: 'form', pos: [-5.5, 5.5], text: 'y = (x-2)^2 - 1' },
      ],
      steps: [
        { reveal: ['grid', 'axes'] },
        { reveal: ['curve'] },
        { reveal: ['V', 'axis'], highlight: ['V', 'axis'], note: '頂点と軸を確認' },
      ],
    }),
  },
  {
    label: 'Tangent (x^2, x0=1)',
    make: () => ({
      preset: 'tangent_at_point',
      params: { f: 'x**2', x0: 1, xRange: [-5, 5] },
      bbox: [-6, 6, 6, -6],
      objects: [
        { type: 'grid', id: 'grid' },
        { type: 'axes', id: 'axes' },
        { type: 'curve', id: 'f', fx: 'x**2', xRange: [-5, 5] },
        { type: 'point', id: 'P', coords: [1, 1], label: 'P' },
        { type: 'line', id: 'tangent', expr: 'y=2*x+(-1)' },
        { type: 'text', id: 'form', pos: [-5.5, 5.5], text: 'f(x)=x^2,  x0=1,  f\'(x0)=2' },
      ],
      steps: [
        { reveal: ['grid', 'axes'] },
        { reveal: ['f'] },
        { reveal: ['P'], highlight: ['P'], note: '接点 P(x0,f(x0)) を確認' },
        { reveal: ['tangent'], highlight: ['tangent'], note: '接線 y = m x + b' },
      ],
    }),
  },
  {
    label: 'Riemann (x^2, mid, n=6)',
    make: () => ({
      preset: 'riemann_sum_left_right_mid',
      params: { f: 'x**2', a: 0, b: 3, n: 6, mode: 'mid' },
      bbox: [-1, 10, 4, -1],
      objects: [
        { type: 'grid', id: 'grid' },
        { type: 'axes', id: 'axes' },
        { type: 'curve', id: 'f', fx: 'x**2', xRange: [-0.5, 3.5] },
        // サンプルとして2本だけ長方形（本番はAPIが全段生成）
        { type: 'polygon', id: 'rect-0', points: [[0,0],[0,0.25],[0.5,0.25],[0.5,0]] },
        { type: 'polygon', id: 'rect-1', points: [[0.5,0],[0.5,0.5625],[1,0.5625],[1,0]] },
        { type: 'text', id: 'info', pos: [0, 9.2], text: 'Riemann mid, n=6' },
      ],
      steps: [{ reveal: ['grid', 'axes'] }, { reveal: ['f'] }, { reveal: ['rect-0','rect-1'], note: '長方形近似（例）' }],
    }),
  },
  {
    label: 'Inequality 1D',
    make: () => ({
      preset: 'inequality_region_1d',
      params: { expr: '(x-2)(x-3) ≤ 0' },
      bbox: [-1, 1, 7, -1],
      objects: [
        { type: 'axes', id: 'axes' },
        { type: 'text', id: 't', pos: [0, 0.5], text: '(x-2)(x-3) ≤ 0' },
        { type: 'point', id: 'r1', coords: [2, 0], label: '2' },
        { type: 'point', id: 'r2', coords: [3, 0], label: '3' },
        { type: 'segment', id: 'seg', ends: ['r1', 'r2'] },
      ],
      steps: [{ reveal: ['axes', 't'] }, { reveal: ['r1', 'r2', 'seg'], highlight: ['seg'] }],
    }),
  },
];

export default function VizSpecLabClient() {
  const [json, setJson] = useState<string>(JSON.stringify(PresetSamples[0].make(), null, 2));
  const [spec, setSpec] = useState<VizSpec | null>(PresetSamples[0].make());
  const [err, setErr] = useState<string | null>(null);

  const onApply = () => {
    try {
      const obj = JSON.parse(json);
      const parsed = VizSpecSchema.parse(obj);
      setSpec(parsed);
      setErr(null);
    } catch (e: any) {
      setErr(e.message ?? 'invalid');
      setSpec(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">VizSpec Sandbox</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {PresetSamples.map((p) => (
              <button
                key={p.label}
                className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setJson(JSON.stringify(p.make(), null, 2))}
              >
                {p.label}
              </button>
            ))}
          </div>

          <textarea
            className="w-full h-[400px] font-mono text-sm border rounded p-2"
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button onClick={onApply} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
              Apply
            </button>
            {err && <span className="text-red-600 text-sm">{err}</span>}
          </div>
        </div>

        <div className="border rounded p-2 bg-white">
          {spec ? (
            <VizRunner spec={spec} />
          ) : (
            <div className="text-sm text-gray-500">spec が不正です</div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">※ 開発用サンドボックスです。API や LLM 連携前の描画確認に使えます。</p>
    </div>
  );
}
