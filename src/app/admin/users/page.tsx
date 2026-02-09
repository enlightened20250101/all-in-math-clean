import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import UserRankSelect from "./UserRankSelect";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; rank?: string; grade?: string }>;
}) {
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
        <h1 className="text-xl font-semibold">ユーザー管理</h1>
        <p className="text-sm text-rose-600 mt-2">権限がありません。</p>
      </div>
    );
  }

  const resolved = (await searchParams) ?? {};
  const q = (resolved.q ?? "").trim();
  const rank = (resolved.rank ?? "all").trim();
  const grade = (resolved.grade ?? "all").trim();

  let query = sb
    .from("profiles")
    .select("id, display_name, grade_level, user_rank, created_at, avatar_url")
    .order("created_at", { ascending: false })
    .limit(200);

  if (rank && rank !== "all") {
    query = query.eq("user_rank", rank);
  }
  if (grade && grade !== "all") {
    query = query.eq("grade_level", grade);
  }
  if (q) {
    const isUuid = /^[0-9a-f-]{36}$/i.test(q);
    if (isUuid) {
      query = query.eq("id", q);
    } else {
      const qSafe = q.replace(/[%_]/g, "\\$&");
      query = query.or(`display_name.ilike.%${qSafe}%`);
    }
  }

  const { data: users } = await query;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">ユーザー管理</h1>
          <div className="text-[11px] sm:text-sm text-slate-500 mt-1">
            ユーザーの権限や基本情報を確認できます。
          </div>
        </div>
        <a
          href="/admin"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 shadow-sm transition hover:bg-slate-50 sm:text-sm"
        >
          管理トップへ
        </a>
      </div>

      <form className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm">
        <input
          name="q"
          placeholder="表示名 or ユーザーID"
          defaultValue={q}
          className="w-56 rounded border px-2 py-1"
        />
        <select name="rank" defaultValue={rank} className="rounded border px-2 py-1">
          <option value="all">全権限</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <select name="grade" defaultValue={grade} className="rounded border px-2 py-1">
          <option value="all">全学年</option>
          <option value="junior_1">中1</option>
          <option value="junior_2">中2</option>
          <option value="junior_3">中3</option>
          <option value="high_1">高1</option>
          <option value="high_2">高2</option>
          <option value="high_3">高3</option>
          <option value="other">その他</option>
        </select>
        <button type="submit" className="rounded-full border px-3 py-1 text-[10px] sm:text-xs">
          検索
        </button>
      </form>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-[11px] sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">表示名</th>
              <th className="px-3 py-2 text-left">学年</th>
              <th className="px-3 py-2 text-left">権限</th>
              <th className="px-3 py-2 text-left">登録日</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2 font-mono text-[11px]">{u.id}</td>
                <td className="px-3 py-2">{u.display_name ?? "-"}</td>
                <td className="px-3 py-2">{u.grade_level ?? "-"}</td>
                <td className="px-3 py-2">
                  <UserRankSelect userId={u.id} initialRank={u.user_rank ?? "user"} />
                </td>
                <td className="px-3 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  ユーザーがまだいません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
