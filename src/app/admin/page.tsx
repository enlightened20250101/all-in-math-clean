import Link from "next/link";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export default async function AdminHomePage() {
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
        <h1 className="text-xl font-semibold">管理ダッシュボード</h1>
        <p className="text-sm text-rose-600 mt-2">権限がありません。</p>
      </div>
    );
  }

  const [reportsCount, contactsCount, postsCount, threadsCount, articlesCount] = await Promise.all([
    sb.from("reports").select("id", { count: "exact", head: true }),
    sb.from("contact_messages").select("id", { count: "exact", head: true }),
    sb.from("posts").select("id", { count: "exact", head: true }),
    sb.from("threads").select("id", { count: "exact", head: true }),
    sb.from("articles").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "通報", value: reportsCount.count ?? 0 },
    { label: "お問い合わせ", value: contactsCount.count ?? 0 },
    { label: "投稿", value: postsCount.count ?? 0 },
    { label: "スレッド", value: threadsCount.count ?? 0 },
    { label: "記事", value: articlesCount.count ?? 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold">管理ダッシュボード</h1>
        <p className="text-[11px] sm:text-sm text-slate-500">全体の状況と管理ページへの入口</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-4">
            <div className="text-[11px] text-slate-500">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/reports"
          className="rounded-2xl border bg-white p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="text-sm font-semibold">通報一覧</div>
          <div className="text-[11px] text-slate-500 mt-1">通報内容の確認と対応</div>
        </Link>
        <Link
          href="/admin/contacts"
          className="rounded-2xl border bg-white p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
        >
          <div className="text-sm font-semibold">お問い合わせ一覧</div>
          <div className="text-[11px] text-slate-500 mt-1">受信したお問い合わせの確認</div>
        </Link>
      </section>
    </div>
  );
}
