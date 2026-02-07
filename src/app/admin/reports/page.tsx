import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import ReportStatusSelect from "./ReportStatusSelect";
import ReportActionButtons from "./ReportActionButtons";

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

  const postMap = new Map((postsRes.data || []).map((p: any) => [String(p.id), p]));
  const commentMap = new Map((commentsRes.data || []).map((c: any) => [String(c.id), c]));
  const threadMap = new Map((threadsRes.data || []).map((t: any) => [String(t.id), t]));
  const threadPostMap = new Map((threadPostsRes.data || []).map((p: any) => [String(p.id), p]));
  const threadFromPostMap = new Map((threadsFromPostsRes || []).map((t: any) => [String(t.id), t]));
  const groupMessageMap = new Map((groupMessagesRes.data || []).map((m: any) => [String(m.id), m]));
  const articleCommentMap = new Map((articleCommentsRes.data || []).map((c: any) => [String(c.id), c]));
  const articleMap = new Map((articlesRes || []).map((a: any) => [String(a.id), a]));

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">通報一覧</h1>
        <div className="text-[11px] sm:text-sm text-slate-500 mt-1">
          通報内容の確認とステータス更新
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-[11px] sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">対象</th>
              <th className="px-3 py-2 text-left">リンク</th>
              <th className="px-3 py-2 text-left">理由</th>
              <th className="px-3 py-2 text-left">報告者</th>
              <th className="px-3 py-2 text-left">日時</th>
              <th className="px-3 py-2 text-left">状態</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {(reports || []).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">
                  <div className="text-[10px] text-slate-400">{r.target_type}</div>
                  <div className="font-mono text-[11px]">{r.target_id}</div>
                </td>
                <td className="px-3 py-2">
                  {(() => {
                    if (r.target_type === "post") {
                      const p = postMap.get(r.target_id);
                      if (!p) return "-";
                      return (
                        <a className="text-blue-600 underline" href={`/posts/${p.id}`} target="_blank" rel="noreferrer">
                          {p.title ?? "投稿"}
                        </a>
                      );
                    }
                    if (r.target_type === "comment") {
                      const c = commentMap.get(r.target_id);
                      if (!c) return "-";
                      return (
                        <a
                          className="text-blue-600 underline"
                          href={`/posts/${c.post_id}?comment=${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          投稿コメント
                        </a>
                      );
                    }
                    if (r.target_type === "thread") {
                      const t = threadMap.get(r.target_id);
                      if (!t) return "-";
                      const slug = t.slug ?? t.id;
                      return (
                        <a className="text-blue-600 underline" href={`/threads/${slug}`} target="_blank" rel="noreferrer">
                          {t.title ?? "スレッド"}
                        </a>
                      );
                    }
                    if (r.target_type === "thread_post") {
                      const tp = threadPostMap.get(r.target_id);
                      if (!tp) return "-";
                      const t = threadFromPostMap.get(String(tp.thread_id));
                      if (!t) return "-";
                      const slug = t.slug ?? t.id;
                      return (
                        <a
                          className="text-blue-600 underline"
                          href={`/threads/${slug}?reply=${tp.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          返信
                        </a>
                      );
                    }
                    if (r.target_type === "group_message") {
                      const m = groupMessageMap.get(r.target_id);
                      if (!m) return "-";
                      return (
                        <a
                          className="text-blue-600 underline"
                          href={`/groups/${m.group_id}?msg=${m.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          グループメッセージ
                        </a>
                      );
                    }
                    if (r.target_type === "article_comment") {
                      const c = articleCommentMap.get(r.target_id);
                      if (!c) return "-";
                      const a = articleMap.get(String(c.article_id));
                      if (!a) return "-";
                      return (
                        <a
                          className="text-blue-600 underline"
                          href={`/articles/${a.slug}?comment=${c.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          記事コメント
                        </a>
                      );
                    }
                    return "-";
                  })()}
                </td>
                <td className="px-3 py-2 whitespace-pre-wrap">{r.reason}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.created_by ?? "-"}</td>
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <ReportStatusSelect reportId={r.id} initialStatus={r.status} />
                </td>
                <td className="px-3 py-2">
                  <ReportActionButtons reportId={r.id} targetType={r.target_type} targetId={r.target_id} />
                </td>
              </tr>
            ))}
            {(!reports || reports.length === 0) && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-500">
                  通報はまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
