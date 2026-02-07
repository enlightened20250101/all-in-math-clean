// src/app/learn/actions.ts
'use server';

/**
 * 学習チュータのサーバーアクション（Next.js Server Actions）
 * - OpenAI 連携（JSON強制）
 * - /articles 推薦（LIKEベースのMVP）
 * - 体験枠 → 月額枠 → クレジット の優先順で消費
 * - 理解度推定 & 難易度自動調整
 */

import OpenAI from 'openai';
import type { TutorTurnOutput } from '@/app/learn/aiTypes';
import { TutorTurnIn } from '@/app/learn/aiTypes';
import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';

// ==============================
// 設定（必要に応じて調整）
// ==============================

/** 既定モデル（コスパ良） */
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

/** 1クレジットあたりの「概算トークン」換算（前払いクレジット運用のため） */
const CREDIT_UNIT_TOKENS = 5_000;

/** 1日あたりのハード上限（悪用/バグ対策の安全弁）。0 で無効 */
const DAILY_HARD_LIMIT_TOKENS = 200_000;

/** 今月枠を超えたときの動作：false=超えたらブロック / true=超えた分はクレジット消費 */
const ALLOW_OVERAGE_WITH_CREDITS = true;

// 入出力スキーマは aiTypes から利用

// ==============================
// メインアクション
// ==============================

export async function tutorTurn(formData: FormData): Promise<TutorTurnOutput> {
  const sessionId = Number(formData.get('sessionId'));
  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    throw new Error('invalid-session-id');
  }
  const rawContext = formData.get('context');
  let parsedContext: unknown = undefined;
  if (rawContext) {
    try {
      parsedContext = JSON.parse(String(rawContext));
    } catch {
      throw new Error('invalid-context-json');
    }
  }
  const input = TutorTurnIn.parse({
    intent: formData.get('intent'),
    topic: formData.get('topic'),
    context: parsedContext,
    sessionId,
  } as any);

  const supabase = createServerActionClient({ cookies });

  // 認証
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');

  // セッション所有者チェック（他人の session_id を使わせない）
  const { data: sessionRow, error: sessionErr } = await supabase
    .from('learning_sessions')
    .select('user_id')
    .eq('id', sessionId)
    .maybeSingle();
  if (sessionErr) throw new Error('session-fetch-failed');
  if (!sessionRow || sessionRow.user_id !== user.id) throw new Error('unauthorized');

  // プロフィール取得（無ければ作る）
  let { data: prof } = await supabase
    .from('learning_profiles')
    .select(
      'user_id, level, background, tokens_quota, credits, plan, plan_price_id, plan_renews_on, monthly_quota_limit, monthly_quota_used'
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (!prof) {
    await supabase.from('learning_profiles').insert({ user_id: user.id, tokens_quota: 5000, credits: 0 });
    ({ data: prof } = await supabase
      .from('learning_profiles')
      .select(
        'user_id, level, background, tokens_quota, credits, plan, plan_price_id, plan_renews_on, monthly_quota_limit, monthly_quota_used'
      )
      .eq('user_id', user.id)
      .maybeSingle());
  }
  if (!prof) throw new Error('profile-init-failed');

  // 日次ハード上限チェック（ビューは省略。簡易：messagesの当日token_cost合計）
  if (DAILY_HARD_LIMIT_TOKENS > 0) {
    const { data: todaySum } = await supabase
      .from('learning_messages')
      .select('token_cost')
      .eq('session_id', sessionId)
      .gte('created_at', new Date(new Date().toDateString()).toISOString()); // 今日0:00以降
    const usedToday =
      (todaySum ?? []).reduce((acc: number, r: any) => acc + (Number(r.token_cost || 0) || 0), 0) || 0;
    if (usedToday >= DAILY_HARD_LIMIT_TOKENS) {
      return { type: 'paywall', message: '本日の利用上限に達しました。明日またご利用ください。' };
    }
  }

  // 記事推薦（LIKEベースのMVP）
  const links = await getArticleRecos(supabase, sessionId, input.topic ?? '');

  // 直近の提出ログから理解度推定
  const { data: recentAttempts } = await supabase
    .from('learning_attempts')
    .select('correct, score, difficulty, hints_used')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(30);

  const mastery = estimateMastery(recentAttempts ?? []);
  const decidedDifficulty = decideDifficulty((input as any).context?.difficulty ?? 'auto', mastery);

  // OpenAI 呼び出し（JSON縛り）
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const sys = [
    'You are an excellent math tutor for Japanese learners.',
    'Always respond with STRICT JSON that matches the requested schema.',
    'Prefer step-by-step reasoning in explanations and provide short, actionable hints.',
  ].join('\n');

  const promptPayload = {
    intent: input.intent,
    topic: input.topic,
    difficulty: decidedDifficulty,
    mastery, // 0-1
    links, // /articles からの候補
    context: (input as any).context ?? {},
    schema: 'TutorTurnOutput',
    language: 'ja',
    guidelines: {
      personalization: 'ユーザーの誤り傾向（符号・式展開・置換の選択など）に言及',
      exercise_format: 'items: [{prompt, answer}]（採点用に厳密表記）',
      hint_style: '最小ヒント→段階ヒント（1→2→3）',
      check_rubric: '正答/部分点/典型ミス/次の難易度提案 nextDifficulty',
    },
  };

  // 課金前チェック（枠/残高が無いなら即ブロック）
  const guard = checkAndMaybeBlockBeforeCall(prof);
  if (guard.block) {
    return { type: 'paywall', message: guard.reason ?? '残高・枠が不足しています。' };
  }

  const resp = await client.chat.completions.create({
    model: DEFAULT_OPENAI_MODEL,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: JSON.stringify(promptPayload) },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const content = resp.choices[0].message.content || '{}';
  let out: TutorTurnOutput;
  try {
    out = JSON.parse(content) as TutorTurnOutput;
  } catch {
    // フォールバック（モデルが壊れた時用）
    out = { type: 'explain', text: '解析に失敗しました。もう一度お試しください。', links: [] };
  }

  // 概算コスト（超ざっくり：文字数/3 ≒ トークン）
  const estTokens = Math.ceil((JSON.stringify(promptPayload).length + content.length) / 3);

  // 消費の反映（優先：月額枠→体験枠→クレジット）
  await consumeBalances(supabase, user.id, prof, estTokens);

  // ログ保存（メッセージ）
  await supabase.from('learning_messages').insert({
    session_id: sessionId,
    role: 'assistant',
    content: out as any,
    token_cost: estTokens,
  });

  // 採点結果なら attempts にも保存 & mastery更新
  if (out.type === 'check') {
    const isCorrect =
      (out as any).correct ??
      ((out as any).verdict ? (out as any).verdict === 'correct' : (out as any).score >= 1);
    await supabase.from('learning_attempts').insert({
      session_id: sessionId,
      topic_slug: input.topic,
      exercise_id: out.exerciseId,
      difficulty: decidedDifficulty,
      user_answer: (input as any).context?.userAnswer ?? '',
      correct: isCorrect,
      score: out.score,
      hints_used: 0, // TODO: hint使用は別Intentで加算運用にするならここ更新
      feedback: out.feedback,
    });

    const newMastery = estimateMastery((recentAttempts ?? []).concat([
      { correct: isCorrect, score: out.score, difficulty: decidedDifficulty, hints_used: 0 },
    ] as any));
    await supabase
      .from('learning_sessions')
      .update({ mastery: newMastery, updated_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  return out;
}

// ==============================
// 補助関数
// ==============================

/** /articles 推薦（MVP：LIKE） */
async function getArticleRecos(supabase: any, sessionId: number, topic: string) {
  const { data: cached } = await supabase
    .from('learning_recos')
    .select('articles')
    .eq('session_id', sessionId)
    .eq('topic_slug', topic)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cached?.articles) return cached.articles;

  const like = `%${topic.replace(/[-_]/g, ' ')}%`;
  const [{ data: a1 }, { data: a2 }] = await Promise.all([
    supabase.from('articles').select('id,slug,title').ilike('title', like).limit(5),
    supabase.from('articles').select('id,slug,title').ilike('tags', like).limit(5),
  ]);

  const merged = [...(a1 ?? []), ...(a2 ?? [])]
    .filter((v, i, self) => self.findIndex((w: any) => w.id === v.id) === i)
    .slice(0, 5);

  await supabase.from('learning_recos').insert({ session_id: sessionId, topic_slug: topic, articles: merged });
  return merged;
}

/** 理解度推定（正答/難易度/ヒント使用から 0-1） */
function estimateMastery(rows: Array<{ correct: boolean; score: number; difficulty?: string; hints_used?: number }>) {
  if (!rows.length) return 0;
  let w = 0;
  let s = 0;
  for (const r of rows) {
    const diff = r.difficulty === 'hard' ? 1.2 : r.difficulty === 'medium' ? 1.0 : 0.8;
    const hintPenalty = Math.max(0.7, 1 - 0.1 * (r.hints_used ?? 0));
    const base = r.correct ? 1 : r.score ?? 0;
    s += base * diff * hintPenalty;
    w += 1;
  }
  return Math.max(0, Math.min(1, s / w));
}

/** 難易度決定：auto → mastery で切替 */
function decideDifficulty(req: 'auto' | 'easy' | 'medium' | 'hard', mastery: number): 'easy' | 'medium' | 'hard' {
  if (req !== 'auto') return req;
  if (mastery < 0.4) return 'easy';
  if (mastery < 0.75) return 'medium';
  return 'hard';
}

/** 呼び出し前の枠/残高チェック（ブロックすべきか） */
function checkAndMaybeBlockBeforeCall(prof: any): { block: boolean; reason?: string } {
  const planLimit = prof?.monthly_quota_limit ?? 0;
  const planUsed = prof?.monthly_quota_used ?? 0;
  const trial = prof?.tokens_quota ?? 0;
  const credits = prof?.credits ?? 0;

  // 月額枠あり & まだ余裕がある → 実行OK
  if (planLimit > 0 && planUsed < planLimit) return { block: false };

  // 月額枠が枯渇：体験枠があればOK
  if (trial > 0) return { block: false };

  // クレジットがあればOK（ないならブロック）
  if (credits > 0) return { block: false };

  return { block: true, reason: '月額枠・体験枠・クレジットがありません。' };
}

/** 消費の反映（優先：月額枠→体験枠→クレジット） */
async function consumeBalances(
  supabase: any,
  userId: string,
  prof: any,
  estTokens: number
) {
  if (estTokens <= 0) return;
  let planLimit = prof?.monthly_quota_limit ?? 0;
  let planUsed = prof?.monthly_quota_used ?? 0;
  let trial = prof?.tokens_quota ?? 0;
  let credits = prof?.credits ?? 0;

  // 1) 月額枠から
  if (planLimit > 0 && planUsed < planLimit) {
    const room = planLimit - planUsed;
    if (estTokens <= room) {
      planUsed += estTokens;
      await supabase
        .from('learning_profiles')
        .update({ monthly_quota_used: planUsed })
        .eq('user_id', userId);
      return;
    } else {
      // 使い切り & 残りを次へ
      planUsed = planLimit;
      await supabase
        .from('learning_profiles')
        .update({ monthly_quota_used: planUsed })
        .eq('user_id', userId);

      const remain = estTokens - room;
      // 枠超過分は体験枠 or クレジットに回す
      await consumeBalances(supabase, userId, { ...prof, monthly_quota_limit: planLimit, monthly_quota_used: planUsed }, remain);
      return;
    }
  }

  // 2) 体験枠から
  if (trial > 0) {
    if (estTokens <= trial) {
      const t = Math.max(0, trial - estTokens);
      await supabase.from('learning_profiles').update({ tokens_quota: t }).eq('user_id', userId);
      return;
    }
    // 使い切って残りを次へ
    await supabase.from('learning_profiles').update({ tokens_quota: 0 }).eq('user_id', userId);
    const remain = estTokens - trial;
    await consumeBalances(
      supabase,
      userId,
      { ...prof, tokens_quota: 0 },
      remain
    );
    return;
  }

  // 3) クレジットから（CREDIT_UNIT_TOKENS ごとに 1 クレジット消費）
  if (credits > 0) {
    const needCredits = Math.max(1, Math.ceil(estTokens / CREDIT_UNIT_TOKENS));
    if (credits >= needCredits) {
      await supabase
        .from('learning_profiles')
        .update({ credits: credits - needCredits })
        .eq('user_id', userId);
      return;
    } else {
      // 足りない → 使い切ってブロック寄りだが、ここは最小限で消費して残りは無視（MVP）
      await supabase
        .from('learning_profiles')
        .update({ credits: 0 })
        .eq('user_id', userId);
      return;
    }
  }

  // 4) どの枠もない → 何もしない（呼出し前にブロック済み想定）
}
