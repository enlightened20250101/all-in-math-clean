"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CommentItem from "./CommentItem";

type C = {
  id: number;
  body_md: string;
  images?: string[];
  votes: number;
  created_at: string;
  is_answer: boolean;
  author_id?: string | null;
};

export default function CommentsList({
  postId,
  initial,
  canMarkBest,
}: {
  postId: number;
  initial: C[];
  canMarkBest: boolean;
}) {
  const [items, setItems] = useState<C[]>(initial);
  const [hideSolved, setHideSolved] = useState(false);
  const [order, setOrder] = useState<"old" | "new" | "top">("old");
  const params = useSearchParams();
  const highlightId = useMemo(() => {
    const raw = params.get("comment");
    const num = raw ? Number(raw) : NaN;
    return Number.isFinite(num) ? num : null;
  }, [params]);

  // Realtime: comments の UPDATE/INSERT を購読して同期
  useEffect(() => {
    const ch = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload: any) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new as C];
            }
            if (payload.eventType === "UPDATE") {
              return prev.map((c) =>
                c.id === payload.new.id ? { ...(payload.new as C) } : c
              );
            }
            return prev;
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [postId]);

  // ベストアンサー楽観更新：全 false → 対象だけ true
  const optimisticallyMarkBA = (commentId: number) => {
    setItems((prev) =>
      prev.map((c) => ({ ...c, is_answer: c.id === commentId }))
    );
  };

  const filtered = hideSolved ? items.filter((c) => !c.is_answer) : items;
  const visible = [...filtered].sort((a, b) => {
    if (order === "top") return (b.votes ?? 0) - (a.votes ?? 0);
    const at = +new Date(a.created_at);
    const bt = +new Date(b.created_at);
    return order === "new" ? bt - at : at - bt;
  });
  const best = items.find((c) => c.is_answer) || null;

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`comment-${highlightId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, items]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
        <button
          type="button"
          className={`border rounded px-3 py-2 sm:py-1 ${order === "old" ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("old")}
        >
          古い順
        </button>
        <button
          type="button"
          className={`border rounded px-3 py-2 sm:py-1 ${order === "new" ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("new")}
        >
          新しい順
        </button>
        <button
          type="button"
          className={`border rounded px-3 py-2 sm:py-1 ${order === "top" ? "bg-black text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("top")}
        >
          高評価
        </button>
        <button
          type="button"
          className="border rounded px-3 py-2 sm:py-1 bg-white hover:bg-gray-50"
          onClick={() => setHideSolved((v) => !v)}
        >
          {hideSolved ? "解決済みを表示" : "解決済みを折りたたむ"}
        </button>
      </div>
      {best && (
        <div
          id={`comment-${best.id}`}
          className={`border rounded-xl p-4 bg-emerald-50/40 ${
            highlightId === best.id ? "ring-2 ring-amber-300" : ""
          }`}
        >
          <div className="text-[11px] sm:text-sm text-emerald-700 mb-2">ベストアンサー</div>
          <CommentItem
            c={best}
            canMarkBest={canMarkBest}
            onMarkBestOptimistic={() => optimisticallyMarkBA(best.id)}
          />
        </div>
      )}
      <ul className="space-y-3">
        {visible.filter((c) => c.id !== best?.id).map((c) => (
          <li key={c.id} id={`comment-${c.id}`}>
            <div className={highlightId === c.id ? "ring-2 ring-amber-300 rounded-xl" : ""}>
              <CommentItem
                c={c}
                canMarkBest={canMarkBest}
                onMarkBestOptimistic={() => optimisticallyMarkBA(c.id)}
              />
            </div>
          </li>
        ))}
        {visible.length === 0 && (
          <li className="text-[11px] sm:text-sm text-gray-500">解決済みのみのため非表示です。</li>
        )}
      </ul>
    </div>
  );
}
