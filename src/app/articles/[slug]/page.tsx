import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentsThread from "./CommentsThread";
import LikeButton from './LikeButton';
import CopyLinkButton from "@/components/CopyLinkButton";
import LocalSaveButton from "@/components/LocalSaveButton";
import InlineMathText from "@/components/InlineMathText";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const sb = await supabaseServerReadOnly();
  const { slug } = await params;

  let article: any = null;
  let articleErr: any = null;
  let serverError: string | null = null;
  ({ data: article, error: articleErr } = await sb
    .from("articles")
    .select("id, title, body_mdx, images, created_at, author_id, tags")
    .eq("slug", slug)
    .maybeSingle());
  if (articleErr) {
    ({ data: article } = await sb
      .from("articles")
      .select("id, title, body_mdx, images, created_at, author_id")
      .eq("slug", slug)
      .maybeSingle());
  }
  if (!article) notFound();

  let comments: any[] = [];
  try {
    const res = await sb
      .from("article_comments")
      .select("id, author_id, body_md, images, created_at, parent_comment_id")
      .eq("article_id", article.id)
      .order("created_at", { ascending: true });
    comments = res.data ?? [];
  } catch {
    serverError = serverError ?? "コメントの取得に失敗しました。";
    comments = [];
  }
  const lastActivity =
    (comments && comments.length > 0 ? comments[comments.length - 1].created_at : null) ||
    article.created_at;

  let related: any[] = [];
  try {
    if (Array.isArray(article.tags) && article.tags.length > 0) {
      const { data } = await sb
        .from("articles")
        .select("id, title, slug, created_at, tags")
        .overlaps("tags", article.tags)
        .neq("id", article.id)
        .order("created_at", { ascending: false })
        .limit(6);
      related = data ?? [];
    }
    if (!related.length) {
      const { data } = await sb
        .from("articles")
        .select("id, title, slug, created_at, tags")
        .neq("id", article.id)
        .order("created_at", { ascending: false })
        .limit(6);
      related = data ?? [];
    }
  } catch {
    serverError = serverError ?? "関連記事の取得に失敗しました。";
    related = [];
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8">
      {serverError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}
      <header className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-xl sm:text-2xl font-semibold">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-white/95">
            <span>{new Date(article.created_at).toLocaleString()}</span>
            {lastActivity && (
              <span className="text-white/95">最終更新: {new Date(lastActivity).toLocaleString()}</span>
            )}
            <span className="text-white/95">コメント: {(comments ?? []).length}</span>
            <CopyLinkButton href={`/articles/${slug}`} />
            <LocalSaveButton storageKey="saved:articles" value={slug} />
          </div>
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
              {article.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/articles?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                  className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <article className="border border-slate-200/80 rounded-[28px] p-5 sm:p-6 bg-white/95 shadow-sm ring-1 ring-slate-200/70 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <LikeButton articleId={article.id} />
        </div>
        <div className="prose max-w-none text-[11px] sm:text-base">
          <MarkdownRenderer markdown={article.body_mdx} />
        </div>
        {Array.isArray((article as any).images) && (article as any).images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(article as any).images.map((u: string, i: number) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded-2xl" />
            ))}
          </div>
        )}
      </article>

      <section id="comments" className="space-y-3">
        <h2 className="text-base sm:text-lg font-semibold">コメント</h2>
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/95 p-4 sm:p-5">
            <CommentsThread articleId={article.id} initial={comments || []} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-semibold">次に読む</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {related.map((a) => (
            <li key={a.id} className="border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md transition">
              <Link href={`/articles/${a.slug}`} className="text-[15px] sm:text-base font-medium hover:underline">
                <InlineMathText text={a.title} />
              </Link>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5">
                {new Date(a.created_at).toLocaleString()}
              </div>
              {Array.isArray(a.tags) && a.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                  {a.tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="px-3 py-1.5 bg-gray-100 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {related.length === 0 && (
            <li className="text-[11px] sm:text-sm text-gray-500">関連する記事が見つかりませんでした。</li>
          )}
        </ul>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const sb = await supabaseServerReadOnly();
  const { slug } = params;
  const { data } = await sb
    .from("articles")
    .select("title, body_mdx, images, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.title) {
    return { title: "記事が見つかりません" };
  }

  const description = buildDescription(data.body_mdx);
  const ogImage = Array.isArray(data.images) ? data.images[0] : null;

  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: data.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function buildDescription(body: string | null | undefined) {
  if (!body) return "数学の学びを深める記事です。";
  const stripped = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.slice(0, 140) || "数学の学びを深める記事です。";
}
