// app/posts/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CopyLinkButton from "@/components/CopyLinkButton";
import LocalSaveButton from "@/components/LocalSaveButton";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";
import CommentsList from "./CommentsList";
import InlineMathText from "@/components/InlineMathText";
import ReportMenuButton from "@/components/ReportMenuButton";

type Props = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: Props) {
  // --- 1) パラメータ検証 ---
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();

  // --- 2) サーバー側Supabaseクライアント（Cookie込み） ---
  const sb = await supabaseServerReadOnly();
  let serverError: string | null = null;

  // 現在のログインユーザー（ベストアンサー権限判定に使用）
  const {
    data: { user },
  } = await sb.auth.getUser().catch(() => ({ data: { user: null } } as any));

  // --- 3) 投稿本体の取得 ---
  const { data: post, error: postErr } = await sb
    .from("posts")
    .select("id,title,body_md,images,tags,level,created_at,author_id")
    .eq("id", numId)
    .single();

  if (postErr || !post) notFound();

  // --- 4) コメント一覧 ---
  let comments: any[] = [];
  try {
    const res = await sb
      .from("comments")
      .select("id,body_md,images,votes,created_at,is_answer,author_id")
      .eq("post_id", numId)
      .order("created_at", { ascending: true });
    comments = res.data ?? [];
  } catch {
    serverError = serverError ?? "コメントの取得に失敗しました。";
    comments = [];
  }
  const lastActivity =
    (comments && comments.length > 0 ? comments[comments.length - 1].created_at : null) ||
    post.created_at;

  let related: any[] = [];
  try {
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      const { data } = await sb
        .from("posts")
        .select("id,title,created_at,level,tags")
        .overlaps("tags", post.tags)
        .neq("id", post.id)
        .order("created_at", { ascending: false })
        .limit(6);
      related = data ?? [];
    }
    if (!related.length) {
      const { data } = await sb
        .from("posts")
        .select("id,title,created_at,level,tags")
        .eq("level", post.level)
        .neq("id", post.id)
        .order("created_at", { ascending: false })
        .limit(6);
      related = data ?? [];
    }
  } catch {
    serverError = serverError ?? "関連投稿の取得に失敗しました。";
    related = [];
  }

  // 投稿者本人ならベストアンサー設定ボタンを表示できる
  const canMarkBest = !!user && user.id === post.author_id;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
      {serverError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}
      {/* ヘッダー */}
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm text-gray-500">
          <span>{new Date(post.created_at).toLocaleString()}</span>
          <span>レベル:{post.level}</span>
          {lastActivity && (
            <span className="text-gray-400">最終更新: {new Date(lastActivity).toLocaleString()}</span>
          )}
          <span className="text-gray-400">コメント: {(comments ?? []).length}</span>
          <CopyLinkButton href={`/posts/${post.id}`} className="ml-0 sm:ml-2" />
          <LocalSaveButton storageKey="saved:posts" value={post.id} />
          <ReportMenuButton targetType="post" targetId={post.id} />
        </div>
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
            {post.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/posts?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* 本文（Markdown + TeX） */}
      <article className="prose max-w-none text-[11px] sm:text-base">
        <MarkdownRenderer markdown={post.body_md} />
      </article>

      {/* 画像グリッド（任意） */}
      {Array.isArray(post.images) && post.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {post.images.map((u: string, i: number) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={u}
              alt=""
              className="w-full h-28 sm:h-40 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* コメント */}
      <section id="comments" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">コメント</h2>
        <CommentForm postId={post.id} />
        <CommentsList
          postId={post.id}
          initial={(comments ?? []) as any}
          canMarkBest={canMarkBest}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg sm:text-xl font-semibold">次に読む</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {related.map((p) => (
            <li key={p.id} className="border rounded-xl p-4 bg-white hover:bg-gray-50 transition">
              <Link href={`/posts/${p.id}`} className="text-[15px] sm:text-base font-medium hover:underline">
                <InlineMathText text={p.title} />
              </Link>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                <span>{new Date(p.created_at).toLocaleString()}</span>
                <span>レベル:{p.level}</span>
              </div>
              {Array.isArray(p.tags) && p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                  {p.tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="px-2 py-1 bg-gray-100 rounded">{t}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {related.length === 0 && (
            <li className="text-[11px] sm:text-sm text-gray-500">関連する質問が見つかりませんでした。</li>
          )}
        </ul>
      </section>
    </div>
  );
}
