import Link from "next/link";

type Props = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const encoded = encodeURIComponent(q);

  const quickQueries = [
    "二次関数",
    "微分",
    "積分",
    "確率",
    "ベクトル",
    "数列",
    "複素数",
    "三角関数",
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border bg-white/95 p-5 sm:p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Search</p>
          <h1 className="text-xl sm:text-2xl font-semibold">サイト内検索</h1>
          <p className="text-sm text-slate-600">
            キーワードを入力して、記事・掲示板・Q&Aから探せます。
          </p>
        </div>
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" role="search" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="例: 二次関数、微分、確率"
            className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button
            type="submit"
            className="rounded-lg border bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            検索
          </button>
        </form>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href={`/articles${q ? `?q=${encoded}` : ""}`}
          className="rounded-[18px] border bg-white/95 p-4 hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <div className="text-sm font-semibold">記事を検索</div>
          <div className="mt-1 text-xs text-slate-500">解説・まとめ記事</div>
        </Link>
        <Link
          href={`/threads${q ? `?q=${encoded}` : ""}`}
          className="rounded-[18px] border bg-white/95 p-4 hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <div className="text-sm font-semibold">掲示板を検索</div>
          <div className="mt-1 text-xs text-slate-500">議論・相談</div>
        </Link>
        <Link
          href={`/posts${q ? `?q=${encoded}` : ""}`}
          className="rounded-[18px] border bg-white/95 p-4 hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <div className="text-sm font-semibold">Q&Aを検索</div>
          <div className="mt-1 text-xs text-slate-500">質問と回答</div>
        </Link>
      </section>

      <section className="rounded-[20px] border bg-white/95 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold">人気キーワード</h2>
          <span className="text-xs text-slate-500">ワンクリック検索</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickQueries.map((word) => (
            <Link
              key={word}
              href={`/search?q=${encodeURIComponent(word)}`}
              className="rounded-full border px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              {word}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border bg-white/95 p-4 sm:p-5">
        <h2 className="text-sm sm:text-base font-semibold">検索のヒント</h2>
        <ul className="mt-2 grid gap-2 text-xs sm:text-sm text-slate-600">
          <li>キーワードは1〜2語に絞ると見つけやすいです。</li>
          <li>記号がある場合は、日本語で言い換えて試してみてください。</li>
          <li>質問なら「Q&A」、議論は「掲示板」から始めるのが最短です。</li>
        </ul>
      </section>
    </div>
  );
}
