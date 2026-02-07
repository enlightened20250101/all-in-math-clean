// src/app/learn/session/[id]/page.tsx
export const runtime = "nodejs";

import { redirect } from "next/navigation";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

/**
 * /learn/session/:id への入口
 * - 認証ユーザーの learning_sessions から topic_slug を引き、/learn/skill/:code へ合流
 * - 見つからなければ /learn に戻す
 */
export default async function SessionEntry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sb = await supabaseServerReadOnly();
  const { id } = await params;

  // 1) 認証チェック（RLSのため必須）
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    // 未ログインならログインへ（ハブに戻したいなら /learn にしてもOK）
    redirect(`/login?next=${encodeURIComponent(`/learn/session/${id}`)}`);
  }

  // 2) 自分のセッションから skill コードを取得
  const { data: sess, error } = await sb
    .from("learning_sessions")
    .select("topic_slug")
    .eq("id", id)
    .eq("user_id", user.id)  // ★ RLS 安全側
    .maybeSingle();

  const code = sess?.topic_slug;
  if (!code) {
    // ここに来るのは「存在しない/他人の行/RLSで読めない」ケース
    redirect("/learn");
  }

  // 3) スキルページへ合流
  redirect(`/learn/skill/${encodeURIComponent(code)}`);
}
