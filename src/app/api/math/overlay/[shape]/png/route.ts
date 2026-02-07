import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VERIFY_BASE = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:8081';
const ALLOWED = new Set(['line','circle','parabola','ellipse','hyperbola']);

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ shape: string }> }
) {
  const { shape } = await ctx.params;
  if (!ALLOWED.has(shape)) return NextResponse.json({ ok:false, error:`unsupported ${shape}` }, { status: 400 });
  try {
    const body = await req.json();
    // width/height/show_grid はクエリに出す（FastAPI は単一ボディ＋クエリに修正済み想定）
    const url = new URL(`${VERIFY_BASE}/overlay_${shape}_png`);
    url.searchParams.set('width', String(body?.width ?? 800));
    url.searchParams.set('height', String(body?.height ?? 600));
    url.searchParams.set('show_grid', body?.show_grid ? 'true' : 'false');
    const { width, height, show_grid, ...payload } = body ?? {};
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), cache:'no-store' });
    const data = await r.json().catch(()=>({ ok:false, error:'bad json from verify' }));
    return NextResponse.json(data, { status: r.ok ? 200 : 500 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 });
  }
}
