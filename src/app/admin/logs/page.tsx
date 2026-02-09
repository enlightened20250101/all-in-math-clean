import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export default async function AdminLogsPage() {
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
        <h1 className="text-xl font-semibold">操作ログ</h1>
        <p className="text-sm text-rose-600 mt-2">権限がありません。</p>
      </div>
    );
  }

  const { data: logs } = await sb
    .from("admin_audit_logs")
    .select("id, admin_id, action, target_type, target_id, detail, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">操作ログ</h1>
          <div className="text-[11px] sm:text-sm text-slate-500 mt-1">
            管理操作の履歴を確認できます。
          </div>
        </div>
        <a
          href="/admin"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 shadow-sm transition hover:bg-slate-50 sm:text-sm"
        >
          管理トップへ
        </a>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-[11px] sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">日時</th>
              <th className="px-3 py-2 text-left">管理者</th>
              <th className="px-3 py-2 text-left">操作</th>
              <th className="px-3 py-2 text-left">対象</th>
              <th className="px-3 py-2 text-left">詳細</th>
            </tr>
          </thead>
          <tbody>
            {(logs || []).map((row: any) => (
              <tr key={row.id} className="border-t">
                <td className="px-3 py-2">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{row.admin_id}</td>
                <td className="px-3 py-2">{row.action}</td>
                <td className="px-3 py-2">
                  <div className="text-[10px] text-slate-400">{row.target_type ?? "-"}</div>
                  <div className="font-mono text-[11px]">{row.target_id ?? "-"}</div>
                </td>
                <td className="px-3 py-2 text-[10px] text-slate-600 whitespace-pre-wrap">
                  {row.detail ? JSON.stringify(row.detail) : "-"}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  ログはまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
