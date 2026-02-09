import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import ContactStatusSelect from "./ContactStatusSelect";

export default async function AdminContactsPage() {
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
        <h1 className="text-xl font-semibold">お問い合わせ一覧</h1>
        <p className="text-sm text-rose-600 mt-2">権限がありません。</p>
      </div>
    );
  }

  const { data: messages } = await sb
    .from("contact_messages")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">お問い合わせ一覧</h1>
        <div className="text-[11px] sm:text-sm text-slate-500 mt-1">
          受信したお問い合わせを確認できます。
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-[11px] sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">名前</th>
              <th className="px-3 py-2 text-left">メール</th>
              <th className="px-3 py-2 text-left">件名</th>
              <th className="px-3 py-2 text-left">内容</th>
              <th className="px-3 py-2 text-left">状態</th>
              <th className="px-3 py-2 text-left">日時</th>
            </tr>
          </thead>
          <tbody>
            {(messages || []).map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="px-3 py-2 font-mono text-[11px]">{m.id}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2">
                  <a className="text-blue-600 underline" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                </td>
                <td className="px-3 py-2">{m.subject}</td>
                <td className="px-3 py-2 whitespace-pre-wrap max-w-[420px]">{m.message}</td>
                <td className="px-3 py-2">
                  <ContactStatusSelect messageId={m.id} initialStatus={m.status ?? "new"} />
                </td>
                <td className="px-3 py-2">
                  {m.created_at ? new Date(m.created_at).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
            {(!messages || messages.length === 0) && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                  お問い合わせはまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
