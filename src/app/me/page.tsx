import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import MyLearningSummaryClient from "./MyLearningSummaryClient";
import MasteredTopicsClient from "./MasteredTopicsClient";

export default async function MyPage() {
  const sb = await supabaseServerReadOnly();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?next=/me");

  const userId = user.id;
  const { data: profile } = await sb
    .from("profiles")
    .select("id,display_name,avatar_url,grade,learning_stage,target_level,user_rank,mastered_topic_ids")
    .eq("id", userId)
    .maybeSingle();

  const { data: stats } = await sb.from("user_stats").select("*").eq("user_id", userId).maybeSingle();

  const { data: latestPosts } = await sb
    .from("posts")
    .select("id,title,created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: latestAnswers } = await sb
    .from("comments")
    .select("id,post_id,votes,created_at,is_answer")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: latestThreadPosts } = await sb
    .from("thread_posts")
    .select("id,thread_id,created_at,body_md")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(8);

  const threadIds = (latestThreadPosts ?? []).map((p: any) => p.thread_id).filter(Boolean);
  const { data: threads } = threadIds.length
    ? await sb.from("threads").select("id,title,slug").in("id", threadIds)
    : { data: [] as any[] };
  const threadMap = new Map((threads ?? []).map((t: any) => [t.id, t]));

  const name = profile?.display_name || "ユーザー";
  const avatar = profile?.avatar_url || "https://placehold.co/96x96?text=%E4%BA%BA";

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">マイページ</h1>
            <div className="text-[11px] sm:text-sm text-gray-600">{name}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/profile?next=/me"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] sm:text-sm hover:bg-gray-50 transition"
          >
            プロフィール編集
          </Link>
          <Link
            href={`/u/${userId}`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] sm:text-sm hover:bg-gray-50 transition"
          >
            公開プロフィール
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border bg-white p-4 sm:p-5 space-y-3">
        <div className="text-sm font-semibold">学習状況</div>
        <MyLearningSummaryClient />
      </section>

      <section className="rounded-2xl border bg-white p-4 sm:p-5 grid gap-3 sm:grid-cols-2">
        <InfoRow label="学年" value={profile?.grade || "未設定"} />
        <InfoRow label="学習済み範囲" value={profile?.learning_stage || "未設定"} />
        <InfoRow label="志望レベル" value={profile?.target_level || "未設定"} />
        <InfoRow label="ユーザーランク" value={profile?.user_rank || "未設定"} />
      </section>

      <MasteredTopicsClient />

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="質問数" value={stats?.questions_count ?? 0} />
        <Stat label="解決質問" value={stats?.solved_questions ?? 0} />
        <Stat label="回答数" value={stats?.answers_count ?? 0} />
        <Stat label="受けた票" value={stats?.votes_received ?? 0} />
        <Stat label="ベストアンサー" value={stats?.best_answers_count ?? 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold mb-2">最近の質問</h2>
          <ul className="space-y-1">
            {(latestPosts || []).map((p: any) => (
              <li key={p.id} className="text-[11px] sm:text-sm">
                <Link className="hover:underline" href={`/posts/${p.id}`}>
                  {p.title}
                </Link>
                <span className="text-[10px] sm:text-xs text-gray-500 ml-2">
                  {new Date(p.created_at).toLocaleString()}
                </span>
              </li>
            ))}
            {(!latestPosts || latestPosts.length === 0) && (
              <li className="text-[11px] sm:text-sm text-gray-500">最近の質問はありません。</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold mb-2">最近の回答</h2>
          <ul className="space-y-1">
            {(latestAnswers || []).map((c: any) => (
              <li key={c.id} className="text-[11px] sm:text-sm">
                <Link className="hover:underline" href={`/posts/${c.post_id}`}>
                  質問 #{c.post_id} へ
                </Link>
                <span className="text-[10px] sm:text-xs text-gray-500 ml-2">
                  {new Date(c.created_at).toLocaleString()}
                </span>
                {c.is_answer ? (
                  <span className="ml-2 text-emerald-700 text-[10px] sm:text-xs">✅ ベストアンサー</span>
                ) : null}
                <span className="ml-2 text-[10px] sm:text-xs text-gray-600">票:{c.votes}</span>
              </li>
            ))}
            {(!latestAnswers || latestAnswers.length === 0) && (
              <li className="text-[11px] sm:text-sm text-gray-500">最近の回答はありません。</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-semibold mb-2">掲示板の返信</h2>
          <ul className="space-y-1">
            {(latestThreadPosts || []).map((p: any) => {
              const thread = threadMap.get(p.thread_id);
              return (
                <li key={p.id} className="text-[11px] sm:text-sm">
                  <Link
                    className="hover:underline"
                    href={thread?.slug ? `/threads/${thread.slug}` : `/threads`}
                  >
                    {thread?.title || "スレッドへ"}
                  </Link>
                  <span className="text-[10px] sm:text-xs text-gray-500 ml-2">
                    {new Date(p.created_at).toLocaleString()}
                  </span>
                </li>
              );
            })}
            {(!latestThreadPosts || latestThreadPosts.length === 0) && (
              <li className="text-[11px] sm:text-sm text-gray-500">最近の返信はありません。</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-4 text-center">
      <div className="text-[10px] sm:text-sm text-gray-500">{label}</div>
      <div className="text-lg sm:text-xl font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2 bg-white text-[11px] sm:text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
