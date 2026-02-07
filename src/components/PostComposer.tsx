// components/PostComposer.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { action_formatPost, action_semanticSearch, action_createPost } from "@/app/actions/post";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import MarkdownEditor from "@/components/MarkdownEditor";
import ImageUploader from "@/components/ImageUploader";
import { useRouter } from "next/navigation";
import { sanitizeOnSubmit } from '@/lib/sanitize-on-submit';

type Suggest = { id: number; title: string; created_at: string; tags: string[]; score: number };

export default function PostComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<"HS"|"UG"|"ADV">("HS");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [suggests, setSuggests] = useState<Suggest[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState<"idle"|"format"|"search"|"save">("idle");
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function onFormat() {
    setLoading("format");
    try {
      const r = await action_formatPost(sanitizeOnSubmit({ title, body_md: body }));
      setTitle(r.title);
      setBody(r.body_md);
      setSummary(r.summary);
      if (r.tagSuggestions?.length) setTags(r.tagSuggestions);
    } finally { setLoading("idle"); }
  }

  async function onSearchDup() {
    setLoading("search");
    try {
      const r = await action_semanticSearch(sanitizeOnSubmit({ title, body_md: body }));
      setSuggests(r as any);
    } catch {
      setToast({ message: "いま重複チェックを実行できません（API制限中）。保存は可能です。", type: "error" });
    } finally { setLoading("idle"); }
  }

  async function onSave() {
    if (!title.trim() || !body.trim()) {
      setToast({ message: "タイトルと本文を入力してください。", type: "error" });
      return;
    }
    setLoading("save");
    try {
      const r = await action_createPost(
        sanitizeOnSubmit({
          title,
          body_md: body,
          level,
          tags,
          // @ts-ignore
          images: images.map(i => i.url),
        }) as any
      );
      router.replace(`/posts/${r.id}`);
    } catch (e: any) {
      setToast({ message: e.message || "保存に失敗しました", type: "error" });
    } finally { setLoading("idle"); }
  }

  const onComposerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      if (loading !== "idle") return;
      onSave();
    },
    [loading, onSave]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* 左：入力 */}
      <div className="space-y-3 sm:space-y-4">
        {toast ? (
          <div
            className={`rounded-md border px-2 py-1 text-[11px] sm:text-sm ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ) : null}
        <input
          className="w-full border px-3 py-2 rounded text-[12px] sm:text-sm"
          placeholder="タイトル（例：微分積分学の基本定理の直観）"
          value={title} onChange={e=>setTitle(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] sm:text-sm text-gray-600">難易度</label>
          <select className="border px-2 py-2 sm:py-1 rounded text-[12px] sm:text-sm" value={level} onChange={e=>setLevel(e.target.value as any)}>
            <option value="HS">高校</option>
            <option value="UG">大学基礎</option>
            <option value="ADV">専門</option>
          </select>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-sm text-gray-600">
            <span>本文</span>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Shift + Enter 改行</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Ctrl/⌘ + Enter 送信</span>
            </div>
          </div>
          <div
            onKeyDown={onComposerKeyDown}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 focus-within:ring-2 focus-within:ring-blue-200"
          >
            <MarkdownEditor
              value={body}
              onChange={setBody}
              placeholder={'質問本文をMarkdown + TeXで。\n例：$\\int_a^b f\'(x)dx = f(b)-f(a)$'}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] sm:text-sm text-gray-600">画像（任意）</label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="px-3 py-2 rounded bg-gray-200 text-[11px] sm:text-sm" onClick={onFormat} disabled={loading!=="idle"}>
            {loading==="format" ? "整形中…" : "AI整形・要約・タグ候補"}
          </button>
          <button className="px-3 py-2 rounded bg-gray-200 text-[11px] sm:text-sm" onClick={onSearchDup} disabled={loading!=="idle"}>
            {loading==="search" ? "検索中…" : "重複チェック"}
          </button>
          <button className="sm:ml-auto px-4 py-2 rounded bg-black text-white text-[11px] sm:text-sm" onClick={onSave} disabled={loading!=="idle"}>
            {loading==="save" ? "保存中…" : "保存"}
          </button>
        </div>

        <div>
          <label className="text-[11px] sm:text-sm text-gray-600">タグ（カンマ区切り可）</label>
          <input
            className="w-full border px-3 py-2 rounded text-[12px] sm:text-sm"
            value={tags.join(", ")}
            onChange={e=>setTags(e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
          />
        </div>
      </div>

      {/* 右：プレビュー＆重複候補 */}
      <div className="space-y-4 sm:space-y-6">
        <section>
          <h3 className="font-semibold mb-2 text-sm sm:text-base">プレビュー</h3>
          <article className="prose max-w-none border rounded-xl p-3 text-[11px] sm:text-base bg-white">
            <MarkdownRenderer markdown={`# ${title}\n\n${body}`} />
          </article>
        </section>

        {summary && (
          <section>
            <h3 className="font-semibold mb-1 text-sm sm:text-base">要約</h3>
            <p className="text-[11px] sm:text-sm bg-gray-50 border rounded p-2 whitespace-pre-wrap">{summary}</p>
          </section>
        )}

        {!!suggests.length && (
          <section>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">似た質問（上位）</h3>
            <ul className="space-y-2">
              {suggests.map(s => (
                <li key={s.id} className="border rounded-xl p-3 bg-white">
                  <div className="text-[10px] sm:text-xs text-gray-500">類似度: {(s.score*100).toFixed(0)}%</div>
                  <a href={`/posts/${s.id}`} className="font-medium text-[11px] sm:text-sm hover:underline">{s.title}</a>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{(s.tags||[]).join(" / ")}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
