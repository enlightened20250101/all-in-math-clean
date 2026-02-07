// src/app/api/learn/run/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  runTutorTurnServer,
  type TutorInput,
} from '@/app/learn/_server/runTutorTurn.server';

import type {
  TutorMsg,
  TutorNextRequest,
  TutorNextResponse,
} from '@/app/learn/aiTypes';

import { appendTutorHistory } from '@/server/learning/history';

/* =======================================================
 * 既存UI（input: TutorInput）→ 従来の normalizeForUI を維持
 * 新UI（TutorNextRequest）→ TutorMsg[] を返す
 * ===================================================== */

/** 既存UI用：UIが必要とする形に強制整形（意図ごとに最低限のキーを埋める） */
function normalizeForUI(intent: TutorInput['intent'], raw: any) {
  const out: any = { ...raw };
  out.type = out.type ?? intent;

  // 共通
  out.text = typeof out.text === 'string'
    ? out.text
    : (typeof out.message === 'string' ? out.message : '');
  out.links = Array.isArray(out.links) ? out.links : [];

  // example
  if (intent === 'example') {
    let items = Array.isArray(out.items) ? out.items
               : Array.isArray(out.examples) ? out.examples
               : [];
    items = items.map((q: any, i: number) =>
      typeof q === 'string'
        ? ({ id: `ex${i+1}`, prompt: q, answer: '' })
        : ({
            id: q.id ?? `ex${i+1}`,
            prompt: q.prompt ?? String(q ?? ''),
            answer: q.answer ?? q.solution ?? q.answer_latex ?? '',
          })
    );
    out.items = items;
  }

  // exercise
  if (intent === 'exercise') {
    let items = Array.isArray(out.items) ? out.items
      : Array.isArray(out.questions) ? out.questions
      : [];
    items = items.map((q: any, i: number) =>
      typeof q === 'string'
        ? ({ id: `q${i + 1}`, prompt: q, answer: '' })
        : ({
            id: q.id ?? `q${i + 1}`,
            prompt: q.prompt ?? String(q ?? ''),
            answer: typeof q.answer === 'string' ? q.answer : '',
          }),
    );
    if (!items.length && out.text) {
      items = [{ id: 'q1', prompt: out.text, answer: '' }];
    }
    out.items = items;

    if (Array.isArray(out.hint)) out.hint = out.hint;
    else if (typeof out.hint === 'string') out.hint = [out.hint];
    else if (typeof out.hints === 'string') out.hint = [out.hints];
    else out.hint = [];
  }

  // hint
  if (intent === 'hint') {
    if (Array.isArray(out.hint)) out.hint = out.hint;
    else if (typeof out.hint === 'string') out.hint = [out.hint];
    else out.hint = out.text ? [out.text] : [];
  }

  // next
  if (intent === 'next') {
    if (typeof out.topic !== 'string') out.topic = '';
    if (typeof out.why !== 'string') out.why = out.text || '';
  }

  // check（保険）
  if (intent === 'check') {
    out.feedback = typeof out.feedback === 'string' ? out.feedback : (out.text || '');
    out.userAnswers = Array.isArray(out.userAnswers) ? out.userAnswers : [];
    out.solutions = Array.isArray(out.solutions) ? out.solutions : [];
    if (typeof out.correct !== 'boolean' && typeof out.score === 'number') {
      out.correct = out.score >= 1;
    }
  }

  return out;
}

/* ==========================
 * 新UI用：段階的開示ハンドラ
 * ========================== */

/** 簡易ID */
const mkId = (p: string) => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** 内部 /api/anim を呼ぶためのベースURL（Edge/Node両対応） */
function getBaseUrl(req: Request): string {
  try {
    const u = new URL(req.url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

/** 空カード防止のフォールバック */
const safeText = (
  raw: any,
  fallback = 'うまく説明を取得できませんでした。もう一度試すか、もう少し具体的に質問してみてください。'
) => {
  const t = (typeof raw?.message_md === 'string' && raw.message_md) ||
            (typeof raw?.text === 'string' && raw.text) ||
            (typeof raw?.message === 'string' && raw.message) ||
            '';
  const s = t.trim();
  return s.length ? s : fallback;
};

/** 新UIハンドラ：TutorNextRequest -> TutorMsg[] */
async function handleNext(req: Request, body: TutorNextRequest) {
  const { action, detail_level, user_answer_md } = body;
  const messages: TutorMsg[] = [];

  // 既存オーケストレータに寄せるためのヘルパ
  async function callTutor(input: Partial<TutorInput>): Promise<any> {
    const tutorInput: TutorInput = {
      intent: (input.intent ?? 'explain') as TutorInput['intent'],
      text: (input.text ?? user_answer_md ?? '') as string,
      topic: (input.topic ?? '') as string,
      topics: input.topics as string[] | undefined,
      methods: input.methods as string[] | undefined,
      count: input.count as number | undefined,
      exercise: input.exercise as any,
      user: input.user as any,
      // ★ ユーザープリファレンスを優先して渡す
      prefs: {
        detailLevel: body?.prefs?.detailLevel ?? detail_level ?? 1,
        difficulty:  body?.prefs?.difficulty,
        rigor:       body?.prefs?.rigor,
        languageLevel: body?.prefs?.languageLevel,
        ...(input.prefs || {}),
      } as any,
      // 将来サーバでスライスする時用に保持しておく（いまはLLMに context として渡す）
      sessionId: (body as any)?.sessionId as any,
    };
    return runTutorTurnServer(tutorInput, { sessionId: (body as any)?.sessionId });
  }

  // アクション別
  switch (action) {
    case 'show_more': {
      const raw = await callTutor({ intent: 'explain' });
      const text = safeText(raw);
      messages.push({
        id: mkId('explain'),
        kind: 'explain',
        detail_level: (detail_level ?? 1) as 1|2|3,
        message_md: text,
        actions: ['show_more','draw_diagram','show_full_solution','next_problem'],
      });
      break;
    }

    case 'show_full_solution': {
      const raw = await callTutor({ intent: 'teach' });
      const text = safeText(raw, '解法の取得に失敗しました。もう一度お試しください。');
      messages.push({
        id: mkId('solution'),
        kind: 'solution',
        detail_level: (detail_level ?? 2) as 1|2|3,
        message_md: text,
        actions: ['next_problem'],
      });
      break;
    }

    case 'draw_diagram': {
      // 現状はサーバ内で /api/anim を内部呼び出し（将来はフロント直叩きに統一してもOK）
      const base = getBaseUrl(req);
      const r = await fetch(`${base}/api/anim`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ summary: (user_answer_md ?? 'diagram request') }),
      });
      const j = await r.json().catch(()=>null);
      if (j?.ok && j?.spec) {
        messages.push({
          id: mkId('diagram'),
          kind: 'diagram',
          detail_level: (detail_level ?? 1) as 1|2|3,
          diagram: j.spec,
          actions: ['show_more','show_full_solution','next_problem'],
        });
      } else {
        return NextResponse.json({ ok:false, error:'diagram generation failed' }, {
          status: 200,
          headers: { 'Cache-Control': 'no-store' },
        });
      }
      break;
    }

    case 'next_problem': {
      const raw = await callTutor({ intent: 'next' });
      const topic = (raw?.topic && String(raw.topic)) || (raw?.text && String(raw.text)) || '';
      messages.push({
        id: mkId('next'),
        kind: 'explain',
        detail_level: 1,
        message_md: `次に進むトピック: **${topic || '（未定）'}**`,
        actions: ['show_more','draw_diagram'],
      });
      break;
    }

    case 'ask_leading_question': {
      const raw = await callTutor({ intent: 'hint' });
      const text = typeof raw?.hint === 'string'
        ? raw.hint
        : Array.isArray(raw?.hint) ? raw.hint.join('\n') : safeText(raw, '次の一手を考えてみよう。');
      messages.push({
        id: mkId('hint'),
        kind: 'hint',
        detail_level: (detail_level ?? 1) as 1|2|3,
        message_md: text,
        actions: ['show_more','draw_diagram','show_full_solution'],
      });
      break;
    }

    case 'ask_answer': {
      messages.push({
        id: mkId('check'),
        kind: 'check',
        detail_level: (detail_level ?? 1) as 1|2|3,
        message_md: '最終解答を入力してみよう。必要なら「解法を表示」を押して確認できます。',
        actions: ['show_full_solution','draw_diagram','next_problem'],
      });
      break;
    }

    default: {
      return NextResponse.json({ ok:false, error:`unsupported action: ${action}` }, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
  }

  // 履歴保存（失敗してもUIに影響させない）
  try { await appendTutorHistory((body as any)?.sessionId ?? '0', messages); } catch {}

  return NextResponse.json({ ok: true, messages } satisfies TutorNextResponse, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

/* ==========================
 * 入口：POST
 *  - { input: TutorInput } なら従来フロー
 *  - それ以外で { action: ... } があれば新UIフロー
 * ========================== */

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=> ({}));

    // 新UI（段階的開示）の入口
    if (body && typeof body === 'object' && 'action' in body) {
      return await handleNext(req, body as TutorNextRequest);
    }

    // 既存UI（従来の input: TutorInput フロー）
    if (body && typeof body === 'object' && body.input) {
      const raw = await runTutorTurnServer(
        body.input as TutorInput,
        { sessionId: (body.input as any)?.sessionId, skillId: (body.input as any)?.skillId }
      );
      const out = normalizeForUI((body.input as TutorInput).intent, raw);
      return NextResponse.json({ ok: true, out }, { headers: { 'Cache-Control': 'no-store' }});
    }

    return NextResponse.json({ ok:false, error:'Invalid payload. Use { input: TutorInput } or TutorNextRequest.' }, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    });

  } catch (e: any) {
    console.error('[api/learn/run] error:', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

/** ブラウザ直叩きのとき案内を返す（405の代わり） */
export function GET() {
  return NextResponse.json({
    ok: false,
    error: 'Use POST with JSON: { input: TutorInput } (legacy) or TutorNextRequest (new)',
    example_legacy: { input: { intent: 'explain', topic: '二次方程式の解の公式' } },
    example_new: { action: 'show_more', detail_level: 1, user_answer_md: '平方完成の意味をもう少し詳しく。' },
  }, { headers: { 'Cache-Control': 'no-store' }});
}
