'use client';

import { useEffect, useMemo, useState } from 'react';
import StudyPrefsDialog from './StudyPrefsDialog';
import ExerciseRequestDialog from './ExerciseRequestDialog';
import FreeChatBox from './FreeChatBox';
import TeachView from './TeachView';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type TutorInput = {
  intent: 'explain'|'hint'|'check'|'exercise'|'example'|'diagnose'|'next'|'teach'|'chat';
  text?: string;
  topic?: string;
  topics?: string[];
  methods?: string[];
  count?: number;
  prefs?: {
    detailLevel: number; difficulty: number; practiceAmount: number;
    rigor: number; speed: number; languageLevel: number;
  };
  exercise?: { exerciseId: string; items: { id: string; prompt: string; answer: string }[] };
  user?: { userAnswerText?: string; userAnswersMap?: Record<string, string> };
};

type Props = { sessionId: string | number };

export default function LearnOverlay({ sessionId }: Props) {
  const LS_KEY = useMemo(()=> `learn-prefs:${sessionId}`, [sessionId]);

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [teachMode, setTeachMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teachResult, setTeachResult] = useState<any>(null); // teach のみ保持
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [prefs, setPrefs] = useState({
    detailLevel: 7, difficulty: 5, practiceAmount: 5, rigor: 7, speed: 5, languageLevel: 6
  });

  useEffect(()=> {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setPrefs(JSON.parse(raw)); } catch {}
  }, [LS_KEY]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const savePrefs = (p: typeof prefs) => { setPrefs(p); try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch {}; setPrefsOpen(false); };

  async function callTutor(input: TutorInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/learn/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ input: { ...input, prefs } }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'failed');
      const out = json.out;

      // teach 以外は DB に保存→ChatPanel が拾う。オーバーレイでは表示しない
      if (out?.type && out.type !== 'teach') {
        const { error } = await supabaseBrowser.from('learning_messages').insert({
          session_id: Number(sessionId),
          role: 'assistant',
          content: out, // JSONB
          created_at: new Date().toISOString(),
        });
        if (error) throw new Error(error.message);
        window.dispatchEvent(new CustomEvent('learn:refresh'));
        setTeachResult(null);
      } else {
        // teach だけはオーバーレイ内でセクション表示
        setTeachResult(out);
      }
    } catch (e:any) {
      console.error('[LearnOverlay callTutor error]', e);
      setToast({ message: e?.message ?? 'エラーが発生しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleExplain = (topic: string) => callTutor({ intent: 'explain', topic });
  const handleTeach   = (topic: string) => callTutor({ intent: 'teach',   topic });
  const handleChat    = (text:  string) => callTutor({ intent: 'chat',    text  });

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {toast ? (
        <div
          className={`rounded-md border px-2 py-1 text-xs shadow ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
      {/* Floating Toolbar */}
      <div className="rounded-2xl shadow-lg border bg-white p-3 flex items-center gap-2">
        <button onClick={()=> setPrefsOpen(true)} className="rounded-lg px-3 py-2 border hover:bg-gray-50">学習設定</button>
        <button onClick={()=> setExerciseOpen(true)} className="rounded-lg px-3 py-2 border hover:bg-gray-50">出題</button>
        <button onClick={()=> setTeachMode(v=> !v)} className="rounded-lg px-3 py-2 border hover:bg-gray-50">{teachMode? '教科書OFF':'教科書ON'}</button>
      </div>

      {/* Free chat box */}
      <div className="w-[min(720px,92vw)] rounded-2xl shadow-lg border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">自由質問</div>
          <div className="text-xs text-gray-500">式はTeXでなくてもOK（返答は自動でTeX化）</div>
        </div>
        <FreeChatBox onSend={handleChat} />
        <div className="mt-3 flex gap-2">
          <input placeholder="トピック（例：極限と連続）" className="flex-1 rounded-lg border px-3 py-2" id="topic-input"/>
          <button disabled={loading} onClick={()=>{
            const el = document.getElementById('topic-input') as HTMLInputElement | null;
            const t = el?.value?.trim(); if (t) handleExplain(t);
          }} className="rounded-lg px-3 py-2 border hover:bg-gray-50">解説</button>
          <button disabled={loading} onClick={()=>{
            const el = document.getElementById('topic-input') as HTMLInputElement | null;
            const t = el?.value?.trim(); if (t) handleTeach(t);
          }} className="rounded-lg px-3 py-2 border hover:bg-gray-50">{teachMode? '再生成':'教科書'}</button>
        </div>

        {/* teach の時だけ描画（それ以外は JSON を出さない） */}
        <div className="mt-4">
          {loading && <div className="text-sm text-gray-500">生成中…</div>}
          {!loading && teachResult && teachResult.type === 'teach' && teachResult.sections && (
            <TeachView
              sections={teachResult.sections}
              examples={teachResult.examples}
              exercises={teachResult.exercises}
              nextCandidates={teachResult.nextCandidates}
              onPickNext={(key)=> handleTeach(key)}
            />
          )}
        </div>
      </div>

      {/* Dialogs */}
      <StudyPrefsDialog open={prefsOpen} onClose={()=> setPrefsOpen(false)} onSave={savePrefs} />
      <ExerciseRequestDialog open={exerciseOpen} onClose={()=> setExerciseOpen(false)} onSubmit={(req)=>{
        setExerciseOpen(false);
        callTutor({
          intent: 'exercise',
          count: req.count,
          topics: req.topics,
          methods: req.methods,
          prefs: { ...prefs, difficulty: req.difficulty, practiceAmount: req.count }
        });
      }}/>
    </div>
  );
}
