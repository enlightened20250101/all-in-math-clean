// src/app/learn/components/TeachView.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { VizRunner } from '@/components/viz';
import MathMarkdown from '@/components/MathMarkdown';
import type { TutorMsg, TutorAction, TutorNextRequest, TutorNextResponse } from '@/app/learn/aiTypes';

type Section = { key: string; title: string; body: string };
type Next = { key: string; title: string };
type Example = { prompt: string; solution: string };
type Exercise = { id: string; prompt: string; answer: string; hint: string[] };

// VizRunner の spec 型をそのまま流用
type VizSpec = Parameters<typeof VizRunner>[0]['spec'];

type Props = {
  sections: Section[];
  examples?: Example[];
  exercises?: Exercise[];
  nextCandidates?: Next[];
  onPickNext?: (key: string) => void;

  /** 新UI：チューターの構造化メッセージ（初期表示用は任意） */
  tutorMsgs?: TutorMsg[];
  /** 新UI：学習セッションID（任意） */
  sessionId?: string | number;
};

export default function TeachView({
  sections,
  examples = [],
  exercises = [],
  nextCandidates = [],
  onPickNext,
  tutorMsgs = [],
  sessionId,
}: Props) {
  // --- 既存のセクション×図（/api/anim ルート） ---
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [specByKey, setSpecByKey] = useState<Record<string, VizSpec | null>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorByKey, setErrorByKey] = useState<Record<string, string | null>>({});
  const [showJsonKey, setShowJsonKey] = useState<string | null>(null);

  // --- 新UI：段階的開示（TutorMsg[]） ---
  const [msgs, setMsgs] = useState<TutorMsg[]>(tutorMsgs);
  const [isBusy, setIsBusy] = useState(false);
  const lastMsgId = useMemo(() => (msgs.length ? msgs[msgs.length - 1].id : undefined), [msgs]);

  const toggle = useCallback((k: string) => {
    setOpen((o) => ({ ...o, [k]: !o[k] }));
  }, []);

  // サマリから vizSpec を取得（MVP：キーワード推定）
  const requestDiagramForSection = useCallback(async (sec: Section) => {
    try {
      setLoadingKey(sec.key);
      setErrorByKey((e) => ({ ...e, [sec.key]: null }));
      const payload = { summary: `${sec.title}\n${sec.body?.slice(0, 300) ?? ''}` };
      const res = await fetch('/api/anim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? 'failed to fetch vizSpec');
      setSpecByKey((m) => ({ ...m, [sec.key]: data.spec as VizSpec }));
      setOpen((o) => ({ ...o, [sec.key]: true }));
    } catch (err: any) {
      setErrorByKey((e) => ({ ...e, [sec.key]: err?.message ?? 'unknown error' }));
      setSpecByKey((m) => ({ ...m, [sec.key]: null }));
    } finally {
      setLoadingKey(null);
    }
  }, []);

  // 新UI：Tutor へのアクション送信
  const sendTutorAction = useCallback(
    async (action: TutorAction, opts?: { detailUp?: boolean; answerMd?: string; wantDiagram?: boolean }) => {
      try {
        setIsBusy(true);
        const nextDetail =
          opts?.detailUp && msgs.length
            ? (Math.min(3, ((msgs[msgs.length - 1]?.detail_level ?? 1) + 1)) as 1 | 2 | 3)
            : (msgs[msgs.length - 1]?.detail_level as 1 | 2 | 3 | undefined);

        const req: TutorNextRequest = {
          sessionId: typeof sessionId === 'number' ? String(sessionId) : sessionId,
          lastMsgId,
          action,
          detail_level: nextDetail,
          user_answer_md: opts?.answerMd,
          want_diagram: opts?.wantDiagram,
        };

        const res = await fetch('/api/learn/run', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(req),
        });
        const data: TutorNextResponse = await res.json();

        if (res.ok && data.ok) {
          setMsgs((prev) => [...prev, ...data.messages]);
          return;
        }

        // フォールバック：図だけでも出す
        if (action === 'draw_diagram') {
          const last = msgs[msgs.length - 1];
          const summary =
            (last && last.kind !== 'diagram' ? last.message_md : '')?.slice(0, 300) || 'diagram request';
          const r = await fetch('/api/anim', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ summary }),
          });
          const j = await r.json().catch(() => null);
          if (j?.ok && j?.spec) {
            setMsgs((prev) => [
              ...prev,
              {
                id: `local-diagram-${Date.now()}`,
                kind: 'diagram',
                detail_level: nextDetail ?? 1,
                diagram: j.spec,
                actions: ['show_more', 'show_full_solution', 'next_problem'],
              },
            ]);
          }
        }
      } finally {
        setIsBusy(false);
      }
    },
    [sessionId, lastMsgId, msgs]
  );

  // Tutor メッセージ描画（MathMarkdown で本文・VizRunner で図）
  const renderTutorMsg = (m: TutorMsg) => {
    const header = (
      <div className="text-xs text-gray-500 mb-1">
        {m.kind.toUpperCase()} {m.detail_level ? `(Level ${m.detail_level})` : null}
      </div>
    );

    const cites =
      m.cites?.length ? (
        <div className="mt-2 text-xs text-gray-500">
          参考: {m.cites.map((c, i) => (
            <span key={i} className="mr-2">{c.title}</span>
          ))}
        </div>
      ) : null;

    const buttons = (
      <div className="mt-3 flex flex-wrap gap-2">
        {m.actions?.includes('show_more') && (
          <button
            className="rounded px-3 py-1.5 border hover:bg-gray-50"
            disabled={isBusy}
            onClick={() => sendTutorAction('show_more', { detailUp: true })}
          >
            もっと詳しく
          </button>
        )}
        {m.actions?.includes('draw_diagram') && (
          <button
            className="rounded px-3 py-1.5 border hover:bg-gray-50"
            disabled={isBusy}
            onClick={() => sendTutorAction('draw_diagram', { wantDiagram: true })}
          >
            図で見たい
          </button>
        )}
        {m.actions?.includes('show_full_solution') && (
          <button
            className="rounded px-3 py-1.5 border hover:bg-gray-50"
            disabled={isBusy}
            onClick={() => sendTutorAction('show_full_solution')}
          >
            解法を表示
          </button>
        )}
        {m.actions?.includes('next_problem') && (
          <button
            className="rounded px-3 py-1.5 border hover:bg-gray-50"
            disabled={isBusy}
            onClick={() => sendTutorAction('next_problem')}
          >
            次の問題へ
          </button>
        )}
      </div>
    );

    if (m.kind === 'diagram') {
      return (
        <div key={m.id} className="rounded-xl border p-4 bg-white">
          {header}
          <VizRunner spec={m.diagram} />
          {cites}
          {buttons}
        </div>
      );
    }

    return (
      <div key={m.id} className="rounded-xl border p-4 bg-white">
        {header}
        {m.message_md && (
          <div className="prose max-w-none">
            <MathMarkdown content={m.message_md} />
          </div>
        )}
        {m.diagram && (
          <div className="mt-3">
            <VizRunner spec={m.diagram} />
          </div>
        )}
        {cites}
        {buttons}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1) チューター（段階的開示UI） */}
      {msgs.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">チューター</h3>
          <div className="space-y-3">{msgs.map(renderTutorMsg)}</div>
        </section>
      )}

      {/* 2) 既存の「セクション」＋図のMVP */}
      {sections.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">解説セクション</h3>
          <div className="space-y-6">
            {sections.map((sec) => {
              const isOpen = !!open[sec.key];
              const spec = specByKey[sec.key] ?? null;
              const errMsg = errorByKey[sec.key];

              return (
                <div key={sec.key} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <button className="text-left w-full" onClick={() => toggle(sec.key)}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{sec.title}</h4>
                        <span>{isOpen ? '−' : '+'}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {spec && (
                        <button
                          onClick={() => setShowJsonKey((k) => (k === sec.key ? null : sec.key))}
                          className="shrink-0 rounded-lg px-3 py-1.5 border hover:bg-gray-50"
                        >
                          {showJsonKey === sec.key ? 'JSONを隠す' : 'JSONを表示'}
                        </button>
                      )}
                      <button
                        onClick={() => requestDiagramForSection(sec)}
                        disabled={loadingKey === sec.key}
                        className="shrink-0 rounded-lg px-3 py-1.5 border hover:bg-gray-50 disabled:opacity-60"
                      >
                        {loadingKey === sec.key ? '生成中…' : '図を表示'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-4">
                      <div className="prose max-w-none whitespace-pre-wrap">{sec.body}</div>

                      {errMsg && (
                        <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                          図の生成に失敗しました：{errMsg}
                        </div>
                      )}

                      {spec && (
                        <>
                          <VizRunner spec={spec} />
                          {showJsonKey === sec.key && (
                            <div className="rounded-lg border bg-gray-50 p-3">
                              <div className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">vizSpec</span>（設計図 JSON）
                              </div>
                              <pre className="text-xs overflow-auto max-h-72">
                                {JSON.stringify(spec, null, 2)}
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3) 例・演習・次へ（従来どおり） */}
      {examples.length > 0 && (
        <section className="rounded-xl border p-4 space-y-2">
          <h3 className="font-semibold">例</h3>
          <ul className="list-disc pl-6 space-y-2">
            {examples.map((ex, i) => (
              <li key={i}>
                <div className="font-medium">問題</div>
                <div className="whitespace-pre-wrap">{ex.prompt}</div>
                <div className="font-medium mt-2">解答</div>
                <div className="whitespace-pre-wrap">{ex.solution}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {exercises.length > 0 && (
        <section className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">演習</h3>
          <ol className="list-decimal pl-6 space-y-2">
            {exercises.map((ex) => (
              <li key={ex.id}>
                <div className="whitespace-pre-wrap">{ex.prompt}</div>
                {ex.hint?.length ? (
                  <div className="text-sm text-gray-600 mt-1">ヒント: {ex.hint.join(' / ')}</div>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      )}

      {nextCandidates.length > 0 && (
        <section className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">次に進む</h3>
          <div className="flex flex-wrap gap-2">
            {nextCandidates.map((nc) => (
              <button
                key={nc.key}
                onClick={() => onPickNext?.(nc.key)}
                className="rounded-lg px-3 py-2 border hover:bg-gray-50"
              >
                {nc.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
