// =============================
// File: src/server/learning/history.ts
// =============================
import { supabaseServerAction } from '@/lib/supabaseServer';
import type { TutorMsg } from '@/app/learn/aiTypes';

export const HISTORY_LIMIT = 12;

function _excerpt(s: string | undefined, n = 200) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
}

function _normType(c: any): string {
  return (c?.kind || c?.type || 'text').toString();
}
function _normText(c: any): string {
  const t = (c?.message_md ?? c?.text ?? c?.message ?? '');
  return typeof t === 'string' ? t : '';
}

/** いまは numeric session_id のみ対応（'skill:xxx' 等は空で返す） */
export async function buildHistoryForLLM(db: any, sessionKey: string | number) {
  const session_id =
    typeof sessionKey === 'number' ? sessionKey :
    (/^\d+$/.test(String(sessionKey)) ? Number(sessionKey) : null);

  if (session_id == null) return { compact: [], lastExerciseId: null };

  const { data, error } = await db
    .from('learning_messages')
    .select('role, content, created_at, id')
    .eq('session_id', session_id)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) return { compact: [], lastExerciseId: null };

  const msgs = (data ?? []).reverse();

  const compact = msgs.map((m: any) => {
    const c = m.content || {};
    const t = _normType(c);

    if (t === 'exercise') {
      return {
        t: 'exercise',
        exId: c.exerciseId ?? `ex-${m.id}`,
        items: Array.isArray(c.items) ? c.items.map((it: any) => _excerpt(it?.prompt ?? String(it))) : [],
        diff: c.difficulty ?? null,
      };
    }
    if (t === 'check') {
      const fb = _excerpt(c.feedback ?? _normText(c));
      const score = typeof c.score === 'number' ? c.score : (c.correct ? 1 : 0);
      return { t: 'check', exId: c.exerciseId ?? `ex-${m.id}`, correct: !!c.correct, score, fb };
    }
    if (t === 'hint') return { t: 'hint', exId: c.exerciseId ?? `ex-${m.id}`, steps: _excerpt(c.hint ?? _normText(c)) };
    if (t === 'example') return { t: 'example', q: _excerpt(c.prompt ?? _normText(c)) };
    if (t === 'explain' || t === 'solution' || t === 'quiz' || t === 'curriculum_feedback') {
      return { t, k: _excerpt(_normText(c)) };
    }
    if (t === 'diagram') return { t: 'diagram' };
    return { t };
  });

  const lastEx = [...msgs].reverse().find((m: any) => _normType(m.content || {}) === 'exercise');
  const lastExerciseId = lastEx ? (lastEx.content?.exerciseId ?? `ex-${lastEx.id}`) : null;

  return { compact, lastExerciseId };
}

/** TutorMsg を learning_messages に保存（失敗はUIに影響させない） */
export async function appendTutorHistory(sessionKey: string | number, msgs: TutorMsg[]) {
  try {
    const session_id =
      typeof sessionKey === 'number' ? sessionKey :
      (/^\d+$/.test(String(sessionKey)) ? Number(sessionKey) : null);

    if (session_id == null || msgs.length === 0) return;

    const sb = await await supabaseServerAction(); // ★ あなたの環境の書き込みクライアント
    const rows = msgs.map(m => ({ session_id, role: 'tutor', content: m })); // JSONB 推奨
    await sb.from('learning_messages').insert(rows);
  } catch (e) {
    console.warn('[history] append failed:', (e as any)?.message || e);
  }
}
