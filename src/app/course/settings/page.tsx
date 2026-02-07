import AuthGate from "@/components/AuthGate";
import CourseSettingsClient from "./CourseSettingsClient";
import Link from "next/link";

export default function CourseSettingsPage() {
  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-5 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-4 sm:p-7 shadow-xl ring-1 ring-white/10">
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Settings</div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold">コース設定</h2>
            <p className="text-[10px] sm:text-sm text-white/85 mt-2">
              目標スコアに応じて、学習プラン（おすすめトピックの順序）が切り替わります。
            </p>
          </div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/90 p-1.5">
            <CourseSettingsClient />
          </div>
        </div>
        <Link
          href="/course/onboarding/diagnostic"
          className="inline-flex items-center gap-2 text-[10px] sm:text-sm text-blue-700 px-3 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full sm:w-fit"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-white/80">
            DX
          </span>
          診断を受ける →
        </Link>
      </div>
    </AuthGate>
  );
}
