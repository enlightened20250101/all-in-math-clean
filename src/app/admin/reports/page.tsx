import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import AdminReportsTableClient from "./AdminReportsTableClient";

export default async function AdminReportsPage() {
  const sb = await supabaseServerReadOnly();
  const { data: auth } = await sb.auth.getUser();
  const userId = auth.user?.id ?? null;
  const { data: me } = await sb
    .from("profiles")
    .select("user_rank, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (!userId || me?.user_rank !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6">
        <h1 className="text-xl font-semibold">通報一覧</h1>
        <p className="text-sm text-rose-600 mt-2">権限がありません。</p>
      </div>
    );
  }

  const { data: reports } = await sb
    .from("reports")
    .select("id, target_type, target_id, reason, status, created_by, created_at, resolved_at, resolved_by")
    .order("created_at", { ascending: false })
    .limit(200);

  const byType = new Map<string, Set<string>>();
  (reports || []).forEach((r: any) => {
    const set = byType.get(r.target_type) ?? new Set<string>();
    set.add(r.target_id);
    byType.set(r.target_type, set);
  });

  const toNum = (s: string) => (Number.isFinite(Number(s)) ? Number(s) : null);
  const toNums = (set?: Set<string>) => (set ? [...set].map(toNum).filter((v): v is number => v !== null) : []);

  const postIds = toNums(byType.get("post"));
  const commentIds = toNums(byType.get("comment"));
  const threadIds = toNums(byType.get("thread"));
  const threadPostIds = toNums(byType.get("thread_post"));
  const groupMessageIds = toNums(byType.get("group_message"));
  const articleCommentIds = toNums(byType.get("article_comment"));

  const [postsRes, commentsRes, threadsRes, threadPostsRes, groupMessagesRes, articleCommentsRes] = await Promise.all([
    postIds.length ? sb.from("posts").select("id,title").in("id", postIds) : Promise.resolve({ data: [] as any[] }),
    commentIds.length ? sb.from("comments").select("id,post_id").in("id", commentIds) : Promise.resolve({ data: [] as any[] }),
    threadIds.length ? sb.from("threads").select("id,slug,title").in("id", threadIds) : Promise.resolve({ data: [] as any[] }),
    threadPostIds.length ? sb.from("thread_posts").select("id,thread_id").in("id", threadPostIds) : Promise.resolve({ data: [] as any[] }),
    groupMessageIds.length ? sb.from("group_messages").select("id,group_id").in("id", groupMessageIds) : Promise.resolve({ data: [] as any[] }),
    articleCommentIds.length ? sb.from("article_comments").select("id,article_id").in("id", articleCommentIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const articleIds = (articleCommentsRes.data || []).map((c: any) => c.article_id);
  const threadIdsFromPosts = (threadPostsRes.data || []).map((p: any) => p.thread_id);
  const [articlesFetch, threadsFetch] = await Promise.all([
    articleIds.length ? sb.from("articles").select("id,slug,title").in("id", articleIds) : Promise.resolve({ data: [] as any[] }),
    threadIdsFromPosts.length ? sb.from("threads").select("id,slug,title").in("id", threadIdsFromPosts) : Promise.resolve({ data: [] as any[] }),
  ]);
  const articlesRes = articlesFetch.data;
  const threadsFromPostsRes = threadsFetch.data;

  const postMap: Map<string, any> = new Map((postsRes.data || []).map((p: any) => [String(p.id), p]));
  const commentMap: Map<string, any> = new Map((commentsRes.data || []).map((c: any) => [String(c.id), c]));
  const threadMap: Map<string, any> = new Map((threadsRes.data || []).map((t: any) => [String(t.id), t]));
  const threadPostMap: Map<string, any> = new Map((threadPostsRes.data || []).map((p: any) => [String(p.id), p]));
  const threadFromPostMap: Map<string, any> = new Map((threadsFromPostsRes || []).map((t: any) => [String(t.id), t]));
  const groupMessageMap: Map<string, any> = new Map((groupMessagesRes.data || []).map((m: any) => [String(m.id), m]));
  const articleCommentMap: Map<string, any> = new Map((articleCommentsRes.data || []).map((c: any) => [String(c.id), c]));
  const articleMap: Map<string, any> = new Map((articlesRes || []).map((a: any) => [String(a.id), a]));

  const rows = (reports || []).map((r: any) => {
    let linkHref: string | null = null;
    let linkLabel: string | null = null;
    if (r.target_type === "post") {
      const p = postMap.get(r.target_id);
      if (p) {
        linkHref = `/posts/${p.id}`;
        linkLabel = p.title ?? "投稿";
      }
    } else if (r.target_type === "comment") {
      const c = commentMap.get(r.target_id);
      if (c) {
        linkHref = `/posts/${c.post_id}?comment=${c.id}`;
        linkLabel = "投稿コメント";
      }
    } else if (r.target_type === "thread") {
      const t = threadMap.get(r.target_id);
      if (t) {
        const slug = t.slug ?? t.id;
        linkHref = `/threads/${slug}`;
        linkLabel = t.title ?? "スレッド";
      }
    } else if (r.target_type === "thread_post") {
      const tp = threadPostMap.get(r.target_id);
      if (tp) {
        const t = threadFromPostMap.get(String(tp.thread_id));
        if (t) {
          const slug = t.slug ?? t.id;
          linkHref = `/threads/${slug}?reply=${tp.id}`;
          linkLabel = "返信";
        }
      }
    } else if (r.target_type === "group_message") {
      const m = groupMessageMap.get(r.target_id);
      if (m) {
        linkHref = `/groups/${m.group_id}?msg=${m.id}`;
        linkLabel = "グループメッセージ";
      }
    } else if (r.target_type === "article_comment") {
      const c = articleCommentMap.get(r.target_id);
      if (c) {
        const a = articleMap.get(String(c.article_id));
        if (a) {
          linkHref = `/articles/${a.slug}?comment=${c.id}`;
          linkLabel = "記事コメント";
        }
      }
    }
    return {
      ...r,
      linkHref,
      linkLabel,
    };
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">通報一覧</h1>
        <div className="text-[11px] sm:text-sm text-slate-500 mt-1">
          通報内容の確認とステータス更新
        </div>
      </div>

      <AdminReportsTableClient rows={rows} />
    </div>
  );
}
