// src/app/api/learn/tutorial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTutorial } from '@/server/learning/generate';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { skillId, objectives } = await req.json();
    if (!skillId || !Array.isArray(objectives) || objectives.length === 0) {
      return NextResponse.json({ error: 'skillId and objectives[] are required' }, { status: 400 });
    }

    const tutorial = await generateTutorial({ skillId, objectives });
    return NextResponse.json({ tutorial });
  } catch (e: any) {
    console.error('[api/learn/tutorial] error:', e?.message || e);
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
