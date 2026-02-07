"use client";

import { useEffect, useState, useTransition } from "react";
import { moderateTarget } from "./actions";

type Props = {
  reportId: number;
  targetType: string;
  targetId: string;
};

const SUPPORTED = new Set([
  "post",
  "comment",
  "thread",
  "thread_post",
  "group_message",
  "article_comment",
]);

export default function ReportActionButtons({ reportId, targetType, targetId }: Props) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const supported = SUPPORTED.has(targetType);

  const handleRemove = () => {
    if (!supported || pending) return;
    const ok = confirm("通報対象を削除して解決にしますか？");
    if (!ok) return;
    startTransition(async () => {
      try {
        await moderateTarget(reportId, targetType, targetId);
        setToast({ message: "削除して解決しました", type: "success" });
      } catch (e) {
        setToast({ message: "削除に失敗しました", type: "error" });
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={!supported || pending}
        onClick={handleRemove}
        className={`rounded-full border px-3 py-1 text-[10px] sm:text-xs transition ${
          supported
            ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
            : "border-slate-200 bg-slate-50 text-slate-400"
        } ${pending ? "opacity-60 cursor-wait" : ""}`}
      >
        {supported ? "削除して解決" : "対象外"}
      </button>
      {toast ? (
        <div
          className={`absolute right-0 mt-2 rounded border px-3 py-2 text-[10px] sm:text-xs shadow-sm ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
