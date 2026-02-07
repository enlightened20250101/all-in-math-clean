"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/MarkdownEditor";
import ImageUploader from "@/components/ImageUploader";
import { sanitizeOnSubmit } from '@/lib/sanitize-on-submit';

export default function CommentForm({ postId }: { postId: number }) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function submit() {
    if (loading) return;
    if (!body.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.assign(`/login?returnTo=/posts/${postId}`);
        return;
      }
      const payload = sanitizeOnSubmit({
        post_id: postId,
        body_md: body,
        images: images.map(i => i.url),
        author_id: user.id,
      });
      const { error } = await supabase.from("comments").insert(payload);
      setBody("");
      setImages([]);
      router.refresh();
    } catch (e: any) {
      setToast({ message: e.message || "コメントの投稿に失敗しました", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const onComposerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      if (loading) return;
      submit();
    },
    [loading, submit]
  );

  return (
    <div className="space-y-2 border rounded-xl p-4 bg-white">
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
      <div className="flex items-center justify-between text-[11px] sm:text-sm text-gray-600">
        <span>コメントを書く</span>
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
          placeholder={"回答や補足をMarkdown + TeXで入力"}
        />
      </div>
      <ImageUploader value={images} onChange={setImages} />
      <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded-lg bg-black text-white text-[11px] sm:text-sm hover:bg-slate-900 disabled:opacity-60"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "送信中…" : "コメントを投稿"}
        </button>
      </div>
    </div>
  );
}
