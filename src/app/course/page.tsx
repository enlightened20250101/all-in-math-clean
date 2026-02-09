import type { Metadata } from "next";
// src/app/course/page.tsx
import Link from "next/link";
import ReviewSummaryCard from "./ReviewSummaryCard";
import RecommendedNextWithSettingsClient from "./RecommendedNextWithSettingsClient";
import CourseHomeLinksClient from "./CourseHomeLinksClient";
import CourseResumeCardClient from "./CourseResumeCardClient";
import CourseTipsClient from "./CourseTipsClient";
import CourseRecentTopicLinkClient from "./CourseRecentTopicLinkClient";
import CourseRoadmapClient from "./CourseRoadmapClient";
import CourseContinueFloatingClient from "./CourseContinueFloatingClient";
export const metadata: Metadata = {
  title: "コース学習 | オルマ",
  description: "オルマのコース学習トップ。ロードマップと復習から次の学習を進めます。",
  openGraph: {
    title: "コース学習 | オルマ",
    description: "オルマのコース学習トップ。ロードマップと復習から次の学習を進めます。",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary",
    title: "コース学習 | オルマ",
    description: "オルマのコース学習トップ。ロードマップと復習から次の学習を進めます。",
    images: ["/twitter-image"],
  },
};


export default function CourseHomePage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="relative overflow-hidden rounded-[28px] border border-slate-400/80 chalkboard text-white p-6 sm:p-8 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Course Hub</div>
            <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">コース学習</div>
            <div className="mt-1 text-sm text-white/85">復習 → 次のトピックを効率よく</div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/course/topics"
              className="group inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/95 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-white transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 w-full sm:w-auto shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] tracking-wider text-slate-500">
                TP
              </span>
              <span>トピック一覧へ</span>
            </Link>
            <Link
              href="/course/review"
              className="group inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/90 px-5 py-3 text-xs sm:text-sm text-slate-900 hover:bg-white transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 w-full sm:w-auto shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] tracking-wider text-slate-500">
                RV
              </span>
              <span>復習へ</span>
            </Link>
            <Link
              href="/course/practice/session?scope=common"
              className="group inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/95 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-white transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 w-full sm:w-auto shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-[10px] tracking-wider text-slate-500">
                CT
              </span>
              <span>共通テスト演習</span>
            </Link>
          </div>
        </div>
        <details className="group relative z-10 mt-4">
          <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] sm:text-xs text-white/90 hover:bg-white/20 transition list-none">
            追加メニュー
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[10px] text-white/70 transition group-open:rotate-180">
              ⌃
            </span>
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/course/writeup"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-[11px] sm:text-xs text-slate-900 hover:bg-white transition active:scale-[0.98] active:shadow-inner"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-[9px] tracking-wider text-slate-500">
                WR
              </span>
              記述演習
            </Link>
            <Link
              href="/course/settings"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-[11px] sm:text-xs text-slate-900 hover:bg-white transition active:scale-[0.98] active:shadow-inner"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-[9px] tracking-wider text-slate-500">
                ST
              </span>
              コース設定
            </Link>
          </div>
        </details>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] border border-slate-400/80 bg-white/95 p-1.5">
            <ReviewSummaryCard />
          </div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] border border-slate-400/80 bg-white/95 p-1.5">
            <RecommendedNextWithSettingsClient defaultCourseId="hs_ia" defaultGoal={65} />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <div className="rounded-[31px] border border-slate-400/80 bg-white/95 p-1.5">
          <CourseRoadmapClient />
        </div>
      </div>

      <details className="group rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <summary className="rounded-[31px] border border-slate-400/80 bg-white/95 px-5 py-4 text-sm font-semibold text-slate-700 cursor-pointer list-none flex items-center justify-between">
          追加の学習ガイド / クイックアクセス
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-[11px] text-slate-400 transition group-open:rotate-180">
            ⌃
          </span>
        </summary>
        <div className="rounded-[31px] border border-slate-400/80 bg-white/95 p-4 sm:p-5 mt-3 grid gap-5 sm:grid-cols-2">
          <div className="rounded-[28px] border border-slate-400/80 bg-white/95 p-5 sm:p-6">
            <Link
              href="/course/review"
              className="group block rounded-[22px] border border-slate-400/80 p-5 sm:p-6 bg-white hover:shadow-lg hover:-translate-y-0.5 transition active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-[10px] tracking-wider text-slate-500">
                  RV
                </span>
                <div className="font-semibold text-[15px] sm:text-base">復習ページ</div>
              </div>
              <div className="text-[11px] sm:text-sm text-gray-600 mt-2">
                期限が来たトピックをまとめて復習します
              </div>
            </Link>
          </div>
          <div className="rounded-[28px] border border-slate-400/80 bg-white/95 p-1.5">
            <CourseResumeCardClient />
          </div>
          <div className="rounded-[28px] border border-slate-400/80 bg-white/95 p-6 sm:p-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:col-span-2">
            <div className="flex items-start gap-3 max-w-[520px]">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] tracking-wider text-slate-500">
                TIP
              </span>
              <CourseTipsClient />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end sm:gap-3 w-full sm:w-auto">
              <Link
                href="/course/review"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300/70 bg-blue-50 px-4 py-2.5 text-[11px] sm:text-sm text-blue-800 hover:bg-blue-100 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
              >
                復習を優先
              </Link>
              <Link
                href="/course/onboarding/diagnostic"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-4 py-2.5 text-[11px] sm:text-sm text-amber-800 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
              >
                診断へ
              </Link>
              <Link
                href="/course/topics"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-300/70 bg-sky-50 px-4 py-2.5 text-[11px] sm:text-sm text-sky-800 hover:bg-sky-100 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
              >
                詳細を見る
              </Link>
              <div className="col-span-2 sm:col-span-1">
                <CourseRecentTopicLinkClient />
              </div>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-400/80 bg-white/95 p-1.5 sm:col-span-2">
            <CourseHomeLinksClient />
          </div>
        </div>
      </details>
      <CourseContinueFloatingClient />
    </div>
  );
}
