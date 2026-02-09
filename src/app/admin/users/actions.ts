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
  return { sb };
}

export async function updateUserRank(userId: string, nextRank: string) {
  const { sb } = await assertAdmin();
  const { error } = await sb.from("profiles").update({ user_rank: nextRank }).eq("id", userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
