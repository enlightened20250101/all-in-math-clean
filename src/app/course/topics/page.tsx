import type { Metadata } from "next";
// src/app/course/topics/page.tsx
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import TopicsClient from "./TopicsClient";
export const metadata: Metadata = {
  title: "トピック一覧 | オルマ",
  description: "オルマの数学トピック一覧。復習対象や解説ページに素早くアクセス。",
  openGraph: {
    title: "トピック一覧 | オルマ",
    description: "オルマの数学トピック一覧。復習対象や解説ページに素早くアクセス。",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary",
    title: "トピック一覧 | オルマ",
    description: "オルマの数学トピック一覧。復習対象や解説ページに素早くアクセス。",
    images: ["/twitter-image"],
  },
};


export default function CourseTopicsPage() {
  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto p-4 space-y-5 sm:space-y-6">
        <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
          <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-white/6 blur-3xl" />
          <div className="absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">Topics</div>
              <h2 className="mt-2 text-xl sm:text-2xl font-semibold">トピック一覧</h2>
              <p className="mt-2 text-[10px] sm:text-sm text-white/95">
                トピックをクリックすると解説ページに移動します。「復習」バッジは今日の復習対象です。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/course"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-[11px] sm:text-sm text-white hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 w-full sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[9px] tracking-wider text-white/95">
                  HM
                </span>
                コースTOPへ
              </Link>
              <Link
                href="/course/practice/session?scope=common"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-[11px] sm:text-sm text-white hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 w-full sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[9px] tracking-wider text-white/95">
                  CT
                </span>
                共通テスト演習
              </Link>
              <Link
                href="/course/review"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-[11px] sm:text-sm text-white hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 w-full sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[9px] tracking-wider text-white/95">
                  RV
                </span>
                復習へ
              </Link>
              <Link
                href="/course/settings"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-[11px] sm:text-sm text-white hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 w-full sm:w-auto"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[9px] tracking-wider text-white/95">
                  ST
                </span>
                設定へ
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/90 p-1.5">
            <TopicsClient />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
