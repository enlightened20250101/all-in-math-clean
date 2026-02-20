import Link from "next/link";
import dayjs from "dayjs";
import { supabaseServerPublic } from "@/lib/supabaseServerPublic";

async function getHotArticles(sb: ReturnType<typeof supabaseServerPublic>) {
  const { data } = await sb
    .from("article_hot")
    .select("article_id, hot_score")
    .order("hot_score", { ascending: false })
    .limit(3);
  const ids = (data ?? []).map((d) => d.article_id);
  if (!ids.length) return [];
  const { data: arts } = await sb
    .from("articles")
    .select("id,title,slug,created_at")
    .in("id", ids);
  return arts ?? [];
}

async function getHotThreads(sb: ReturnType<typeof supabaseServerPublic>) {
  const { data } = await sb
    .from("thread_hot")
    .select("thread_id, hot_score")
    .order("hot_score", { ascending: false })
    .limit(3);
  const ids = (data ?? []).map((d) => d.thread_id);
  if (!ids.length) return [];
  const { data: threads } = await sb
    .from("threads")
    .select("id,title,slug,created_at")
    .in("id", ids);
  return threads ?? [];
}

export default async function Home() {
  const sb = supabaseServerPublic();
  const [hotArticles, hotThreads] = await Promise.all([
    getHotArticles(sb),
    getHotThreads(sb),
  ]);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-8 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-28 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="text-xs uppercase tracking-[0.28em] text-white/80">オルマ</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            学ぶ・語る・解決する数学コミュニティ
          </h1>
          <p className="text-sm sm:text-base text-white/85 max-w-2xl">
            オルマは、記事・掲示板・Q&A・コース学習が揃う日本語向け数学コミュニティ。Markdown + TeX で数式をスムーズに書けます。
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white px-5 py-2.5 text-slate-900 shadow-sm hover:bg-white/90 transition active:scale-[0.98]"
            >
              コース学習へ
            </Link>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-white/95 hover:bg-white/25 transition"
            >
              質問する
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-4 py-2 text-white/80 hover:bg-white/10 transition"
            >
              記事を見る
            </Link>
          </div>
        </div>
      </section>
      {/* Main navigation cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
        <Link
          href="/course"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">📘</span>
              <span>コース学習</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">ロードマップで順番に学ぶ</p>
          </div>
        </Link>
        <Link
          href="/search"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">🔍</span>
              <span>サイト内検索</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">記事・掲示板・Q&Aから探す</p>
          </div>
        </Link>
        <Link
          href="/threads"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">💬</span>
              <span>掲示板</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">議論・相談・共有</p>
          </div>
        </Link>

        <Link
          href="/graphs/new"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">📈</span>
              <span>グラフ</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">関数やデータを可視化</p>
          </div>
        </Link>
        <Link
          href="/posts"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition cursor-pointer flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">❓</span>
              <span>質問Q&A</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">質問一覧・検索・未回答を見る</p>
          </div>
          <div className="mt-2 flex gap-2 text-[11px] sm:text-xs text-slate-500">
            質問する / 未回答
          </div>
        </Link>

        <Link
          href="/groups"
          className="aspect-square rounded-[18px] border border-slate-300/80 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] transition cursor-pointer flex flex-col text-center"
        >
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <h3 className="font-semibold text-lg sm:text-xl inline-grid grid-cols-[1.6rem_auto] items-center gap-2 mx-auto">
              <span className="inline-flex w-6 justify-center text-[1.05em] leading-none opacity-90">👥</span>
              <span>
                <span className="hidden sm:inline">グループチャット</span>
                <span className="sm:hidden">グループ<br />チャット</span>
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">グループで議論・共有</p>
          </div>
          <div className="mt-2 flex gap-2 text-[11px] sm:text-xs text-slate-500">一覧 / 作成</div>
        </Link>
      </section>
      {/* Hot Articles */}
      <section className="max-w-6xl mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">🔥 Hotな記事</h2>
          <Link href="/articles" className="text-xs sm:text-sm text-blue-700 hover:underline">もっと見る</Link>
        </div>
        <ul className="grid md:grid-cols-3 gap-3">
          {hotArticles.length === 0 && (
            <li className="text-xs sm:text-sm text-gray-500">まだ記事がありません。</li>
          )}
          {hotArticles.map((a) => (
            <li key={a.id} className="border border-slate-300/70 rounded-[16px] p-3 bg-white/95 hover:bg-slate-50 transition">
              <Link href={`/articles/${a.slug}`} className="font-medium text-sm sm:text-base hover:underline">
                {a.title}
              </Link>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                {dayjs(a.created_at).format("YYYY/MM/DD HH:mm")}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Hot Threads */}
      <section className="max-w-6xl mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">💬 Hotなスレッド</h2>
          <Link href="/threads" className="text-xs sm:text-sm text-blue-700 hover:underline">もっと見る</Link>
        </div>
        <ul className="grid md:grid-cols-3 gap-3">
          {hotThreads.length === 0 && (
            <li className="text-xs sm:text-sm text-gray-500">まだスレッドがありません。</li>
          )}
          {hotThreads.map((t) => (
            <li key={t.id} className="border border-slate-300/70 rounded-[16px] p-3 bg-white/95 hover:bg-slate-50 transition">
              <Link href={`/threads/${t.slug}`} className="font-medium text-sm sm:text-base hover:underline">
                {t.title}
              </Link>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1">
                {dayjs(t.created_at).format("YYYY/MM/DD HH:mm")}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
