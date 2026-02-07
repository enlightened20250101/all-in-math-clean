import { NextResponse } from 'next/server';
import { verifyHealth } from '@/server/verify/client';

export async function GET() {
  const hv = await verifyHealth(); // VERIFY_BASE_URL/health を叩く
  return NextResponse.json({ ok: hv.ok, services: { mathVerify: hv.data ?? null } });
}
