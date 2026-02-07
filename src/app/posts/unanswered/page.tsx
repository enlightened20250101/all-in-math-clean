// app/posts/unanswered/page.tsx
import Link from "next/link";
import InlineMathText from "@/components/InlineMathText";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export default async function UnansweredPage() {
  const sb = await supabaseServerReadOnly();
  const { data: stats } = await sb.from("posts_stats").select("id").eq("solved", false);
  const ids = (stats ?? []).map(s => s.id);
  const { data: rows } = ids.length
    ? await sb.from("posts").select("id,title,tags,level,created_at").in("id", ids).order("created_at", { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">未回答の質問</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">まだ回答がついていない質問</div>
        </div>
        <Link href="/posts" className="text-[11px] sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100 w-fit">一覧へ戻る</Link>
      </div>
      <ul className="grid gap-3 sm:gap-4">
        {(rows ?? []).map(p => (
          <li key={p.id} className="border rounded-xl p-4 bg-white hover:bg-gray-50 transition">
            <Link href={`/posts/${p.id}`} className="font-medium text-[15px] sm:text-base hover:underline">
              <InlineMathText text={p.title} />
            </Link>
            <div className="text-[11px] sm:text-sm text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
              <span>{new Date(p.created_at).toLocaleString()}</span>
              <span>レベル:{p.level}</span>
              {Array.isArray(p.tags) && p.tags.length > 0 && <span>{p.tags.join(" / ")}</span>}
            </div>
          </li>
        ))}
        {(!rows || rows.length === 0) && <li className="text-[11px] sm:text-sm text-gray-500">未回答の質問がありません。</li>}
      </ul>
    </div>
  );
}
