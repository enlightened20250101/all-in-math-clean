import { NextRequest, NextResponse } from 'next/server';
import { runTutorTurnServer } from '@/app/learn/_server/runTutorTurn.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const out = await runTutorTurnServer(payload);
    return NextResponse.json(out, { status: 200 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 });
  }
}
