import { NextRequest, NextResponse } from 'next/server';
import { postJson } from '@/lib/serverFetch';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VERIFY_BASE = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:8081';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await postJson<any>(`${VERIFY_BASE}/verify_solutions_interval`, body, 15_000);
    return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' }});
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message || e) }, { status: 500 });
  }
}
