"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import MathMarkdown from "@/components/MathMarkdown";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import RootsInput from "@/app/learn/components/RootsInput";
import IntervalPad from "@/app/learn/components/IntervalPad";
import type { TutorMsg, TutorNextRequest, TutorNextResponse } from "@/app/learn/aiTypes";
import { VizRunner } from "@/components/viz";
import type { VizSpec } from "@/lib/vizSpec";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

// 小窓系は使わないが、既存のアニメ提案ボタンでは Provider が必要な場合があるため残す（未使用なら削除可）
import { AnimationDockProvider, useAnimationDock } from "@/components/animations/AnimationDock";
const InlineKatex = dynamic(() => import("@/components/graphs/InlineKatex"), { ssr: false });

type Problem = {
  id: string; skill_id: string; body_md: string;
  kind?: "integral"|"derivative"|"roots"|"inequality_set"|string|null;
  payload?: Record<string, any>|null;
};

type RoadmapMini = {
  ok: boolean;
  goal?: string;
  nextSkills?: Array<{ id: string; title: string }>;
  masteryToday?: number;
};

/* ─────────────────────────────────────────────
   “図で見たい”のサマリ整形（ブロックTeXを外して短文化）
   ───────────────────────────────────────────── */
function summarizeForAnim(md: string, max = 280) {
  let t = md ?? "";
  t = t.replace(/\$\$[\s\S]*?\$\$/g, " ");                 // ブロックTeX除去
  t = t.replace(/\$[^$]*\$/g, (m) => m.replace(/\s+/g,"")); // インラインTeXは圧縮
  t = t.replace(/\s+/g, " ").trim();
  return t.slice(0, max);
}

/* ─────────────────────────────────────────────
   既存のアニメ提案（任意）：使うなら小窓起動のため残す
   ───────────────────────────────────────────── */
function SuggestButtons({ problem, hint }: { problem: Problem | null; hint: string | null; }) {
  const { openAnimation } = useAnimationDock();
  const suggestions = useMemo(() => {
    const list: Array<{label:string; slug:string; id:string; params?:Record<string,any>}> = [];
    if (!problem) return list;
    const P = problem.payload || {};
    switch (problem.kind) {
      case "derivative":
        list.push({ label: "割線→接線（導関数のイメージ）をアニメで見る", slug: "calculus", id: "tangent-slope",
          params: { a: P.a ?? 1, b: P.b ?? 0, c: P.c ?? 0, x0: P.x0 ?? 1, h: P.h ?? 1 } });
        break;
      case "integral":
        list.push({ label: "リーマン和（左/右/中点・台形・シンプソン）を見る", slug: "calculus", id: "riemann-integral" });
        list.push({ label: "置換積分・部分積分を図で直感化する", slug: "calculus", id: "integration-tech" });
        break;
      case "inequality_set":
        list.push({ label: "不等式の解の領域（数直線/半平面/円錐曲線）を見る", slug: "algebra", id: "inequality-region",
          params: { A: P.A, B: P.B, C: P.C, kind2d: P.kind2d, rel: P.rel } });
        break;
      case "roots":
        list.push({ label: "平方完成をコマ送りで（頂点形/最小値まで）", slug: "algebra", id: "square-completion",
          params: { b: P.b ?? 6, c: P.c ?? 5, goal: "vertex" } });
        list.push({ label: "因数分解の手順を追う（AC分解を含む）", slug: "algebra", id: "factorization" });
        break;
      default:
        if (/平方完成|頂点|最小/.test(hint || "")) list.push({ label: "平方完成のコマ送りを見る", slug: "algebra", id: "square-completion",
          params: { b: 6, c: 5, goal: "vertex" } });
        if (/置換積分|部分積分|リーマン和|台形|シンプソン/.test(hint || "")) list.push({ label: "積分の可視化（置換・部分積分・近似）", slug: "calculus", id: "integration-tech" });
        if (/不等式|解の範囲|領域/.test(hint || "")) list.push({ label: "不等式の解集合（1D/2D）を可視化", slug: "algebra", id: "inequality-region" });
        break;
    }
    return list;
  }, [problem, hint]);

  if (!suggestions.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((sug, i) => (
        <button key={i} className="px-3 py-1.5 rounded border text-xs hover:bg-gray-50"
          onClick={() => openAnimation({ slug: sug.slug, id: sug.id, params: sug.params })}>
          {sug.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   メイン
   ───────────────────────────────────────────── */
export default function SkillLessonPage() {
  const { code } = useParams<{ code: string }>();

  // 会話スレッド（TutorMsg のみ）
  const [msgs, setMsgs] = useState<TutorMsg[]>(() => [
    {
      id: "seed",
      kind: "hint",
      detail_level: 1,
      message_md:
        `このセッションは **${code}** の学習です。自然文で質問してみてください（例：「定義→直感→例→結論の順で」「接線を図で」）。`,
      actions: ["show_more", "draw_diagram", "ask_answer", "next_problem"],
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  // 出力プリファレンス（1=要点, 2=標準, 3=丁寧）
  const [prefs, setPrefs] = useState({ detailLevel: 2, difficulty: 3, rigor: 6, languageLevel: 7 });

  // 図生成のbusy（問題カードのボタンで使用）
  const [diagramBusy, setDiagramBusy] = useState(false)

  // ロードマップ・ミニ
  const [mini, setMini] = useState<RoadmapMini | null>(null);

  // 演習問題（既存）
  const [answer, setAnswer] = useState("");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [grading, setGrading] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // ロードマップ・ミニ取得（あれば）
  useEffect(() => {
    (async () => {
      try {
        const j = await cachedFetchJson(
          "roadmap_current",
          30_000,
          async () => {
            const r = await fetch("/api/roadmap/current", { cache: "no-store" });
            const json = await r.json().catch(() => null);
            if (!r.ok || !json) throw new Error("roadmap current error");
            return json;
          }
        );
        const planNext = j?.summary?.plan?.next ?? j?.plan?.next ?? [];
        const nextSkills = Array.isArray(planNext)
          ? planNext.slice(0, 3).map((x: any) => ({ id: x.id ?? x, title: x.title ?? String(x) }))
          : [];
        setMini({
          ok: true,
          goal: j?.summary?.goal ?? j?.goal ?? j?.currentGoal ?? "",
          nextSkills,
          masteryToday: j?.summary?.masteryToday ?? j?.masteryToday ?? 0
        });
      } catch {}
    })();
  }, []);

  // 既存の問題ロード
  const loadFirst = useCallback(async () => {
    setLoading(true); setLoadErr(null);
    try {
      const r = await fetch(`/api/problems/next?skillId=${encodeURIComponent(code)}`, { cache: "no-store" });
      const js = await r.json();
      if (js?.ok) setProblem(js.problem as Problem);
      else setLoadErr(js?.error || "問題の取得に失敗しました。");
    } catch (e:any) {
      setLoadErr(String(e));
    } finally { setLoading(false); }
  }, [code]);
  useEffect(() => { void loadFirst(); }, [loadFirst]);

  // 回答送信（既存）
  async function submit() {
    if (!answer.trim()) return;
    setSubmitting(true); setHint(null); setGrading(null);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: code, problemId: problem?.id ?? null, answerLatex: answer.trim() }),
      });
      const js = await res.json();
      if (js?.hint?.message) setHint(js.hint.message);
      if (js?.grading) setGrading(js.grading);
    } finally { setSubmitting(false); }
  }
  async function loadNextProblem() {
    if (!problem) return;
    try {
      const r = await fetch(`/api/problems/next?skillId=${encodeURIComponent(problem.skill_id)}&after=${encodeURIComponent(problem.id)}`, { cache: "no-store" });
      const js = await r.json();
      const next = js?.ok && js.problem ? js.problem : null;
      if (!next) { await loadFirst(); return; }
      setProblem(next); setAnswer(""); setHint(null); setGrading(null);
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (e) {}
  }

  // Teach 連携：/api/learn/run（新UI）
  async function callTutor(action: TutorNextRequest["action"], opts?: { detailUp?: boolean; text?: string; anchorId?: string; anchorText?: string }) {
    setBusy(true);
    try {
      const last = msgs[msgs.length - 1];
      const req: TutorNextRequest = {
        sessionId: `skill:${code}`,
        lastMsgId: opts?.anchorId ?? last?.id,     // ★ アンカーがあればそれを優先
        action,
        detail_level: opts?.detailUp ? Math.min(3, (last?.detail_level ?? 1) + 1) as 1|2|3 : last?.detail_level,
        user_answer_md: opts?.text,
        prefs,                                     // ★ ユーザープリファレンス
        anchor: opts?.anchorId ? { id: opts.anchorId, text: opts?.anchorText } : undefined, // ★ 分岐
      };
      const res = await fetch("/api/learn/run", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
      });
      const data: TutorNextResponse = await res.json().catch(() => ({ ok: false, error: "bad json" }) as any);
      if (res.ok && data.ok) setMsgs((m) => [...m, ...data.messages]);
      else setMsgs((m) => [...m, { id:`err-${Date.now()}`, kind:"explain", detail_level:1, message_md:"応答に失敗しました。再度お試しください。", actions:["show_more"] }]);
    } finally { setBusy(false); }
  }

  // 図を生成（/api/anim）
  async function showDiagramFrom(md: string) {
    if (!md) return;
    setDiagramBusy(true);
    try {
      const summary = summarizeForAnim(md, 300);
      const res = await fetch("/api/anim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ summary }),
      });
      const js = await res.json();
      if (!res.ok || !js?.ok) throw new Error(js?.error || "anim failed");
  
      // 直前が diagram なら差し替え（連打で増やさない）
      setMsgs((prev) => {
        const last = prev[prev.length - 1];
        const dmsg: TutorMsg = {
          id: `diagram-${Date.now()}`,
          kind: "diagram",
          detail_level: 1,
          diagram: js.spec as VizSpec,
          actions: ["show_more", "show_full_solution", "next_problem"],
        };
        if (last?.kind === "diagram") {
          const cp = [...prev];
          cp[cp.length - 1] = dmsg;
          return cp;
        }
        return [...prev, dmsg];
      });
    } catch (e: any) {
      // エラーもスレッドに小さく流す
      setMsgs((prev) => [
        ...prev,
        {
          id: `diagram-error-${Date.now()}`,
          kind: "explain",
          detail_level: 1,
          message_md: `図の生成に失敗しました：${e?.message ?? String(e)}`,
          actions: ["show_more"],
        },
      ]);
    } finally {
      setDiagramBusy(false);
    }
  }

  // 自然言語の送信（ChatGPT風）
  async function onSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMsgs((m)=>[...m, { id:`user-${Date.now()}`, kind:"check", detail_level:1, message_md:text, actions:["show_more","draw_diagram"] }]);
    await callTutor("show_more", { text });
  }

  // 回答欄のショートカット
  function onKeyDownAnswer(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); void submit(); }
  }

  const placeholder = useMemo(() => {
    switch (problem?.kind) {
      case "integral":        return `例: \\frac{x^2}{2} + C`;
      case "derivative":      return `例: 3\\cos(3x)`;
      case "roots":           return `例: -1, 1`;
      case "inequality_set":  return `例: (-oo,-1] U [1,oo)`;
      default:                return `例: \\frac{x^2}{2} + C`;
    }
  }, [problem?.kind]);

  return (
    <AnimationDockProvider>
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        {/* ヘッダー：タイトル + ロードマップミニ（任意） */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">学習セッション: {code}</h1>
            <p className="text-gray-600 text-sm">自然文で質問 → 図で理解 → 最終答えを検証。</p>
          </div>
          {/* 出力設定（ミニ） */}
          <div className="rounded-xl border p-3 bg-white mr-2 hidden md:block">
            <div className="text-xs text-gray-600 mb-1">出力設定</div>
            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1">
                長さ
                <select value={prefs.detailLevel}
                  onChange={(e)=> setPrefs(p=>({...p, detailLevel:Number(e.target.value)}))}
                  className="border rounded px-1 py-0.5">
                  <option value={1}>要点</option>
                  <option value={2}>標準</option>
                  <option value={3}>丁寧</option>
                </select>
              </label>
              <label className="flex items-center gap-1">
                難易度
                <select value={prefs.difficulty}
                  onChange={(e)=> setPrefs(p=>({...p, difficulty:Number(e.target.value)}))}
                  className="border rounded px-1 py-0.5">
                  {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1">
                厳密さ
                <select value={prefs.rigor}
                  onChange={(e)=> setPrefs(p=>({...p, rigor:Number(e.target.value)}))}
                  className="border rounded px-1 py-0.5">
                  {[2,4,6,8,10].map(n=> <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
          </div>
          {mini?.ok && (
            <div className="rounded-xl border p-3 w-[320px] bg-white">
              <div className="text-sm font-medium mb-1">ロードマップ</div>
              {mini.goal && <div className="text-xs text-gray-600 mb-1">目標: {mini.goal}</div>}
              {typeof mini.masteryToday === "number" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs text-gray-600 shrink-0">今日の達成</div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.max(0, Math.min(100, mini.masteryToday))}%` }} />
                  </div>
                </div>
              )}
              {mini.nextSkills?.length ? (
                <div className="text-xs text-gray-700">
                  次に学ぶと良い：{" "}
                  {mini.nextSkills.map((s) => (
                    <a key={s.id} href={`/learn/skill/${encodeURIComponent(s.id)}`} className="underline hover:no-underline mr-2">
                      {s.title}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500">推奨未取得。<a className="underline ml-1" href="/roadmap">ロードマップを見る</a></div>
              )}
            </div>
          )}
        </div>

        {/* スレッド（TutorMsgのみ） */}
        <div className="space-y-3">
          {msgs.map((m, idx) => (
            <div key={m.id} className="rounded-xl border bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">
                {m.kind.toUpperCase()} {m.detail_level ? `(Level ${m.detail_level})` : ""}
              </div>
              {m.kind !== "diagram" && m.message_md && (
                <div className="prose max-w-none">
                  <MathMarkdown content={m.message_md} />
                </div>
              )}
              {m.kind === "diagram" && m.diagram && (
                <div className="mt-3"><VizRunner spec={m.diagram} /></div>
              )}
              {m.cites?.length ? (
                <div className="mt-2 text-xs text-gray-500">
                  参考: {m.cites.map((c, i) => <span key={i} className="mr-2">{c.title}</span>)}
                </div>
              ) : null}
              {(() => {
                const isLatest = idx === msgs.length - 1;
                if (isLatest) {
                  return (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.actions?.includes("show_more") && (
                        <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                          onClick={()=> callTutor("show_more", { detailUp:true })}>もっと詳しく</button>
                      )}
                      {m.actions?.includes("draw_diagram") && (
                        <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                          onClick={()=> showDiagramFrom(m.kind !== "diagram" ? (m.message_md ?? "") : "")}>図で見たい</button>
                      )}
                      {m.actions?.includes("show_full_solution") && (
                        <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                          onClick={()=> callTutor("show_full_solution")}>解法を表示</button>
                      )}
                      {m.actions?.includes("ask_answer") && (
                        <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                          onClick={()=> setDraft((d)=> d || "最終答えは …")}>解答を入力</button>
                      )}
                      {m.actions?.includes("next_problem") && (
                        <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                          onClick={()=> callTutor("next_problem")}>次の問題へ</button>
                      )}
                    </div>
                  );
                }
                // 過去カード → 分岐して続ける
                return (
                  <div className="mt-3">
                    <button className="rounded px-3 py-1.5 border hover:bg-gray-50" disabled={busy}
                      onClick={()=> callTutor("show_more", { anchorId: m.id, anchorText: m.kind !== "diagram" ? (m.message_md ?? "") : "" })}>
                      このカードから続ける
                    </button>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>

        {/* 問題カード（既存）＋ 図ボタン＋ vizSpec 表示 */}
        <section className="p-4 rounded-2xl border">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-medium">問題</h2>
            {problem?.kind && (
              <span className="text-xs rounded-full border px-2 py-0.5 text-gray-600 bg-gray-50">{problem.kind}</span>
            )}
            <button
              onClick={()=> problem?.body_md && showDiagramFrom(problem.body_md)}
              disabled={diagramBusy || !problem}
              className="ml-auto px-2.5 py-1.5 rounded border text-xs hover:bg-gray-50 disabled:opacity-60"
              title="この問題文から自動図示します"
            >
              {diagramBusy ? "図を生成中…" : "図で見たい"}
            </button>
          </div>

          {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
          {loadErr && <p className="text-sm text-red-600">{loadErr}</p>}
          {!loading && !loadErr && !problem && <p className="text-sm text-gray-500">問題が見つかりません。</p>}
          {problem && <MarkdownRenderer markdown={String(problem.body_md ?? "")} />}

          <SuggestButtons problem={problem} hint={null} />

        </section>

        {/* 回答（既存） */}
        <section className="p-4 rounded-2xl border">
          <h2 className="font-medium mb-2">回答（TeX）</h2>
          {problem?.kind === "roots" ? (
            <RootsInput value={answer} onChange={setAnswer} />
          ) : (
            <>
              {problem?.kind === "inequality_set" && <div className="mb-2"><IntervalPad onInsert={(t)=>{ setAnswer(a=>a+t); setTimeout(()=> textareaRef.current?.focus(), 0); }} /></div>}
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={onKeyDownAnswer}
                className="w-full h-28 rounded-xl border p-3 font-mono"
                placeholder={placeholder}
                spellCheck={false} autoCorrect="off" autoCapitalize="none"
              />
            </>
          )}
          <div className="mt-3 text-sm">プレビュー: <InlineKatex tex={answer || ""} /></div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={submit} disabled={submitting || !answer.trim()} className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50">
              {submitting ? "採点中..." : "提出して採点"}
            </button>
            <button type="button" onClick={() => { setAnswer(""); setTimeout(() => textareaRef.current?.focus(), 0); }} className="px-3 py-2 rounded-xl border text-sm">
              クリア
            </button>
          </div>
        </section>

        {/* 採点結果（既存） */}
        {grading && (
          <section className="p-4 rounded-2xl border">
            <h2 className="font-medium mb-2">採点</h2>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(grading, null, 2)}</pre>
            {grading?.ok && (
              <button onClick={loadNextProblem} className="mt-3 px-3 py-2 rounded-xl border text-sm">
                続けて解く（次の1問）
              </button>
            )}
          </section>
        )}

        {/* 下部：自然言語入力（ChatGPT風） */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t">
          <div className="mx-auto max-w-5xl p-3">
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); void onSend(); }
                }}
                className="w-full h-[86px] rounded-xl border p-3 font-sans"
                placeholder="質問や要望をどうぞ（例：平方完成の意味を直感的に / 例題1問出して / 接線を図で見たい）"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={onSend}
                  disabled={busy || !draft.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50"
                  title="⌘/Ctrl + Enter でも送信"
                >
                  送信
                </button>
                <button onClick={() => setDraft("")} className="px-4 py-2 rounded-xl border">クリア</button>
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">⌘/Ctrl + Enter で送信</div>
          </div>
        </div>
      </div>
    </AnimationDockProvider>
  );
}
