"use client";

import { useCallback, useEffect, useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { supabase } from "@/lib/supabaseClient";
import MarkdownEditor from "@/components/MarkdownEditor";
import ImageUploader from "@/components/ImageUploader";
import type { AComment } from "./CommentsThread";
import { useArticleCommentLike } from "@/components/useArticleCommentLike";
import ReportMenuButton from "@/components/ReportMenuButton";

export default function CommentNode({
  node,
  getChildren,
  articleId,
  onInserted,
  highlightId,
}: {
  node: AComment;
  getChildren: (id: number) => AComment[];
  articleId: number;
  onInserted: (c: AComment) => void;
  highlightId?: number | null;
}) {
  const [openReply, setOpenReply] = useState(false);
  const kids = getChildren(node.id);

  return (
    <li
      id={`comment-${node.id}`}
      className={`border border-slate-200/80 rounded-[24px] p-4 bg-white/95 shadow-sm ring-1 ring-slate-200/70 ${
        highlightId === node.id ? "ring-2 ring-amber-300" : ""
      }`}
    >
      <div className="prose max-w-none text-[11px] sm:text-base">
        <MarkdownRenderer markdown={node.body_md} />
      </div>

      {Array.isArray(node.images) && node.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {node.images.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded" />
          ))}
        </div>
      )}

      {/* フッター（日時＋いいね＋返信ボタン） */}
      <CommentFooter
        commentId={node.id}
        createdAt={node.created_at}
        onClickReply={() => setOpenReply((v) => !v)}
        isReplyOpen={openReply}
      />

      {/* 返信フォーム */}
      {openReply && (
        <div className="mt-2">
          <ReplyForm
            articleId={articleId}
            parentId={node.id}
            onInserted={(row) => {
              onInserted(row);         // ← 楽観追加（親側で重複チェック済みなら二重にならない）
              setOpenReply(false);
            }}
            placeholder="このコメントに返信（Markdown + TeX）"
          />
        </div>
      )}

      {/* 子ツリー */}
      {kids.length > 0 && (
        <ul className="mt-3 space-y-3 ml-3 sm:ml-4 border-l border-slate-200/70 pl-3">
          {kids.map((child) => (
            <CommentNode
              key={child.id}
              node={child}
              getChildren={getChildren}
              articleId={articleId}
              onInserted={onInserted}
              highlightId={highlightId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ===== いいね＋日時＋返信ボタン ===== */
function CommentFooter({
  commentId,
  createdAt,
  onClickReply,
  isReplyOpen,
}: {
  commentId: number;
  createdAt: string;
  onClickReply: () => void;
  isReplyOpen: boolean;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const { count, mine, toggle } = useArticleCommentLike(commentId, (message) => setToast(message));

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="mt-2 text-[11px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-2">
      <time dateTime={createdAt}>{new Date(createdAt).toLocaleString()}</time>

      <div className="ml-auto grid gap-2 w-full sm:w-auto sm:flex sm:items-center">
        <ReportMenuButton targetType="article_comment" targetId={commentId} />
        <button
          className={`px-3 py-2 border rounded-full text-[11px] sm:text-xs transition active:scale-[0.98] active:shadow-inner ${mine ? "text-rose-700 border-rose-300 bg-rose-50" : "hover:bg-gray-50"}`}
          onClick={toggle}
          aria-pressed={mine}
          aria-label={`このコメントにいいね（現在 ${count}）`}
        >
          いいね {count}
        </button>

        <button className="px-3 py-2 border rounded-full text-[11px] sm:text-xs hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner" onClick={onClickReply}>
          {isReplyOpen ? "返信を閉じる" : "返信する"}
        </button>
      </div>
      {toast ? (
        <div className="w-full rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-700" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

/* ===== 返信フォーム（ルート兼用） ===== */
export function ReplyForm({
  articleId,
  parentId,
  onInserted,
  placeholder,
}: {
  articleId: number;
  parentId: number | null;
  onInserted: (c: AComment) => void;
  placeholder?: string;
}) {
  const [body, setBody] = useState("");
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function submit() {
    if (loading) return;
    if (!body.trim() && images.length === 0) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.assign(`/login?returnTo=/articles/${articleId}`);
        return;
      }
      const { data, error } = await supabase
        .from("article_comments")
        .insert({
          article_id: articleId,
          author_id: user.id,
          body_md: body.trim(),
          images: images.map((i) => i.url),
          parent_comment_id: parentId,
        })
        .select()
        .single();
      if (error) throw error;

      // 楽観追加（CommentsThread 側で重複チェックが入っていればOK）
      onInserted(data as AComment);

      // フィールドクリア
      setBody("");
      setImages([]);
    } catch (e: any) {
      setToast({ message: e.message || "投稿に失敗しました", type: "error" });
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
    <div className="space-y-2">
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
        <span>返信を書く</span>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Shift + Enter 改行</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Ctrl/⌘ + Enter 送信</span>
        </div>
      </div>
      <div
        onKeyDown={onComposerKeyDown}
        className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 focus-within:ring-2 focus-within:ring-blue-200"
      >
        <MarkdownEditor value={body} onChange={setBody} placeholder={placeholder} />
      </div>
      <ImageUploader value={images} onChange={setImages} />
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-slate-900 text-white rounded-full disabled:opacity-50 text-[11px] sm:text-sm transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "送信中…" : "投稿"}
        </button>
      </div>
    </div>
  );
}

// 親から静的に参照できるように
CommentNode.ReplyForm = ReplyForm as any;
