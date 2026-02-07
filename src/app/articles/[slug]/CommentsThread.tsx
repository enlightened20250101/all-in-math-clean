"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CommentNode from "./CommentNode";

export type AComment = {
  id: number;
  author_id: string | null;
  body_md: string;
  images?: string[];
  created_at: string;
  parent_comment_id: number | null;
};

export default function CommentsThread({
  articleId,
  initial,
}: {
  articleId: number;
  initial: AComment[];
}) {
  const [items, setItems] = useState<AComment[]>(initial);
  const [order, setOrder] = useState<"old" | "new" | "featured">("old");
  const params = useSearchParams();
  const highlightId = useMemo(() => {
    const raw = params.get("comment");
    const num = raw ? Number(raw) : NaN;
    return Number.isFinite(num) ? num : null;
  }, [params]);

  useEffect(() => {
    const ch = supabase
      .channel(`article_comments:${articleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "article_comments", filter: `article_id=eq.${articleId}` },
        (payload: any) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as AComment;
              // 同じIDが既にあれば追加しない（送信直後の重複を防止）
              if (prev.some((c) => c.id === row.id)) return prev;
              return [...prev, row];
            }
            if (payload.eventType === "UPDATE") return prev.map((c) => (c.id === payload.new.id ? { ...(payload.new as AComment) } : c));
            if (payload.eventType === "DELETE") return prev.filter((c) => c.id !== payload.old.id);
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [articleId]);

  const tree = useMemo(() => {
    const children = new Map<number, AComment[]>();
    for (const c of items) {
      if (c.parent_comment_id != null) {
        const arr = children.get(c.parent_comment_id) || [];
        arr.push(c);
        children.set(c.parent_comment_id, arr);
      }
    }
    const roots = items.filter((c) => c.parent_comment_id == null);
    const sortByTime = (a: AComment, b: AComment) => a.created_at.localeCompare(b.created_at);
    const orderRoots = (list: AComment[]) => {
      if (order === "new") return [...list].sort((a, b) => sortByTime(b, a));
      return [...list].sort(sortByTime);
    };
    const getChildren = (id: number) => {
      const list = children.get(id) || [];
      if (order === "new") return [...list].sort((a, b) => sortByTime(b, a));
      return [...list].sort(sortByTime);
    };
    const sortedRoots = orderRoots(roots);
    return { roots: sortedRoots, getChildren };
  }, [items, order]);

  const onInserted = (row: AComment) =>
  setItems((prev) => (prev.some((c) => c.id === row.id) ? prev : [...prev, row]));

  const featured = useMemo(() => {
    const pick = [...items].sort((a, b) => b.body_md.length - a.body_md.length).slice(0, 1);
    return pick[0] ?? null;
  }, [items]);

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`comment-${highlightId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, items]);

  return (
    <div className="space-y-3">
      <div className="border border-slate-200/80 rounded-[24px] p-4 bg-white/95 shadow-sm ring-1 ring-slate-200/70">
        <div className="text-[11px] sm:text-sm text-gray-600 mb-2">コメントを書く</div>
        <CommentNode.ReplyForm
          articleId={articleId}
          parentId={null}
          onInserted={onInserted}
          placeholder="この記事にコメント（Markdown + TeX）"
        />
      </div>
      <div className="grid gap-2 text-[11px] sm:text-xs sm:flex sm:items-center">
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner ${order === "old" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("old")}
        >
          古い順
        </button>
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner ${order === "new" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("new")}
        >
          新しい順
        </button>
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner ${order === "featured" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("featured")}
        >
          注目
        </button>
      </div>
      {featured && order === "featured" && (
        <div className="border border-slate-200/80 rounded-[24px] p-4 bg-amber-50/60 shadow-sm">
          <div className="text-[11px] sm:text-sm text-amber-800 mb-2">注目コメント</div>
          <CommentNode
            node={featured}
            getChildren={() => []}
            articleId={articleId}
            onInserted={onInserted}
            highlightId={highlightId}
          />
        </div>
      )}
      <ul className="space-y-3">
        {tree.roots.filter((c) => (order === "featured" ? c.id !== featured?.id : true)).map((c) => (
          <CommentNode
            key={c.id}
            node={c}
            getChildren={tree.getChildren}
            articleId={articleId}
            onInserted={onInserted}
            highlightId={highlightId}
          />
        ))}
      </ul>
    </div>
  );
}
