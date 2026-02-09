// src/app/loading.tsx
const LOADING_STYLE = process.env.NEXT_PUBLIC_LOADING_STYLE ?? "skeleton";

function SkeletonLoading({ showSpinner }: { showSpinner?: boolean }) {
  return (
    <div className="fixed inset-0 z-[200] bg-white text-slate-900">
      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-8 w-28 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-24 rounded-full bg-slate-100 animate-pulse" />
            <div className="mt-4 h-5 w-40 rounded-full bg-slate-100 animate-pulse" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded-full bg-slate-100 animate-pulse" />
            <div className="mt-4 h-5 w-36 rounded-full bg-slate-100 animate-pulse" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-3/5 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-2xl border border-slate-200 bg-white animate-pulse"
            />
          ))}
        </div>
        <div className="mt-auto flex items-center gap-3">
          <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-40 rounded-full bg-slate-100 animate-pulse" />
          {showSpinner ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs text-slate-700 shadow-sm">
                <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
                読み込み中
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SpinnerLoading() {
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
          <div className="mt-2 text-sm text-white/80">学習データを読み込んでいます</div>
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

export default function GlobalLoading() {
  if (LOADING_STYLE === "spinner") {
    return <SpinnerLoading />;
  }
  if (LOADING_STYLE === "hybrid") {
    return <SkeletonLoading showSpinner />;
  }
  return <SkeletonLoading />;
}
