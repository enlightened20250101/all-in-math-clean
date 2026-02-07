// src/app/api/learn/verify/health/route.ts
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const VERIFY_BASE = process.env.VERIFY_BASE_URL ?? 'http://127.0.0.1:8081';

export async function GET() {
  try {
    const r = await fetch(`${VERIFY_BASE}/health`, { cache:'no-store' });
    const j = await r.json();
    return NextResponse.json({ ok:true, backend: j }, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
