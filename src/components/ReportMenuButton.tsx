"use client";

import { useEffect, useRef, useState } from "react";
import ReportButton from "@/components/ReportButton";

type Props = {
  targetType: string;
  targetId: string | number;
  buttonClassName?: string;
  menuClassName?: string;
};

export default function ReportMenuButton({
  targetType,
  targetId,
  buttonClassName = "",
  menuClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 ${buttonClassName}`}
        aria-label="menu"
      >
        ⋯
      </button>
      {open ? (
        <div
          className={`absolute right-0 mt-2 w-28 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ${menuClassName}`}
        >
          <ReportButton
            targetType={targetType}
            targetId={targetId}
            className="w-full rounded-lg px-2 py-1 text-left text-[10px] text-rose-600 hover:bg-rose-50"
            label="通報"
          />
        </div>
      ) : null}
    </div>
  );
}
