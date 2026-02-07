import Link from "next/link";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

function sinceISO(range: string) {
  if (range === "7d")  return new Date(Date.now() - 7*24*3600*1000).toISOString();
  if (range === "30d") return new Date(Date.now() - 30*24*3600*1000).toISOString();
  return null; // all
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await searchParams;
  const range = sp.range || "30d";
  const since = sinceISO(range);

  const sb = await supabaseServerReadOnly();

  // 票の多い回答 TOP20
  let ansQ = sb.from("answer_ranking")
    .select("comment_id,post_id,author_id,votes,created_at,post_title")
    .order("votes", { ascending: false })
    .limit(20);
  if (since) ansQ = ansQ.gte("created_at", since);
  const { data: topAnswers } = await ansQ;

  // 票/ベストアンサーの多いユーザー TOP20（期間で切るならRPC版／全期間ならVIEW）
  let topUsers: any[] = [];
  if (since) {
    const { data } = await sb.rpc("user_stats_since", { p_since: since });
    topUsers = (data || []).sort((a:any,b:any) => (b.votes_received - a.votes_received)).slice(0,20);
  } else {
    const { data } = await sb.from("user_stats").select("*");
    topUsers = (data || []).sort((a:any,b:any) => (b.votes_received - a.votes_received)).slice(0,20);
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">ランキング</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">回答・貢献の上位を表示</div>
        </div>
        <div className="flex gap-2 text-[11px] sm:text-sm overflow-x-auto whitespace-nowrap">
          {[
            { r: "7d", label: "直近7日" },
            { r: "30d", label: "直近30日" },
            { r: "all", label: "全期間" },
          ].map((item) => (
            <Link
              key={item.r}
              href={`/rankings?range=${item.r}`}
              className={`px-3 py-1 rounded border ${range === item.r ? "bg-black text-white" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">票の多い回答</h2>
        <ul className="grid gap-3">
          {(topAnswers || []).map((c:any, i:number) => (
            <li key={c.comment_id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition">
              <div className="text-[10px] sm:text-sm text-gray-500">#{i+1} ・ 票:{c.votes} ・ {new Date(c.created_at).toLocaleString()}</div>
              <Link href={`/posts/${c.post_id}`} className="font-medium text-sm sm:text-base hover:underline">{c.post_title || `質問 #${c.post_id}`}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mb-3">貢献ユーザー</h2>
        <ul className="grid gap-3">
          {topUsers.map((u:any, i:number) => (
            <li key={u.user_id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition">
              <div className="text-[10px] sm:text-sm text-gray-500">#{i+1}</div>
              <div className="font-medium text-sm sm:text-base">{u.display_name || u.user_id}</div>
              <div className="text-[10px] sm:text-sm text-gray-600">
                回答:{u.answers_count} ・ ベストアンサー:{u.best_answers_count} ・ 受けた票:{u.votes_received} ・ 質問:{u.questions_count}
              </div>
              <Link href={`/u/${u.user_id}`} className="text-[11px] sm:text-sm text-blue-700 hover:underline">プロフィールへ</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
