import { NextRequest, NextResponse } from 'next/server';
import { callVerify } from '@/server/verify/client';
import type { VerifyType } from '@/server/verify/registry';

export async function POST(req: NextRequest) {
  const { type, payload } = await req.json();
  if (!type) return NextResponse.json({ ok:false, error:'missing type' }, { status:400 });
  const { ok, data } = await callVerify(type as VerifyType, payload);
  return NextResponse.json({ ok, result: data }, { status:200 });
}
