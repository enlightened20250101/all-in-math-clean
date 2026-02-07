import { NextRequest, NextResponse } from 'next/server';
import { nextItemForUser } from '@/server/learning/selector';
import { generateProblem } from '@/server/learning/generate';
import { critiqueLoop } from '@/server/learning/critic';
import { ProblemSchema } from '@/lib/zod-schemas';
import { db } from '@/server/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, preferredSkillId } = await req.json();

    // 1) 候補アイテムを探す
    let item = await nextItemForUser(userId, preferredSkillId);

    // 2) 見つからなかった場合のフォールバック（モック）
    if (!item) {
      item = {
        id: 'mock-1',
        skill_id: preferredSkillId ?? 'diff.chain',
        beta: 1500,
        difficulty: 3,
      };
    }

    // 3) 生成
    const raw = await generateProblem({
      skillId: item.skill_id,
      difficulty: item.difficulty as any,
    });

    // 4) 批評・修正
    const fixed = await critiqueLoop(raw, 2);
    const prob = ProblemSchema.parse(fixed);

    // 5) 保存
    await db.items.upsertGenerated(prob, { userId });

    return NextResponse.json({ item: prob });
  } catch (e: any) {
    console.error('[api/learn/next] error:', e);
    return NextResponse.json({ error: e.message || 'internal error' }, { status: 500 });
  }
}
