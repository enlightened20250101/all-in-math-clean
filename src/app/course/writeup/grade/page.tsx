import Link from "next/link";
import WriteupGradeClient from "./WriteupGradeClient";

export default function WriteupGradePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Writeup Grade</div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">採点ページ</h1>
          <p className="mt-1 text-xs text-slate-500">提出内容の簡易チェック結果を表示します。</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/course/writeup"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            記述トップへ
          </Link>
          <Link
            href="/course/writeup/list"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            保存一覧へ
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <WriteupGradeClient />
      </div>
    </div>
  );
}
