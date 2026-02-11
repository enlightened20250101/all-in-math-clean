// src/app/course/writeup/list/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import WriteupListClient from "./writeupListClient";

export default function CourseWriteupListPage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-4 sm:p-8 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-20 -right-16 h-48 w-48 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">Writeup Library</div>
            <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">記述問題一覧</div>
            <div className="mt-1 text-sm text-white/85">
              単元と難易度で記述問題を整理して選べます。
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/course/writeup"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] sm:text-sm text-white/90 hover:bg-white/20 transition active:scale-[0.98]"
            >
              記述演習へ
            </Link>
            <Link
              href="/course/topics"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[10px] sm:text-sm text-white/90 hover:bg-white/20 transition active:scale-[0.98]"
            >
              トピック一覧へ
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <div className="rounded-[31px] bg-white/90 p-6 sm:p-8">
          <Suspense
            fallback={
              <div className="py-10 text-center text-sm text-slate-500">
                読み込み中…
              </div>
            }
          >
            <WriteupListClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
