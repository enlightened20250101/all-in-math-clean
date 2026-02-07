"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ReportButtonProps = {
  targetType:
    | "comment"
    | "article_comment"
    | "post"
    | "thread"
    | "thread_post"
    | "group_message"
    | "dm_message";
  targetId: string | number;
  label?: string;
  className?: string;
  onReported?: () => void;
};

export default function ReportButton({
  targetType,
  targetId,
  label = "通報",
  className = "text-[10px] sm:text-xs text-rose-600 hover:underline",
  onReported,
}: ReportButtonProps) {
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleReport = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const reason = window.prompt("通報理由を入力してください（例: 荒らし/迷惑行為/不適切表現）");
    if (!reason) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setToast({ message: "ログインが必要です", type: "error" });
      return;
    }
    const { error } = await supabase.from("reports").insert({
      target_type: targetType,
      target_id: String(targetId),
      reason,
      created_by: auth.user.id,
    });
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setToast({ message: "通報を受け付けました", type: "success" });
    onReported?.();
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={handleReport} className={className}>
        {label}
      </button>
      {toast ? (
        <span
          className={`rounded border px-2 py-0.5 text-[10px] sm:text-xs ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
          role="status"
        >
          {toast.message}
        </span>
      ) : null}
    </span>
  );
}
