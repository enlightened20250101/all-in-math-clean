// src/app/learn/[legacy]/page.tsx  ← サーバコンポーネント
import { redirect } from "next/navigation";

export default async function LegacyLearnPage({
  params,
}: {
  params: Promise<{ legacy: string }>;
}) {
  const { legacy: v } = await params;
  // 数字だけ = 旧セッションURL
  if (/^\d+$/.test(v)) {
    redirect(`/learn/session/${v}`);
  }
  // それ以外はスキルコードとして扱う
  redirect(`/learn/skill/${encodeURIComponent(v)}`);
}
