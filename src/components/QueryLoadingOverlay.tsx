"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function QueryLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const prevRef = useRef({ pathname, search: searchParams.toString() });
  const timersRef = useRef<{ show?: number; hide?: number }>({});

  useEffect(() => {
    const currentSearch = searchParams.toString();
    const prev = prevRef.current;
    const samePath = prev.pathname === pathname;
    const searchChanged = prev.search !== currentSearch;

    prevRef.current = { pathname, search: currentSearch };

    if (!samePath || !searchChanged) {
      setActive(false);
      return;
    }

    if (timersRef.current.show) {
      window.clearTimeout(timersRef.current.show);
    }
    if (timersRef.current.hide) {
      window.clearTimeout(timersRef.current.hide);
    }

    timersRef.current.show = window.setTimeout(() => {
      setActive(true);
    }, 120);

    timersRef.current.hide = window.setTimeout(() => {
      setActive(false);
    }, 900);

    return () => {
      if (timersRef.current.show) {
        window.clearTimeout(timersRef.current.show);
      }
      if (timersRef.current.hide) {
        window.clearTimeout(timersRef.current.hide);
      }
    };
  }, [pathname, searchParams]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[180] flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs text-slate-700 shadow-sm">
        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
        読み込み中
      </div>
    </div>
  );
}
