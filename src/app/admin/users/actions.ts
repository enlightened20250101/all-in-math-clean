"use server";

import { supabaseServerAction } from "@/lib/supabaseServer";

async function assertAdmin() {
  const sb = await supabaseServerAction();
  const { data: auth } = await sb.auth.getUser();
  const userId = auth.user?.id ?? null;
  const { data: me } = await sb
    .from("profiles")
    .select("user_rank")
    .eq("id", userId)
    .maybeSingle();
  if (!userId || me?.user_rank !== "admin") {
    throw new Error("forbidden");
  }
  return { sb, adminId: userId };
}

export async function updateUserRank(userId: string, nextRank: string) {
  const { sb, adminId } = await assertAdmin();
  const { error } = await sb.from("profiles").update({ user_rank: nextRank }).eq("id", userId);
  if (error) throw new Error(error.message);
  await sb.from("admin_audit_logs").insert({
    admin_id: adminId,
    action: "update_user_rank",
    target_type: "profile",
    target_id: userId,
    detail: { nextRank },
  });
  return { ok: true };
}
