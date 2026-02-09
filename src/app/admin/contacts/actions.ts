"use server";

import { supabaseServerAction } from "@/lib/supabaseServer";

export async function updateContactStatus(messageId: string, status: string) {
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

  const { error } = await sb.from("contact_messages").update({ status }).eq("id", messageId);
  if (error) throw new Error(error.message);
  return { ok: true };
}
