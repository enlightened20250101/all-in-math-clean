// src/app/learn/actions.server.ts
// ※ サーバ/クライアントのどちらからでも呼べる純関数構成にしています。
//    /api/learn/run（既存）の応答が Non-JSON のときや、古い形の JSON のときでも落ちないように正規化します。

const API = process.env.NEXT_PUBLIC_LEARN_API?.trim() || '/api/learn/run';

export type TutorInput = {
  intent: 'explain'|'hint'|'check'|'exercise'|'example'|'diagnose'|'next'|'teach'|'chat';
  text?: string; topic?: string; topics?: string[]; methods?: string[]; count?: number;
  exercise?: { exerciseId: string; items: { id: string; prompt: string; answer: string }[] };
  user?: { userAnswerText?: string; userAnswersMap?: Record<string, string> };
  prefs?: { detailLevel: number; difficulty: number; practiceAmount: number; rigor: number; speed: number; languageLevel: number; };
  // 🔧 追加：セッション/スキルを直送できるように
  sessionId?: number;
  skillId?: string;
};

type AnyRec = Record<string, any>;

// ---- 低レベル fetch ヘルパ（タイムアウト＋Non-JSON保護） ----
async function fetchJson(url: string, body: any, opt?: { timeoutMs?: number }) {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), opt?.timeoutMs ?? 15_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-requested-with': 'learn-ui' },
      body: JSON.stringify(body ?? {}),
      signal: ctrl.signal,
      cache: 'no-store',
    });
    const ct = res.headers.get('content-type') || '';
    const raw = await res.text();
    if (!ct.includes('application/json')) {
      // レスポンスがHTML等でも先頭だけ見て落とさない
      return { ok: false, status: res.status, error: `Non-JSON response (status ${res.status})`, raw };
    }
    const json = safeParseJson(raw);
    if (!res.ok) {
      return { ok: false, status: res.status, error: json?.error || `API error (status ${res.status})`, json };
    }
    return { ok: true, status: res.status, json };
  } catch (e: any) {
    return { ok: false, status: 0, error: String(e?.message || e) };
  } finally {
    clearTimeout(timeout);
  }
}

function safeParseJson(t: string) {
  try { return JSON.parse(t); } catch { return null; }
}

// ---- レガシー入力 → TutorInput へ正規化 ----
function normalizeLegacyToTutorInput(x: AnyRec): TutorInput {
  const mapCmdToIntent = (cmd?: string): TutorInput['intent'] => {
    switch ((cmd ?? '').toLowerCase()) {
      case 'diagnose': return 'diagnose';
      case 'explain':  return 'explain';
      case 'example':  return 'example';
      case 'exercise': return 'exercise';
      case 'hint':     return 'hint';
      case 'check':    return 'check';
      case 'next':     return 'next';
      case 'teach':    return 'teach';
      case 'chat':     return 'chat';
      default:         return 'chat';
    }
  };

  const intent =
    (x.intent as TutorInput['intent']) ??
    (x.type   as TutorInput['intent']) ??
    mapCmdToIntent(x.command);

  const topic = x.topic ?? x.title ?? x.query ?? undefined;
  const text  = x.text  ?? x.message ?? (intent === 'chat' ? (x.query ?? undefined) : undefined);

  const topics  = Array.isArray(x.topics) ? x.topics
               : typeof x.topics === 'string' ? x.topics.split(',').map((s:string)=>s.trim()).filter(Boolean)
               : undefined;
  const methods = Array.isArray(x.methods) ? x.methods
               : typeof x.methods === 'string' ? x.methods.split(',').map((s:string)=>s.trim()).filter(Boolean)
               : undefined;

  const p: AnyRec = { ...(x.prefs ?? x.preferences ?? {}) };
  if (typeof x.difficulty      === 'number') p.difficulty      = x.difficulty;
  if (typeof x.practiceAmount  === 'number') p.practiceAmount  = x.practiceAmount;
  if (typeof x.detailLevel     === 'number') p.detailLevel     = x.detailLevel;
  if (typeof x.rigor           === 'number') p.rigor           = x.rigor;
  if (typeof x.languageLevel   === 'number') p.languageLevel   = x.languageLevel;
  const prefs = Object.keys(p).length ? (p as TutorInput['prefs']) : undefined;

  const count = typeof x.count === 'number'
             ? x.count
             : (typeof x.practiceAmount === 'number' ? x.practiceAmount : undefined);

  // 🔧 ここが重要：戻り値に sessionId / skillId を含める
  const sid = Number(x.sessionId);
  const _sessionId = Number.isFinite(sid) ? sid : undefined;
  const _skillId   = typeof x.skillId === 'string' ? x.skillId : undefined;

  return {
    intent, topic, text, topics, methods, count, prefs,
    exercise: x.exercise, user: x.user,
    sessionId: _sessionId,
    skillId: _skillId,
  } as TutorInput;
}

// ---- 出力の標準化（UIが欲しいキーを揃える）----
function normalizeOut(input: TutorInput, out: AnyRec): AnyRec {
  const o = out || {};
  const type = o.type ?? input.intent;
  const items = Array.isArray(o.items) ? o.items
             : Array.isArray(o.questions) ? o.questions
             : Array.isArray(o.exercises) ? o.exercises
             : [];
             
  // ★ hint 正規化
  const hint = Array.isArray(o.hint) ? o.hint
           : typeof o.hint === 'string' ? [o.hint]
           : Array.isArray(o.hints) ? o.hints
           : typeof o.hints === 'string' ? [o.hints]
           : [];

  return {
    type,
    text: o.text ?? o.message ?? '',
    topic: o.topic ?? input.topic ?? '',
    items,
    hint, // ★
    solutions: o.solutions ?? [],
    userAnswers: o.userAnswers ?? [],
    score: typeof o.score === 'number' ? o.score : (o.machine_check?.summary?.correct ?? null),
    verdict: o.verdict ?? (o.machine_check?.ok ? 'correct' : 'wrong'),
    links: Array.isArray(o.links) ? o.links : [],
    machine_check: o.machine_check ?? null,
    steps_detail: o.steps_detail ?? null,
    ...o, // ← 既存フィールドがあれば上書きになる点は従来通り
  };
}

// ---- Public API ----
export async function runTutorTurn(input: TutorInput) {
  const req = { input };
  const res = await fetchJson(API, req, { timeoutMs: 15_000 });
  if (!res.ok) {
    const prefix = res.status ? `status ${res.status}` : 'network';
    throw new Error(`[learn.run] ${prefix}: ${res.error ?? 'unknown error'}`);
  }
  const json = res.json ?? {};
  const serverOut = json.out ?? json.data ?? json.result ?? json;
  const normalized = normalizeOut(input, serverOut);
  try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('legacy-learn-result', { detail: normalized })); } catch {}
  return normalized;
}

// 旧UI互換：どんな形でも TutorInput へ寄せてから runTutorTurn
export async function tutorTurn(payload: any) {
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    const obj: any = {};
    payload.forEach((v, k) => { obj[k] = v; });
    if (typeof obj.context === 'string') {
      try { Object.assign(obj, JSON.parse(obj.context)); } catch {}
    }
    return await runTutorTurn(normalizeLegacyToTutorInput(obj));
  }
  return await runTutorTurn(normalizeLegacyToTutorInput(payload));
}

export const tutorTurnState = { async run(payload: any) { return await tutorTurn(payload); } };
