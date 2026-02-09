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
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/80">オルマ</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            学ぶ・語る・解決する数学コミュニティ
          </h1>
          <p className="text-[11px] sm:text-base text-white/85 max-w-2xl">
            オルマは、記事・掲示板・Q&A・コース学習が揃う日本語向け数学コミュニティ。Markdown + TeX で数式をスムーズに書けます。
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-sm">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-4 py-2 text-slate-900 hover:bg-white transition active:scale-[0.98]"
            >
              コース学習へ
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20 transition"
            >
              記事を見る
            </Link>
            <Link
              href="/threads"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20 transition"
            >
              掲示板を見る
            </Link>
            <Link
              href="/graphs"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20 transition"
            >
              グラフを描く
            </Link>
            <Link
              href="/posts/new"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20 transition"
            >
              質問する
            </Link>
          </div>
        </div>
      </section>
      {/* Main navigation cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        <Link
          href="/course"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <h3 className="font-semibold text-sm sm:text-base">📘 コース学習</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">ロードマップで順番に学ぶ</p>
        </Link>
        <Link
          href="/articles"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <h3 className="font-semibold text-sm sm:text-base">🔍 記事検索</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">タイトル・本文・タグから探す</p>
        </Link>
        <Link
          href="/threads"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <h3 className="font-semibold text-sm sm:text-base">💬 掲示板</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">議論・相談・共有</p>
        </Link>
        <Link
          href="/rankings"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <h3 className="font-semibold text-sm sm:text-base">🏆 ランキング</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">人気記事・活発スレッド</p>
        </Link>

        <Link
          href="/graphs"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <h3 className="font-semibold text-sm sm:text-base">📈 グラフ</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">関数やデータを可視化</p>
        </Link>
        <Link
          href="/posts"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
        >
          <h3 className="font-semibold text-sm sm:text-base">❓ 質問Q&A</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">質問一覧・検索・未回答を見る</p>
          <div className="mt-2 flex gap-2 text-[10px] sm:text-xs text-slate-500">
            質問する / 未回答
          </div>
        </Link>

        <Link
          href="/groups"
          className="rounded-[18px] border border-slate-300/70 bg-white/95 p-4 hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer"
        >
          <h3 className="font-semibold text-sm sm:text-base">👥 グループチャット</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">グループで議論・共有</p>
          <div className="mt-2 flex gap-2 text-[10px] sm:text-xs text-slate-500">一覧 / 作成</div>
        </Link>
      </section>
      {/* Hot Articles */}
      <section className="max-w-5xl mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">🔥 Hotな記事</h2>
          <Link href="/articles" className="text-[11px] sm:text-sm text-blue-700 hover:underline">もっと見る</Link>
        </div>
        <ul className="grid md:grid-cols-3 gap-3">
          {hotArticles.length === 0 && (
            <p className="text-[11px] sm:text-sm text-gray-500">まだ記事がありません。</p>
          )}
          {hotArticles.map((a) => (
            <li key={a.id} className="border border-slate-300/70 rounded-[16px] p-3 bg-white/95 hover:bg-slate-50 transition">
              <Link href={`/articles/${a.slug}`} className="font-medium text-sm sm:text-base hover:underline">
                {a.title}
              </Link>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {dayjs(a.created_at).format("YYYY/MM/DD HH:mm")}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Hot Threads */}
      <section className="max-w-5xl mx-auto space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">💬 Hotなスレッド</h2>
          <Link href="/threads" className="text-[11px] sm:text-sm text-blue-700 hover:underline">もっと見る</Link>
        </div>
        <ul className="grid md:grid-cols-3 gap-3">
          {hotThreads.length === 0 && (
            <p className="text-[11px] sm:text-sm text-gray-500">まだスレッドがありません。</p>
          )}
          {hotThreads.map((t) => (
            <li key={t.id} className="border border-slate-300/70 rounded-[16px] p-3 bg-white/95 hover:bg-slate-50 transition">
              <Link href={`/threads/${t.slug}`} className="font-medium text-sm sm:text-base hover:underline">
                {t.title}
              </Link>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {dayjs(t.created_at).format("YYYY/MM/DD HH:mm")}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
