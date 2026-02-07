'use client';
import { useEffect, useState } from 'react';
import GeometryOverlay from '@/components/graphs/GeometryOverlay';

type Layer = { label:string; points: Array<[number|null, number|null]> };
type OverlayResp = { ok:boolean; bbox:[number,number,number,number]; layers: Layer[]; error?:string };

export default function MathVerifyConsole() {
  // --- Solutions Interval ---
  const [solEq, setSolEq] = useState('sin(x)=1/2');
  const [solLower, setSolLower] = useState('0');
  const [solUpper, setSolUpper] = useState('2*pi');
  const [solExpected, setSolExpected] = useState('["pi/6","5*pi/6"]');
  const [solOut, setSolOut] = useState<any>(null);

  // --- Inequality Set ---
  const [ineqExpr, setIneqExpr] = useState('Abs(x-2) < 3');
  const [ineqExpected, setIneqExpected] = useState('["(-1,5)"]');
  const [ineqOut, setIneqOut] = useState<any>(null);

  // --- Overlay ---
  const [shape, setShape] = useState<'line'|'circle'|'parabola'|'ellipse'|'hyperbola'>('line');
  const [refEq, setRefEq] = useState('2*x + y + 1 = 0');
  const [userEq, setUserEq] = useState('y = -2*x - 1');
  const [bbox, setBbox] = useState({ xmin:-5, xmax:5, ymin:-5, ymax:5 });
  const [overlay, setOverlay] = useState<OverlayResp | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // --- Steps quick test ---
  const [stepsJson, setStepsJson] = useState(
    JSON.stringify({
      steps:[
        { src:"\\sin(3x)", dst:"\\sin(u)", let:["u=3x"] },
        { src:"\\sin(u)",  dst:"\\cos(u)", kind:"diff", var:"u" }
      ],
      vars:["x"]
    }, null, 2)
  );
  const [stepsOut, setStepsOut] = useState<any>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function runSolutions() {
    const r = await fetch('/api/verify/solutions-interval', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ equation: solEq, var:'x', lower: solLower, upper: solUpper, expected: JSON.parse(solExpected) })
    });
    setSolOut(await r.json());
  }

  async function runInequality() {
    const r = await fetch('/api/verify/inequality-set', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ expr: ineqExpr, var:'x', expected: JSON.parse(ineqExpected) })
    });
    setIneqOut(await r.json());
  }

  async function runOverlay() {
    const r = await fetch(`/api/math/overlay/${shape}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ref_equation: refEq, user_equation: userEq, bbox, num: shape==='hyperbola'?800:360 })
    });
    const j = await r.json();
    setOverlay(j.ok ? j : null);
    if (!j.ok) setToast(j.error || 'overlay error');
  }

  async function runSteps() {
    const r = await fetch('/api/learn/verify/grade_steps', { // もし学内のプロキシが無ければ /grade_steps を直接叩くルートを作ってね
      method:'POST', headers:{'Content-Type':'application/json'},
      body: stepsJson
    });
    setStepsOut(await r.json());
  }

  // shape デフォルト切替
  function presetShape(s: typeof shape) {
    setShape(s);
    if (s==='line')  { setRefEq('2*x + y + 1 = 0'); setUserEq('y = -2*x - 1'); setBbox({xmin:-5,xmax:5,ymin:-5,ymax:5}); }
    if (s==='circle'){ setRefEq('(x-1)^2 + (y+2)^2 = 13'); setUserEq('x^2+y^2-2*x+4*y-8=0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    if (s==='parabola'){ setRefEq('y - (-2) - (x-1)^2 = 0'); setUserEq('x - 3 - 2*(y+1)^2 = 0'); setBbox({xmin:-8,xmax:8,ymin:-8,ymax:8}); }
    if (s==='ellipse'){ setRefEq('(x-1)^2/9 + (y+2)^2/4 = 1'); setUserEq('x^2/9 + (y+2)^2/4 - 2*x/9 - 1/9 = 0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    if (s==='hyperbola'){ setRefEq('(x-1)^2/4 - (y+2)^2/9 = 1'); setUserEq('(x-1)^2/4 - (y+2)^2/9 - 1 = 0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    setOverlay(null);
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Math-Verify Console</h1>
      {toast ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700" role="status">
          {toast}
        </div>
      ) : null}

      {/* Solutions Interval */}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Solutions on Interval</h2>
        <div className="flex gap-2 flex-wrap">
          <input className="input" value={solEq} onChange={e=>setSolEq(e.target.value)} placeholder="equation e.g. sin(x)=1/2"/>
          <input className="input w-28" value={solLower} onChange={e=>setSolLower(e.target.value)} placeholder="lower"/>
          <input className="input w-28" value={solUpper} onChange={e=>setSolUpper(e.target.value)} placeholder="upper"/>
          <input className="input w-[320px]" value={solExpected} onChange={e=>setSolExpected(e.target.value)} placeholder='["...","..."]'/>
          <button className="btn" onClick={runSolutions}>Run</button>
        </div>
        {solOut && <pre className="p-2 bg-gray-50 rounded border">{JSON.stringify(solOut,null,2)}</pre>}
      </section>

      {/* Inequality Set */}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Inequality Set</h2>
        <div className="flex gap-2 flex-wrap">
          <input className="input w-[360px]" value={ineqExpr} onChange={e=>setIneqExpr(e.target.value)} />
          <input className="input w-[320px]" value={ineqExpected} onChange={e=>setIneqExpected(e.target.value)} />
          <button className="btn" onClick={runInequality}>Run</button>
        </div>
        {ineqOut && <pre className="p-2 bg-gray-50 rounded border">{JSON.stringify(ineqOut,null,2)}</pre>}
      </section>

      {/* Overlay */}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Geometry Overlay</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="input" value={shape} onChange={e=>presetShape(e.target.value as any)}>
            <option value="line">line</option>
            <option value="circle">circle</option>
            <option value="parabola">parabola</option>
            <option value="ellipse">ellipse</option>
            <option value="hyperbola">hyperbola</option>
          </select>
          <input className="input w-[360px]" value={refEq} onChange={e=>setRefEq(e.target.value)} />
          <input className="input w-[360px]" value={userEq} onChange={e=>setUserEq(e.target.value)} />
          <button className="btn" onClick={runOverlay}>Overlay</button>
        </div>
        {overlay && <GeometryOverlay bbox={overlay.bbox} layers={overlay.layers} width={720} height={460}/>}
      </section>

      {/* Steps */}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Steps grading</h2>
        <div className="flex gap-2">
          <textarea className="input w-[700px] h-[160px] font-mono" value={stepsJson} onChange={e=>setStepsJson(e.target.value)} />
          <button className="btn h-[160px]" onClick={runSteps}>Grade</button>
        </div>
        {stepsOut && <pre className="p-2 bg-gray-50 rounded border">{JSON.stringify(stepsOut,null,2)}</pre>}
      </section>

      <style jsx>{`
        .input { border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; }
        .btn { background:#111827; color:#fff; border-radius:8px; padding:6px 12px; }
      `}</style>
    </div>
  );
}
