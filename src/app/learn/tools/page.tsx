'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TutorMsg } from '@/app/learn/aiTypes';

const GeometryOverlay = dynamic(() => import('@/components/graphs/GeometryOverlay'), { ssr: false });
const TeachView = dynamic(() => import('@/app/learn/components/TeachView'), { ssr: false });

type Point = [number|null, number|null];
type Layer = { label:string; points: Point[] };
type OverlayResp = { ok:boolean; bbox:[number,number,number,number]; layers: Layer[]; error?:string };

export default function LearnToolsPage() {
  // teach タブを追加
  const [tab, setTab] = useState<'teach'|'interval'|'ineq'|'steps'|'geometry'|'transform'>('teach');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">検証ツール</h1>
      {toast ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700" role="status">
          {toast}
        </div>
      ) : null}

      <div className="flex gap-2 flex-wrap">
        {(['teach','interval','ineq','steps','geometry','transform'] as const).map((t)=>(
          <button key={t}
            className={`px-3 py-1.5 rounded ${tab===t?'bg-black text-white':'bg-gray-100'}`}
            onClick={()=>setTab(t)}
          >
            {{teach:'TeachViewテスト', interval:'区間解', ineq:'解集合', steps:'ステップ採点', geometry:'幾何オーバーレイ', transform:'関数変換'}[t]}
          </button>
        ))}
      </div>

      {tab==='teach'    && <TeachHarness />}
      {tab==='interval' && <IntervalTool />}
      {tab==='ineq'     && <InequalitySetTool />}
      {tab==='steps'    && <StepsTool />}
      {tab==='geometry' && <GeometryTool onError={setToast} />}
      {tab==='transform'&& <TransformTool />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TeachView 動作確認タブ
   - 「もっと詳しく」→ /api/learn/run（新UI）
   - 「図で見たい」→ /api/anim → VizRunner
   - 「解法を表示」→ /api/learn/run（新UI）
   OPENAI_API_KEY が未設定でも「図で見たい」は動きます。
   ───────────────────────────────────────────── */
function TeachHarness() {
  const seedMsgs: TutorMsg[] = useMemo(() => [
    {
      id: 'seed-1',
      kind: 'explain',
      detail_level: 1,
      message_md:
        `二次関数 $y=ax^2+bx+c$ の**平方完成**は、$y=a(x-h)^2+k$ の形に直す操作です。\n\n` +
        `- 目的: 頂点$(h,k)$ と軸$x=h$が一目で分かる\n` +
        `- コツ: $b$ の半分を使って $(x-\\frac{b}{2a})^2$ を作る\n\n` +
        `\\boxed{y=a(x-h)^2+k}`,
      actions: ['show_more','draw_diagram','show_full_solution','next_problem'],
    }
  ], []);

  const sections = [
    { key: 's1', title: '平方完成の基本', body: '二次関数 $y=ax^2+bx+c$ を $y=a(x-h)^2+k$ に変形します。' },
    { key: 's2', title: '頂点と軸',    body: '頂点は $(h,k)$、軸は $x=h$ です。' },
  ];

  return (
    <div className="rounded-2xl border p-4 space-y-4">
      <p className="text-sm text-gray-600">
        ボタン挙動：<strong>もっと詳しく</strong>→/api/learn/run（新UI） / <strong>図で見たい</strong>→/api/anim→VizRunner / <strong>解法を表示</strong>→/api/learn/run（teach）
      </p>
      <TeachView
        sections={sections}
        examples={[]}
        exercises={[]}
        nextCandidates={[]}
        tutorMsgs={seedMsgs}
        sessionId="dev-session"
      />
    </div>
  );
}

/* ---- 区間解 ---- */
function IntervalTool() {
  const [eq, setEq] = useState('sin(x)=1/2');
  const [lower, setLower] = useState('0');
  const [upper, setUpper] = useState('2*pi');
  const [expected, setExpected] = useState('["pi/6","5*pi/6"]');
  const [out, setOut] = useState<any>(null);
  async function run() {
    const r = await fetch('/api/verify/solutions-interval', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ equation:eq, var:'x', lower, upper, expected: JSON.parse(expected) })
    });
    setOut(await r.json());
  }
  return (
    <Section title="区間内の解 (solve on interval)">
      <Row><Input value={eq} onChange={setEq} label="equation" /></Row>
      <Row>
        <Input value={lower} onChange={setLower} label="lower" className="w-40"/>
        <Input value={upper} onChange={setUpper} label="upper" className="w-40"/>
        <Input value={expected} onChange={setExpected} label="expected JSON" className="w-[360px]"/>
        <Btn onClick={run}>Run</Btn>
      </Row>
      <Pre data={out}/>
    </Section>
  );
}

/* ---- 不等式の解集合 ---- */
function InequalitySetTool() {
  const [expr, setExpr] = useState('Abs(x-2) < 3');
  const [expected, setExpected] = useState('["(-1,5)"]');
  const [out, setOut] = useState<any>(null);
  async function run() {
    const r = await fetch('/api/verify/inequality-set', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ expr, var:'x', expected: JSON.parse(expected) })
    });
    setOut(await r.json());
  }
  return (
    <Section title="不等式の解集合 (inequality set)">
      <Row>
        <Input value={expr} onChange={setExpr} label="expr" className="w-[420px]"/>
        <Input value={expected} onChange={setExpected} label="expected[] (JSON)" className="w-[360px]"/>
        <Btn onClick={run}>Run</Btn>
      </Row>
      <Pre data={out}/>
    </Section>
  );
}

/* ---- ステップ採点 ---- */
function StepsTool() {
  const [json, setJson] = useState(JSON.stringify({
    steps:[
      { src:"\\sin(3x)", dst:"\\sin(u)", let:["u=3x"] },
      { src:"\\sin(u)",  dst:"\\cos(u)", kind:"diff", var:"u" }
    ],
    vars:["x"]
  }, null, 2));
  const [out, setOut] = useState<any>(null);
  async function run() {
    const r = await fetch('/api/learn/verify/grade_steps', { method:'POST', headers:{'Content-Type':'application/json'}, body: json });
    setOut(await r.json());
  }
  return (
    <Section title="ステップ採点 (grade_steps)">
      <Row>
        <textarea className="input w-[720px] h-[160px] font-mono" value={json} onChange={e=>setJson(e.target.value)}/>
        <Btn onClick={run}>Grade</Btn>
      </Row>
      <Pre data={out}/>
    </Section>
  );
}

/* ---- 幾何オーバーレイ ---- */
function GeometryTool({ onError }: { onError: (message: string) => void }) {
  const [shape, setShape] = useState<'line'|'circle'|'parabola'|'ellipse'|'hyperbola'>('line');
  const [refEq, setRefEq] = useState('2*x + y + 1 = 0');
  const [userEq, setUserEq] = useState('y = -2*x - 1');
  const [bbox, setBbox] = useState({ xmin:-5, xmax:5, ymin:-5, ymax:5 });
  const [overlay, setOverlay] = useState<OverlayResp | null>(null);

  function preset(s: typeof shape) {
    setShape(s);
    if (s==='line'){ setRefEq('2*x + y + 1 = 0'); setUserEq('y=-2*x-1'); setBbox({xmin:-5,xmax:5,ymin:-5,ymax:5}); }
    if (s==='circle'){ setRefEq('(x-1)^2+(y+2)^2=13'); setUserEq('x^2+y^2-2*x+4*y-8=0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    if (s==='parabola'){ setRefEq('y - (-2) - (x-1)^2 = 0'); setUserEq('x - 3 - 2*(y+1)^2 = 0'); setBbox({xmin:-8,xmax:8,ymin:-8,ymax:8}); }
    if (s==='ellipse'){ setRefEq('(x-1)^2/9 + (y+2)^2/4 = 1'); setUserEq('x^2/9 + (y+2)^2/4 - 2*x/9 - 1/9 = 0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    if (s==='hyperbola'){ setRefEq('(x-1)^2/4 - (y+2)^2/9 = 1'); setUserEq('(x-1)^2/4 - (y+2)^2/9 - 1 = 0'); setBbox({xmin:-10,xmax:10,ymin:-10,ymax:10}); }
    setOverlay(null);
  }

  async function run() {
    const r = await fetch(`/api/math/overlay/${shape}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ref_equation: refEq, user_equation: userEq, bbox, num: shape==='hyperbola'?800:360 })
    });
    const j = await r.json();
    setOverlay(j.ok ? j : null);
    if (!j.ok) onError(j.error || 'overlay error');
  }

  return (
    <Section title="幾何オーバーレイ">
      <Row className="items-center">
        <select className="input" value={shape} onChange={e=>preset(e.target.value as any)}>
          <option value="line">line</option><option value="circle">circle</option>
          <option value="parabola">parabola</option><option value="ellipse">ellipse</option>
          <option value="hyperbola">hyperbola</option>
        </select>
        <Input value={refEq} onChange={v=>setRefEq(v)} label="ref" className="w-[360px]"/>
        <Input value={userEq} onChange={v=>setUserEq(v)} label="user" className="w-[360px]"/>
        <Btn onClick={run}>Overlay</Btn>
      </Row>
      {overlay && <GeometryOverlay bbox={overlay.bbox} layers={overlay.layers} width={720} height={460}/>}
    </Section>
  );
}

/* ---- 関数変換 ---- */
function TransformTool() {
  const [base, setBase] = useState('sin(x)');
  const [target, setTarget] = useState('2*sin(3*(x-1))+4');
  const [a, setA] = useState('2'); const [b, setB] = useState('3');
  const [h, setH] = useState('1'); const [k, setK] = useState('4');
  const [out, setOut] = useState<any>(null);
  async function run() {
    const r = await fetch('/api/verify/function-transform', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ base, target, var:'x', a, b, h, k })
    });
    setOut(await r.json());
  }
  return (
    <Section title="関数の変換 (a·f(b(x-h))+k)">
      <Row><Input value={base} onChange={setBase} label="base f(x)" className="w-[360px]"/><Input value={target} onChange={setTarget} label="target g(x)" className="w-[360px]"/></Row>
      <Row><Input value={a} onChange={setA} label="a" className="w-28"/><Input value={b} onChange={setB} label="b" className="w-28"/><Input value={h} onChange={setH} label="h" className="w-28"/><Input value={k} onChange={setK} label="k" className="w-28"/><Btn onClick={run}>Check</Btn></Row>
      <Pre data={out}/>
    </Section>
  );
}

/* ---- 小物UI ---- */
function Section({title, children}:{title:string; children:any}) {
  return <section className="space-y-3">
    <h3 className="text-lg font-medium">{title}</h3>
    {children}
  </section>;
}
function Row({children, className}:{children:any; className?:string}) {
  return <div className={`flex gap-2 flex-wrap ${className||''}`}>{children}</div>;
}
function Input({value,onChange,label,className}:{value:any; onChange:(v:string)=>void; label?:string; className?:string}) {
  return <label className={`flex items-center gap-2 ${className||''}`}>
    {label && <span className="text-sm text-gray-600 w-28">{label}</span>}
    <input className="input border rounded px-2 py-1" value={value} onChange={e=>onChange(e.target.value)} />
  </label>;
}
function Btn({onClick, children}:{onClick:()=>void; children:any}) {
  return <button className="px-3 py-1.5 rounded bg-black text-white" onClick={onClick}>{children}</button>;
}
function Pre({data}:{data:any}) {
  if (!data) return null;
  return <pre className="p-2 bg-gray-50 rounded border whitespace-pre-wrap break-all">{JSON.stringify(data,null,2)}</pre>;
}
