import { NextRequest, NextResponse } from 'next/server';
import { postJson } from '@/lib/serverFetch';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VERIFY_BASE = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:8081';

const EP: Record<string,string> = {
  line:     'overlay_line',
  circle:   'overlay_circle',
  parabola: 'overlay_parabola',
  ellipse:  'overlay_ellipse',
  hyperbola:'overlay_hyperbola',
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ shape: string }> }
) {
  try {
    const body = await req.json();
    const { shape } = await ctx.params;
    const key = shape;
    const ep = EP[key];
    if (!ep) return NextResponse.json({ ok:false, error:`unsupported shape: ${key}` }, { status: 400 });

    const data = await postJson<any>(`${VERIFY_BASE}/${ep}`, body, 20_000);
    return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' }});
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status: 500 });
  }
}
