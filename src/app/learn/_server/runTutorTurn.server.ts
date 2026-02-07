'use server';

import OpenAI from 'openai';
import {
  makeSystem, STYLE_GUIDE_JA,
  SCHEMA_EXPLAIN, SCHEMA_EXERCISE, SCHEMA_EXAMPLE, SCHEMA_HINT, SCHEMA_NEXT, SCHEMA_TEACH, SCHEMA_CHAT,
  type ChatMessage,
} from '@/server/learning/prompts';
import { normalizeTutorOutput } from '@/server/learning/normalize';
import type { TutorTurnOutput } from '@/app/learn/aiTypes';
import { skillToVerifyType, buildVerifyPayload } from '@/server/verify/registry';
import type { VerifyType } from '@/server/verify/registry';
import { callVerify, callVerifyBatch } from '@/server/verify/client';
import { partialCreditFor } from '@/server/learning/rubric';
import { deepSanitizeTex } from '@/lib/tex';
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { generateProblem } from "@/server/learning/generate";
import { buildHistoryForLLM } from '@/server/learning/history';

export type TutorInput = {
  intent: 'explain'|'hint'|'check'|'exercise'|'example'|'diagnose'|'next'|'teach'|'chat';
  text?: string; topic?: string; topics?: string[]; methods?: string[]; count?: number;
  exercise?: { exerciseId: string; items: { id: string; prompt: string; answer: string; skillId?: string }[] };
  user?: { userAnswerText?: string; userAnswersMap?: Record<string, string> };
  prefs?: { detailLevel:number; difficulty:number; practiceAmount:number; rigor:number; speed:number; languageLevel:number; };
  // フロントから同梱されることがある
  sessionId?: number;
  // 将来の拡張ヒント（/api 側で図示するので現在は未使用でもOK）
  wantDiagram?: boolean;
  // 追加：アンカー（過去カードからの分岐）
  anchor?: { id: string; text?: string };
};

const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

/** intent×嗜好に応じた温度 */
const TEMP_BY_INTENT: Record<TutorInput['intent'], (p?:TutorInput['prefs'])=>number> = {
  explain: p => Math.max(0, 0.15 - 0.01*((p?.rigor??7)-5)),
  hint:    () => 0.10,
  check:   () => 0.00,
  exercise:p => 0.20 + 0.01*((p?.difficulty??5)-5),
  example: () => 0.10,
  diagnose:() => 0.10,
  next:    () => 0.10,
  teach:   p => Math.max(0, 0.15 - 0.01*((p?.rigor??7)-5)),
  chat:    () => 0.20,
};

function safeParseJSON<T=any>(s: string): T | null { try { return JSON.parse(s) as T; } catch { return null; } }

// ---- セッション情報の取得 ----
async function fetchSession(sessionId?: number): Promise<{ topic_slug?: string|null; current_skill_id?: string|null; settings?: any } | null> {
  if (!sessionId || !Number.isFinite(sessionId)) return null;
  const supabase = await await supabaseServerReadOnly();
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('topic_slug, current_skill_id, settings')
    .eq('id', sessionId)
    .maybeSingle();
  if (error) {
    console.warn('[runTutorTurn] fetchSession error:', error.message);
    return null;
  }
  return data ?? null;
}

function chooseDifficulty(inputDifficulty?: number, sessionSettings?: any): 1|2|3|4|5 {
  const d = inputDifficulty ?? sessionSettings?.difficulty ?? 2;
  const v = Math.max(1, Math.min(5, Math.round(Number(d) || 2)));
  return v as 1|2|3|4|5;
}

// ---- スキルメタ（説明のガードに使う） ----
type SkillRow = { id:string; title:string; unit?:string; topic?:string; tags?:string[]; outcomes?:string[] };
async function fetchSkillMeta(skillId?: string): Promise<SkillRow | null> {
  if (!skillId) return null;
  const supabase = await await supabaseServerReadOnly();
  const { data, error } = await supabase
    .from('skills')
    .select('id,title,unit,topic,tags')
    .eq('id', skillId)
    .maybeSingle();
  if (error) { console.warn('[explain] skills fetch error:', error.message); }
  return data ?? null;
}

// ---- 逸脱判定（説明の時だけ使う最低限のフィルタ） ----
function isOffTopic(text: string, skill: SkillRow | null): boolean {
  const banned = /(json|api|配列|オブジェクト|http|curl|javascript)/i.test(text);
  const mustHit = [skill?.title, skill?.topic].filter(Boolean) as string[];
  const must = mustHit.some(k =>
    new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)
  );
  // タイトル/トピックに触れず、かつ禁止語に触れている → 逸脱と判定
  return (!must && banned);
}

// ---- TeX 補修（deepSanitizeTexの前後で呼ぶ） ----
function hardenTex(s: string): string {
  let t = s;
  t = t.replace(/(^|[^\\])ightarrow/g, '$1\\rightarrow');
  t = t.replace(/(^|[^\\])ext\{/g, '$1\\text{');
  // $ の奇数個対策（簡易）
  const dollar = (t.match(/\$/g) || []).length;
  if (dollar % 2 !== 0) t += '$';
  return t;
}
function deepHardenTex(out: any): any {
  const walk = (v:any):any =>
    typeof v === 'string' ? hardenTex(v)
    : Array.isArray(v) ? v.map(walk)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k,vv])=>[k,walk(vv)]))
    : v;
  return walk(out);
}

// ---- 機械採点のみ ----
async function runPureMachineCheck(input: TutorInput): Promise<TutorTurnOutput> {
  if (!input.exercise) {
    return {
      type: 'check',
      score: 0,
      solutions: [],
      userAnswers: [],
      feedback: 'no exercise',
      verdict: 'wrong',
      links: [],
    } as any;
  }

  const uMap = input.user?.userAnswersMap ?? {};
  const items = input.exercise.items;

  const jobs = items.map((it) => {
    const skillId = it.skillId ?? (input as any).skillId ?? 'equation.identity';
    const vtype = skillToVerifyType(skillId);
    const rawVal = uMap[it.id] ?? it.answer ?? '';
    let parsed: any = null;
    if (typeof rawVal === 'string' && rawVal.trim().startsWith('{')) {
      try { parsed = JSON.parse(rawVal); } catch {}
    } else if (typeof rawVal === 'object' && rawVal) {
      parsed = rawVal;
    }
    const userVal = parsed?.final ?? rawVal;
    const payload = vtype ? buildVerifyPayload(skillId, it as any, { text: userVal }) : {};
    return { id: it.id, skillId, vtype, payload, userVal, userSteps: parsed?.steps ?? [] };
  });

  let results: Array<{ id: string; ok: boolean; type: VerifyType | null; payload: any; result: any }>;
  const validJobs = jobs.filter(j => !!j.vtype) as Array<{ id:string; vtype:VerifyType; payload:any }>;

  if (validJobs.length > 1) {
    const { data } = await callVerifyBatch(validJobs.map(j => ({ type: j.vtype!, payload: j.payload })));
    const arr: any[] = (data?.results ?? []);
    let k = 0;
    results = jobs.map((j) => {
      if (!j.vtype) return { id: j.id, ok: false, type: null, payload: j.payload, result: { ok:false, error:`no-verify-type for ${j.skillId}` } };
      const r = arr[k++];
      return { id: j.id, ok: !!r?.ok, type: j.vtype!, payload: j.payload, result: r ?? { ok:false, error:'no_result' } };
    });
  } else if (validJobs.length === 1) {
    const j = validJobs[0];
    const { data } = await callVerify(j.vtype!, j.payload);
    results = [{ id: j.id, ok: !!data?.ok, type: j.vtype!, payload: j.payload, result: data }];
  } else {
    results = jobs.map(j => ({ id: j.id, ok: false, type: null, payload: j.payload, result: { ok:false, error:`no-verify-type for ${j.skillId}` } }));
  }

  const hadServerError = results.some(r => !r.ok && typeof r.result?.error === 'string' && r.result.error !== 'mismatch');
  if (hadServerError) {
    const firstErr = results.find(r => !r.ok && typeof r.result?.error === 'string')?.result?.error ?? 'unknown';
    return {
      type: 'check',
      score: 0,
      solutions: [],
      userAnswers: items.map(it => ({ id: it.id, value: uMap[it.id] ?? it.answer ?? '' })),
      feedback: `採点サーバのエラーにより判定を保留しました（原因: ${firstErr}）。時間をおいて再実行してください。`,
      machine_check: { ok: false, items: results, summary: { correct: 0, total: results.length } },
      verdict: 'error',
      links: [],
    } as any;
  }

  let correct = results.filter(r => r.ok).length;
  const total  = results.length;

  const userAnswers = items.map(it => {
    const rawVal = uMap[it.id] ?? it.answer ?? '';
    let parsed:any = null;
    if (typeof rawVal === 'string' && rawVal.trim().startsWith('{')) { try { parsed = JSON.parse(rawVal); } catch {} }
    return { id: it.id, value: parsed?.final ?? rawVal };
  });

  const stepDetails: Array<{ id: string; steps: any[] }> = [];
  const notes: string[] = [];
  for (const r of results) {
    if (r.ok) continue;
    const rawUserVal = uMap[r.id];
    const pc = await partialCreditFor(r as any, rawUserVal);
    if (pc.delta > 0) correct += pc.delta;
    if ((pc as any).stepsDetail?.length) stepDetails.push({ id: r.id, steps: (pc as any).stepsDetail });
    if (pc.note) notes.push(pc.note);
  }

  correct = Math.min(total, correct);
  const verdict: 'correct'|'partial'|'wrong' =
    correct === total ? 'correct' : (correct > 0 ? 'partial' : 'wrong');

  const baseMsg =
    verdict === 'correct'
      ? '全問正解です。次に進みましょう。'
      : verdict === 'partial'
      ? `一部正解（${correct}/${total}）。`
      : '不正解が多いです。';
  const noteMsg = notes.length ? notes.join(' / ') : (verdict === 'partial' ? '間違えた問題を復習してから再挑戦を。' : (verdict === 'wrong' ? 'ヒントや例題を見てから再挑戦しましょう。' : ''));
  const feedback = `${baseMsg}${noteMsg ? ' ' + noteMsg : ''}`;

  return {
    type: 'check',
    exerciseId: input.exercise?.exerciseId,
    score: Math.min(total, correct),
    solutions: [],
    userAnswers,
    feedback,
    machine_check: { ok: correct === total, items: results, summary: { correct, total } },
    verdict,
    links: [],
    steps_detail: stepDetails.length ? stepDetails : undefined,
  } as any;
}

// ---- メイン ----
export async function runTutorTurnServer(
  input: TutorInput,
  opts?: { sessionId?: number; skillId?: string }
): Promise<TutorTurnOutput> {

  // セッション情報（settings / current / topic）
  const sessionId = opts?.sessionId ?? (input as any).sessionId;
  const sess = await fetchSession(sessionId);
  const sessionSettings = sess?.settings ?? {};

  // skillId を確定（引数 > current_skill_id > topic_slug > input.topic）
  let skillId =
    opts?.skillId ??
    sess?.current_skill_id ??
    sess?.topic_slug ??
    input.topic ??
    null;

  // “check” は機械採点のみ
  if (input.intent === 'check' && input.exercise) {
    return await runPureMachineCheck(input);
  }

  // 説明ガードのためのメタ
  const skillMeta = await fetchSkillMeta(skillId ?? undefined);

  // ---- 生成（exercise なら事前生成、explain はガードを効かせる）----
  let generated: any = null;
  if (input.intent === 'exercise' && skillId) {
    const diff = chooseDifficulty(input?.prefs?.difficulty, sessionSettings);
    generated = await generateProblem({ skillId, difficulty: diff });
  }

  // ── 直近履歴（軽量）とロードマップ・ミニ（任意）を取得
  let historyCompact: any = null;
  if (typeof sessionId === 'number' && Number.isFinite(sessionId)) {
    try {
      const ro = await await supabaseServerReadOnly();
      const h = await buildHistoryForLLM(ro, sessionId);
      historyCompact = h?.compact ?? null;
    } catch {}
  }

  let roadmapMini: any = null;
  try {
    // 必要なら /api を叩く。環境に応じて ORIGIN を設定しておくと確実。
    const origin =
      process.env.NEXT_PUBLIC_APP_ORIGIN ||
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
      'http://localhost:3000';
    const r = await fetch(`${origin}/api/roadmap/current`, { cache: 'no-store' });
    const j = await r.json().catch(()=>null);
    // 旧形式(goalsのみ)でも動くよう防御
    roadmapMini = j?.summary ?? null;
  } catch {}

  // OpenAI 呼び出し
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
  const client = new OpenAI({ apiKey });

  // System コンテキスト
  const sysBase = makeSystem();
  const messages: ChatMessage[] = [
    { role: 'system', content: sysBase },
    { role: 'system', content: STYLE_GUIDE_JA }, // 文体・用語統一
    { role: 'system', content: '出力の最終段で、文末を丁寧な「です・ます」調に整えてください。' },
    { role: 'system', content: '直前の会話履歴とロードマップ状況を踏まえ、前後の流れを崩さない説明にしてください。' },
    { role: 'system', content: '出力は必ず JSON（単一オブジェクト）。schema に厳密準拠。数式は TeX（$...$ / $$...$$）。' },
    { role: 'system', content:
      `detailLevel（1=要点/短め, 2=標準, 3=丁寧）と rigor（高いほど厳密）に応じて説明の密度を調整し、` +
      `図示が有効なら「図示の方針」を簡潔に触れてもよい（ただし JSON の text 内の説明に留める）。`
    },
  ];

  // 説明の逸脱を防ぐ“強制文脈”
  const explainGuard = input.intent === 'explain' && skillMeta ? {
    role: 'system' as const,
    content:
      `あなたは数学チューターです。以下のスキルに限定して説明してください。` +
      `情報/プログラミング/HTTP/JSON といった話題には逸脱しないでください。\n` +
      `【スキルID】${skillMeta.id}\n` +
      `【タイトル】${skillMeta.title}\n` +
      (skillMeta.topic ? `【トピック】${skillMeta.topic}\n` : '') +
      (skillMeta.unit  ? `【単元】${skillMeta.unit}\n` : '')
  } : null;
  if (explainGuard) messages.push(explainGuard);

  // intent に応じて JSON Schema を付与
  switch (input.intent) {
    case 'explain': messages.push({ role: 'system', content: SCHEMA_EXPLAIN }); break;
    case 'exercise':messages.push({ role: 'system', content: SCHEMA_EXERCISE }); break;
    case 'example': messages.push({ role: 'system', content: SCHEMA_EXAMPLE }); break;
    case 'hint':    messages.push({ role: 'system', content: SCHEMA_HINT    }); break;
    case 'next':    messages.push({ role: 'system', content: SCHEMA_NEXT    }); break;
    case 'teach':   messages.push({ role: 'system', content: SCHEMA_TEACH   }); break;
    case 'chat':    messages.push({ role: 'system', content: SCHEMA_CHAT    }); break;
  }

  // User 入力を JSON で渡す（文脈も同梱）
  messages.push({
    role: 'user',
    content: JSON.stringify({
      ...input,
      sessionId,            // ログ用途
      skillId,              // 現在の対象
      settings: sessionSettings,
      generated,            // exercise の場合の生成物を同梱
      context: {
        history: historyCompact,  // 直近会話の軽量要約（null 可）
        roadmap: roadmapMini,      // 目標/次の推奨（null 可）
        anchor: input.anchor ?? null // ★ 過去カードから分岐する場合、そのカードの要約
      },
      wants: { diagram: !!input.wantDiagram },
      // 出力条件
      requirements: [
        '出力は必ず JSON（1オブジェクト）。schemaに厳密準拠',
        '数式は必ず TeX（$...$ / $$...$$）',
        '余分な語りやコードフェンスは不可'
      ],
      language: 'ja',
    }),
  });

  // 呼び出し
  let out: any;
  const MAX_TRY = 2;
  for (let attempt=0; attempt<MAX_TRY; attempt++) {
    try {
      const ai = await client.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages,
        temperature: (TEMP_BY_INTENT[input.intent]?.(input.prefs)) ?? 0.1,
        response_format: { type: 'json_object' },
      });
      out = safeParseJSON(ai.choices?.[0]?.message?.content ?? '{}') ?? { type: input.intent, text: '' };

      // 出力補修：TeXの堅牢化→サニタイズ
      out = deepHardenTex(out);
      out = deepSanitizeTex(out);

      // 説明の逸脱チェック
      if (input.intent === 'explain' && isOffTopic(JSON.stringify(out), skillMeta)) {
        messages.push({
          role: 'system',
          content:
            '注意：直前の出力は対象スキルから逸脱しています。' +
            '上記スキルの範囲内だけで、定義→直観→例→結論（\\boxed{...}）の順に、短く正確に説明してください。' +
            'JSON/プログラミング/HTTP 用語は禁止。'
        });
        continue; // 再試行
      }

      break; // OK
    } catch (err) {
      if (attempt === MAX_TRY-1) {
        const fallback = { type: input.intent, text: '生成に失敗しました。通信状況を確認してもう一度お試しください。' };
        return normalizeTutorOutput(input, deepSanitizeTex(fallback), []);
      }
    }
  }

  // 既存 I/F に合わせた整形（TeachView のレガシールートでも表示できる）
  return normalizeTutorOutput(input, out, []);
}
