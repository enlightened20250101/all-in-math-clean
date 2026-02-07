// src/server/learning/selector.ts
import { db } from '@/server/db'; // 既存のSupabase/Prisma等に合わせて
type Item = { id: string; skill_id: string; beta: number; difficulty: number; };

export async function getUserTheta(userId: string) {
  // 直近の能力推定を取得（無ければ0を返す）
  const row = await db.ability_history.findLatest(userId);
  return row?.theta ?? 0;
}
export function winProb(theta: number, beta: number) {
  // Eloの勝率
  return 1 / (1 + Math.pow(10, (beta - theta) / 400));
}
export function nextReviewDue(now: number, lastSeen: number, intervalDays: number) {
  return lastSeen + intervalDays * 86400_000;
}

export async function nextItemForUser(userId: string, skillId?: string) {
  const theta = await getUserTheta(userId);
  const candidates: Item[] = await db.items.findCandidates({ userId, skillId });
  const now = Date.now();

  const reviewMap = new Map<string, { intervalDays: number; lastSeen: number } | null>();
  await Promise.all(
    candidates.map(async (it) => {
      const rv = await db.repetition.get(userId, it.id);
      reviewMap.set(it.id, rv ?? null);
    })
  );

  // p帯スコア: 0.55–0.75を高評価、外れるほどペナルティ
  const score = (it: Item) => {
    const p = winProb(theta, it.beta);
    const bandCenter = 0.65;
    const bandWidth = 0.10;
    const bandLoss = Math.abs(p - bandCenter) / bandWidth; // 0で理想
    // SM-2復習（期限が近い/超過はボーナス）
    const rv = reviewMap.get(it.id) ?? null; // { intervalDays, lastSeen }
    const due = rv ? nextReviewDue(now, rv.lastSeen, rv.intervalDays) - now : Infinity;
    const reviewBoost = rv ? Math.max(0, 1 - Math.tanh(Math.max(0, due) / 86400_000)) : 0;
    return -bandLoss + reviewBoost;
  };

  candidates.sort((a,b) => score(b) - score(a));
  return candidates[0];
}
