import Link from "next/link";
import SavedLocalList from "@/components/SavedLocalList";

const cards = [
  {
    key: "threads",
    title: "スレッド",
    description: "掲示板の保存済み",
    storageKey: "saved:threads",
    basePath: "/threads",
    itemPath: "/threads/",
    kind: "threads",
  },
  {
    key: "articles",
    title: "記事",
    description: "学習記事の保存済み",
    storageKey: "saved:articles",
    basePath: "/articles",
    itemPath: "/articles/",
    kind: "articles",
  },
  {
    key: "posts",
    title: "Q&A",
    description: "質問の保存済み",
    storageKey: "saved:posts",
    basePath: "/posts",
    itemPath: "/posts/",
    kind: "posts",
  },
] as const;

export default function SavedPage() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">保存一覧</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">端末内に保存したリンク</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/threads" className="text-xs sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">掲示板へ</Link>
          <Link href="/articles" className="text-xs sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">記事へ</Link>
          <Link href="/posts" className="text-xs sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">Q&Aへ</Link>
        </div>
      </div>

      <div className="grid gap-4">
        {cards.map((c) => (
          <section key={c.key} className="border rounded-xl p-4 bg-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold">{c.title}</h2>
                <div className="text-[11px] sm:text-sm text-gray-500">{c.description}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`${c.basePath}?saved=1`}
                  className="border rounded px-3 py-2 sm:py-1 text-xs sm:text-xs bg-white hover:bg-gray-50"
                >
                  保存のみを見る
                </Link>
                <Link
                  href={c.basePath}
                  className="border rounded px-3 py-2 sm:py-1 text-xs sm:text-xs bg-white hover:bg-gray-50"
                >
                  一覧へ
                </Link>
              </div>
            </div>

            <div className="mt-3">
              <SavedLocalList storageKey={c.storageKey} itemPath={c.itemPath} kind={c.kind} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
