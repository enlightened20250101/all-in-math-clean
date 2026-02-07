'use client';
import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

type Props = { expr: string; varName?: string; domain?: [number, number]; num?: number };

export default function FunctionPreview({ expr, varName='x', domain=[-10,10], num=400 }: Props) {
  const [data, setData] = useState<{x:number; y:number|null}[]>([]);
  const [err, setErr] = useState<string|null>(null);
  const domainMemo = useMemo<[number, number]>(() => domain, [domain]);

  useEffect(() => {
    (async () => {
      setErr(null);
      const r = await fetch('/api/math/graph', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ expr, var: varName, domain: domainMemo, num })
      });
      const j = await r.json();
      if (!j.ok) { setErr(j.error ?? 'graph error'); return; }
      const rows = (j.points as [number, number|null][])?.map(([x,y]) => ({ x, y: y===null ? null : y }));
      setData(rows ?? []);
    })();
  }, [expr, varName, domainMemo, num]);

  if (err) return <div className="text-red-600 text-sm">Graph error: {err}</div>;
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={['auto','auto']} />
          <YAxis />
          <Tooltip />
          <Line dataKey="y" dot={false} isAnimationActive={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
