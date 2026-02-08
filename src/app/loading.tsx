// src/app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-white/20" />
          <div className="absolute inset-0 animate-[spin_1.4s_linear_infinite] rounded-full border-2 border-transparent border-t-white/90 border-r-white/60" />
          <div className="absolute inset-2 animate-[spin_2.4s_linear_infinite_reverse] rounded-full border border-transparent border-b-sky-300/80 border-l-sky-200/60" />
          <div className="absolute inset-5 rounded-full bg-gradient-to-br from-sky-200/80 to-white/90 shadow-[0_0_24px_rgba(186,230,253,0.55)]" />
        </div>
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.5em] text-white/50">Loading</div>
          <div className="mt-2 text-sm text-white/80">
            学習データを読み込んでいます
          </div>
        </div>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[loading-bar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-sky-200/90 via-white/90 to-sky-200/60" />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-120%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
}
