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
  return { sb, userId };
}

export async function updateReportStatus(reportId: number, status: string) {
  const { sb, userId } = await assertAdmin();
  const update = {
    status,
    resolved_at: status === "resolved" || status === "ignored" ? new Date().toISOString() : null,
    resolved_by: status === "resolved" || status === "ignored" ? userId : null,
  };
  const { error } = await sb.from("reports").update(update).eq("id", reportId);
  if (error) throw new Error(error.message);
  await sb.from("admin_audit_logs").insert({
    admin_id: userId,
    action: "update_report_status",
    target_type: "report",
    target_id: String(reportId),
    detail: { status },
  });
  return { ok: true };
}

export async function moderateTarget(reportId: number, targetType: string, targetId: string) {
  const { sb, userId } = await assertAdmin();

  const remove = async (table: string) => {
    const { error } = await sb.from(table).delete().eq("id", targetId);
    if (error) throw new Error(error.message);
  };

  switch (targetType) {
    case "post":
      await remove("posts");
      break;
    case "comment":
      await remove("comments");
      break;
    case "thread":
      await remove("threads");
      break;
    case "thread_post":
      await remove("thread_posts");
      break;
    case "group_message":
      await remove("group_messages");
      break;
    case "article_comment":
      await remove("article_comments");
      break;
    default:
      throw new Error("unsupported target");
  }

  const update = {
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolved_by: userId,
  };
  const { error: uerr } = await sb.from("reports").update(update).eq("id", reportId);
  if (uerr) throw new Error(uerr.message);
  await sb.from("admin_audit_logs").insert({
    admin_id: userId,
    action: "moderate_target",
    target_type: targetType,
    target_id: targetId,
    detail: { reportId },
  });
  return { ok: true };
}

export async function bulkUpdateReportStatus(reportIds: number[], status: string) {
  if (!reportIds.length) return { ok: true };
  const { sb, userId } = await assertAdmin();
  const update = {
    status,
    resolved_at: status === "resolved" || status === "ignored" ? new Date().toISOString() : null,
    resolved_by: status === "resolved" || status === "ignored" ? userId : null,
  };
  const { error } = await sb.from("reports").update(update).in("id", reportIds);
  if (error) throw new Error(error.message);
  await sb.from("admin_audit_logs").insert({
    admin_id: userId,
    action: "bulk_update_report_status",
    target_type: "report",
    target_id: reportIds.join(","),
    detail: { status, count: reportIds.length },
  });
  return { ok: true };
}
