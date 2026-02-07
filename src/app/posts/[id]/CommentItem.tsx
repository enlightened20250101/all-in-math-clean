"use client";

import MarkdownRenderer from "@/components/MarkdownRenderer";
import ReportButton from "@/components/ReportButton";
import { action_voteComment, action_markBestAnswer } from "@/app/actions/post";
import { useEffect, useState } from "react";

export default function CommentItem({
  c,
  canMarkBest,
  onMarkBestOptimistic,
}: {
  c: {
    id: number;
    body_md: string;
    images?: string[];
    votes: number;
    created_at: string;
    is_answer: boolean;
    author_id?: string | null;
  };
  canMarkBest: boolean;
  onMarkBestOptimistic: () => void;
}) {
  const [v, setV] = useState(c.votes);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function vote(d: 1 | -1) {
    setV((x) => Math.max(0, x + d)); // 楽観更新
    try {
      await action_voteComment(c.id, d);
    } catch (e: any) {
      setToast({ message: e.message || "投票に失敗しました", type: "error" });
      setV(c.votes);
    }
  }

  async function markBA() {
    // 先にUI側で一意化
    onMarkBestOptimistic();
    try {
      await action_markBestAnswer(c.id);
      // サーバー確定後は Realtime UPDATE が飛んで最終状態に揃う
    } catch (e: any) {
      setToast({ message: e.message || "ベストアンサー設定に失敗しました", type: "error" });
    }
  }

  const isBA = c.is_answer; // ← ローカルstateは持たず props を信じる

  return (
    <div className={`border rounded-xl p-4 bg-white ${isBA ? "border-emerald-500" : ""}`}>
      {isBA && <div className="text-emerald-600 text-[11px] sm:text-xs font-semibold mb-1">✅ ベストアンサー</div>}

      <div className="prose max-w-none text-[11px] sm:text-base">
        <MarkdownRenderer markdown={c.body_md} />
      </div>

      {Array.isArray(c.images) && c.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {c.images.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded" />
          ))}
        </div>
      )}

      <div className="mt-2 text-[11px] sm:text-xs text-gray-500 flex flex-wrap items-center gap-2">
        <span>{new Date(c.created_at).toLocaleString()}</span>
        <div className="ml-auto flex items-center gap-2">
          <ReportButton targetType="comment" targetId={c.id} />
          <button className="border rounded px-2.5 py-1 text-[11px] sm:text-xs" onClick={() => vote(1)}>＋</button>
          <span className="min-w-6 text-center">{v}</span>
          <button className="border rounded px-2.5 py-1 text-[11px] sm:text-xs" onClick={() => vote(-1)} disabled={v <= 0}>−</button>
          {canMarkBest && !isBA && (
            <button className="ml-2 rounded px-2.5 py-1 bg-emerald-600 text-white text-[11px] sm:text-xs" onClick={markBA}>
              ベストアンサーにする
            </button>
          )}
        </div>
      </div>
      {toast ? (
        <div
          className={`mt-2 rounded-md border px-2 py-1 text-[11px] sm:text-xs ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
