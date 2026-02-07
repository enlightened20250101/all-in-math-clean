// src/app/course/review/page.tsx

import AuthGate from "@/components/AuthGate";
import ReviewClient from "./ReviewClient";

export default function ReviewPage() {
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-5 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Review</div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold">復習（今日の分）</h2>
            <div className="mt-2 text-[10px] sm:text-sm text-white/85">
              期限が来たトピックを優先して学習しましょう
            </div>
          </div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/90 p-1.5">
            <ReviewClient />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
