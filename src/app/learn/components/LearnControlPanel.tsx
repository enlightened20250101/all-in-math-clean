'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { tutorTurn } from '@/app/learn/actions.server';
import StudyPrefsDialog from '@/app/learn/components/StudyPrefsDialog';
import ExerciseRequestDialog from '@/app/learn/components/ExerciseRequestDialog';
import MiniMap from "./MiniMap";

type Intent = 'diagnose' | 'explain' | 'example' | 'exercise' | 'hint' | 'check' | 'next' | 'teach';

export default function LearnControlPanel({ sessionId }: { sessionId: number }) {
  const [topic, setTopic] = useState<string>('');
  const [trackCode, setTrackCode] = useState<string>('school-mathI-2025'); // 既定フォールバック
  const [isLoading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null);

  // prefs（ローカル保存） — LearnOverlay と同じキーで互換
  const LS_KEY = `learn-prefs:${sessionId}`;
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    detailLevel: 7, difficulty: 5, practiceAmount: 5, rigor: 7, speed: 5, languageLevel: 6,
  });

  // 出題ダイアログ
  const [exerciseOpen, setExerciseOpen] = useState(false);

  // ---- 初期化：topic と track_code と prefs ----
  useEffect(() => {
    (async () => {
      // topic, track_code
      const { data: sess, error } = await supabaseBrowser
        .from('learning_sessions')
        .select('topic_slug, track_code, current_skill_id')
        .eq('id', sessionId)
        .maybeSingle();

      if (!error && sess) {
        const first = sess.current_skill_id || sess.topic_slug;
        if (first) setTopic(first);
        if (sess.track_code) setTrackCode(String(sess.track_code));
      }

      // prefs（ローカル）
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) setPrefs(JSON.parse(raw));
      } catch {}
    })();
  }, [sessionId, LS_KEY]);

  function showNotice(kind: 'success' | 'error' | 'info', msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 2500);
  }

  // ---- 学習設定を保存：ローカル + /api/learn/settings へ patch ----
  const savePrefs = async (p: typeof prefs) => {
    setPrefs(p);
    try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {}

    // DBの settings にも反映（最小：difficulty と pace / priority_mode をマップ）
    const patch = {
      difficulty: clamp1to5(p.difficulty),
      pace: p.speed >= 7 ? 'fast' : p.speed <= 3 ? 'slow' : 'normal',
      // 必要なら priority_mode/target_* などをここに広げる
    };

    try {
      const res = await fetch('/api/learn/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId, patch }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `HTTP ${res.status}`);
      }
      showNotice('success', '学習設定を保存しました');
    } catch (e: any) {
      console.error('[savePrefs]', e);
      showNotice('error', '学習設定の保存に失敗しました');
    } finally {
      setPrefsOpen(false);
    }
  };

  function clamp1to5(v: number) { return Math.max(1, Math.min(5, Math.round(v))); }

  // ---- Run Tutor Turn ----
  async function call(intent: Intent, ctx?: any) {
    if (isLoading) return;
    setLoading(true);
    setNotice({ kind: 'info', msg: '生成中…' });

    try {
      // Server Action に sessionId も渡して、runTutorTurnServer がセッションを参照できるようにする
      const out = await tutorTurn({
        command: intent,
        intent,
        query: topic,
        prefs,
        sessionId,           // ★ ここ大事：セッションIDを明示
        ...ctx,
      });

      // paywall
      if (out?.type === 'paywall') {
        showNotice('error', out?.message ?? '残高不足です');
        location.href = '/billing';
        return;
      }

      // 「次のトピック」→ topic更新（サーバ側で提案を返す場合）
      if (out?.type === 'next' && out?.topic) {
        const nextTopic = out.topic as string;
        setTopic(nextTopic);
        await supabaseBrowser
          .from('learning_sessions')
          .update({ topic_slug: nextTopic, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

      // 学習ログに保存（ChatPanelが拾って描画）
      const { error: insertErr } = await supabaseBrowser
        .from('learning_messages')
        .insert({
          session_id: sessionId,
          role: 'assistant',
          content: out, // JSONB
          created_at: new Date().toISOString(),
        });
      if (insertErr) throw new Error(insertErr.message);

      // ChatPanel に更新通知
      window.dispatchEvent(new CustomEvent('learn:refresh'));

      const okMsg =
        intent === 'explain' ? '解説を追加しました'
        : intent === 'example' ? '例題を追加しました'
        : intent === 'exercise' ? '練習問題を追加しました（カード内に回答欄が表示されます）'
        : intent === 'diagnose' ? '理解度チェックの結果を追加しました'
        : intent === 'next' ? '次のトピックを提案しました'
        : '追加しました';

      showNotice('success', okMsg);
    } catch (e: any) {
      console.error('[LearnControlPanel tutorTurn error]', e);
      showNotice('error', e?.message ?? 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  // ---- ミニマップ：任意ノードへジャンプ ----
  async function jumpTo(skillId: string) {
    try {
      const res = await fetch('/api/learn/jump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId, skill_id: skillId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);
      setTopic(skillId);
      // Chat 側にも“更新”を促す
      // 直後にそのスキルの「内容解説」を出す
      await call('explain', { skillId });
      window.dispatchEvent(new CustomEvent('learn:refresh'));
      showNotice('success', 'トピックを切り替えて解説しました');
    } catch (e: any) {
      console.error('[jumpTo]', e);
      showNotice('error', e?.message ?? '移動に失敗しました');
    }
  }

  // track_code → view_code の簡易マッピング（必要に応じ拡張）
  function viewCodeFromTrack(track: string): string {
    if (track?.startsWith('school-mathI-2025')) return 'school-mathI-2025';
    if (track === 'centertest-I-A') return 'centertest-core';
    return 'school-mathI-2025';
  }

  const viewCode = viewCodeFromTrack(trackCode);

  return (
    <aside className="border rounded p-3 space-y-3 sticky top-4 h-fit bg-white">
      <div className="font-semibold">学習コントロール</div>

      {notice && (
        <div
          className={`text-xs rounded px-2 py-1 border ${
            notice.kind === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : notice.kind === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-sky-50 border-sky-200 text-sky-700'
          }`}
        >
          {notice.msg}
        </div>
      )}

      <div className="text-xs text-gray-500">
        トピック: {topic || '(未設定)'}
      </div>

      {/* ミニマップ：任意ノードにジャンプ可 */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-700">ミニマップ</div>
        <MiniMap
          sessionId={sessionId}
          viewCode={viewCode}
          currentSkillId={topic}
          onJumped={(skillId) => jumpTo(skillId)}   // ← ここを確実に呼ぶ
        />
      </div>

      <div className="grid gap-2">
        <button
          className={`px-3 py-2 border rounded w-full flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => setPrefsOpen(true)}
        >
          学習設定
        </button>

        <button
          className={`px-3 py-2 border rounded w-full ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => call('explain', { skillId: topic })}
        >
          内容解説
        </button>

        <button
          className={`px-3 py-2 border rounded w-full ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => call('example')}
        >
          例題
        </button>

        <button
          className={`px-3 py-2 border rounded w-full ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => setExerciseOpen(true)}
        >
          出題（練習問題）
        </button>

        <button
          className={`px-3 py-2 border rounded w-full ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => call('diagnose')}
        >
          理解度チェック
        </button>

        <button
          className={`px-3 py-2 border rounded w-full ${
            isLoading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
          onClick={() => call('next')}
        >
          次のトピックへ
        </button>

        <div className="text-[11px] text-gray-500">
          ※「答え合わせ」は最新の練習問題カード内に表示されます
        </div>
      </div>

      {/* ダイアログ類 */}
      <StudyPrefsDialog open={prefsOpen} onClose={() => setPrefsOpen(false)} onSave={savePrefs} />
      <ExerciseRequestDialog
        open={exerciseOpen}
        onClose={() => setExerciseOpen(false)}
        onSubmit={(req) => {
          setExerciseOpen(false);
          call('exercise', {
            skillId: topic,                 // ← 直近のスキルで出題
            topics: req.topics,
            methods: req.methods,
            count: req.count,
            difficulty: req.difficulty,
            // tutorTurn に渡す prefs を上書き（出題数・難易度）
            prefs: { ...prefs, difficulty: req.difficulty, practiceAmount: req.count },
          });
        }}
      />
    </aside>
  );
}
