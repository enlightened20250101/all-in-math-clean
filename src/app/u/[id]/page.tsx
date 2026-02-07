import { notFound } from "next/navigation";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import Link from "next/link";

export default async function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = id;
  const sb = await supabaseServerReadOnly();

  // プロフィール＋統計
  const { data: pr } = await sb
    .from("profiles")
    .select("id,display_name,avatar_url,grade,learning_stage,target_level,user_rank")
    .eq("id", userId)
    .maybeSingle();
  if (!pr) notFound();

  const { data: stats } = await sb.from("user_stats").select("*").eq("user_id", userId).maybeSingle();

  // 最近の質問・回答（最新10）
  const { data: latestPosts } = await sb.from("posts")
    .select("id,title,created_at")
    .eq("author_id", userId).order("created_at", { ascending: false }).limit(10);

  const { data: latestAnswers } = await sb.from("comments")
    .select("id,post_id,votes,created_at,is_answer")
    .eq("author_id", userId).order("created_at", { ascending: false }).limit(10);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
      <header className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pr.avatar_url || "https://placehold.co/96x96?text=%E4%BA%BA"}
          alt=""
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border"
        />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{pr.display_name || "ユーザー"}</h1>
          <div className="text-[11px] sm:text-sm text-gray-600">ID: {pr.id}</div>
        </div>
        <div className="ml-auto">
          <Link
            href={`/messages/new?user=${encodeURIComponent(pr.id)}`}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] sm:text-sm text-slate-700 hover:border-slate-300"
          >
            メッセージ
          </Link>
        </div>
      </header>

      <section className="border rounded-lg p-3 sm:p-4 bg-white text-[11px] sm:text-sm text-gray-700 grid gap-2 sm:grid-cols-2">
        <InfoRow label="学年" value={pr?.grade || "未設定"} />
        <InfoRow label="学習済み範囲" value={pr?.learning_stage || "未設定"} />
        <InfoRow label="志望レベル" value={pr?.target_level || "未設定"} />
        <InfoRow label="ユーザーランク" value={pr?.user_rank || "未設定"} />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <Stat label="質問数" value={stats?.questions_count ?? 0} />
        <Stat label="解決質問" value={stats?.solved_questions ?? 0} />
        <Stat label="回答数" value={stats?.answers_count ?? 0} />
        <Stat label="受けた票" value={stats?.votes_received ?? 0} />
        <Stat label="ベストアンサー" value={stats?.best_answers_count ?? 0} />
      </section>

      <section className="border rounded-lg p-3 sm:p-4 bg-white">
        <h2 className="text-sm sm:text-lg font-semibold mb-2">最近の質問</h2>
        <ul className="space-y-1">
          {(latestPosts || []).map((p:any) => (
            <li key={p.id} className="text-[11px] sm:text-sm">
              <Link className="hover:underline" href={`/posts/${p.id}`}>{p.title}</Link>
              <span className="text-[10px] sm:text-xs text-gray-500 ml-2">{new Date(p.created_at).toLocaleString()}</span>
            </li>
          ))}
          {(!latestPosts || latestPosts.length === 0) && (
            <li className="text-[11px] sm:text-sm text-gray-500">最近の質問はありません。</li>
          )}
        </ul>
      </section>

      <section className="border rounded-lg p-3 sm:p-4 bg-white">
        <h2 className="text-sm sm:text-lg font-semibold mb-2">最近の回答</h2>
        <ul className="space-y-1">
          {(latestAnswers || []).map((c:any) => (
            <li key={c.id} className="text-[11px] sm:text-sm">
              <Link className="hover:underline" href={`/posts/${c.post_id}`}>質問 #{c.post_id} へ</Link>
              <span className="text-[10px] sm:text-xs text-gray-500 ml-2">{new Date(c.created_at).toLocaleString()}</span>
              {c.is_answer && <span className="ml-2 text-emerald-700 text-[10px] sm:text-xs">✅ ベストアンサー</span>}
              <span className="ml-2 text-[10px] sm:text-xs text-gray-600">票:{c.votes}</span>
            </li>
          ))}
          {(!latestAnswers || latestAnswers.length === 0) && (
            <li className="text-[11px] sm:text-sm text-gray-500">最近の回答はありません。</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-3 text-center bg-white">
      <div className="text-[10px] sm:text-sm text-gray-500">{label}</div>
      <div className="text-lg sm:text-xl font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 bg-white">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
