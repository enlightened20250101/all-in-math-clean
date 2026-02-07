'use client';
import { useEffect, useState } from 'react';
import GeometryOverlay from '@/components/graphs/GeometryOverlay';

export default function Page() {
  const [data, setData] = useState<{bbox:[number,number,number,number], layers:{label:string,points:[number|null,number|null][]}[]}|null>(null);
  const [error, setError] = useState<string|undefined>();

  useEffect(()=>{
    (async ()=>{
      setError(undefined);
      const r = await fetch('/api/math/overlay/line', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          ref_equation: '2*x + y + 1 = 0',
          user_equation:'y = -2*x - 1',
          bbox: { xmin:-5,xmax:5,ymin:-5,ymax:5 },
          num: 400
        })
      });
      const j = await r.json();
      if (!j.ok) { setError(j.error || 'overlay error'); return; }
      setData({ bbox: j.bbox, layers: j.layers });
    })();
  },[]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Line Overlay</h1>
      {error && <div className="text-red-600">{error}</div>}
      {data && <GeometryOverlay bbox={data.bbox} layers={data.layers} width={700} height={480} />}
    </div>
  );
}
