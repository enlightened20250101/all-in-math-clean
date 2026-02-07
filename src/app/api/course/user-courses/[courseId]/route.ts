import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OptionalUuid = z.preprocess((v) => {
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;
    return trimmed;
  }
  if (v === null || v === undefined) return undefined;
  return v;
}, z.string().uuid().optional());

const UpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  baseCourseId: z.string().min(1).optional(),
  goal: z.number().int().refine((v) => [55, 65, 80].includes(v), "goal must be 55/65/80").optional(),
  startTopicId: OptionalUuid,
  targetTopicId: OptionalUuid,
  targetType: z.string().optional(),
  targetName: z.string().optional(),
  targetDate: z.string().optional(),
  weeklyHours: z.number().int().optional(),
  note: z.string().optional(),
  electives: z.record(z.array(z.string())).optional(),
  level: z.number().int().min(1).max(5).optional(),
  masteredTopicIds: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
});

export async function PUT(req: Request) {
  const supabase = await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const lastSegment = pathParts[pathParts.length - 1] ?? "";
  const courseId = String(lastSegment || "").trim();
  const userId = String(user.id ?? "").trim();
  if (!userId || userId === "undefined" || userId === "null") {
    return NextResponse.json({ ok: false, error: "Invalid user" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const update = parsed.data;
  const normalizeUuid = (value: string | null | undefined) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
      return trimmed;
    }
    return value ?? null;
  };
  const updatePayload: Record<string, unknown> = {
      name: update.name,
      base_course_id: update.baseCourseId,
      goal: update.goal,
      target_type: update.targetType ?? undefined,
      target_name: update.targetName ?? undefined,
      target_date: update.targetDate ?? undefined,
      weekly_hours: update.weeklyHours ?? undefined,
      note: update.note ?? undefined,
      electives: update.electives ?? undefined,
      level: update.level ?? undefined,
      mastered_topic_ids: update.masteredTopicIds ?? undefined,
      is_archived: update.isArchived,
      updated_at: new Date().toISOString(),
    };
  if (Object.prototype.hasOwnProperty.call(update, "startTopicId")) {
    updatePayload.start_topic_id = normalizeUuid(update.startTopicId);
  }
  if (Object.prototype.hasOwnProperty.call(update, "targetTopicId")) {
    updatePayload.target_topic_id = normalizeUuid(update.targetTopicId);
  }
  const { error: upErr } = await supabase
    .from("course_user_courses")
    .update(updatePayload)
    .eq("id", courseId)
    .eq("user_id", userId);

  if (upErr) {
    return NextResponse.json(
      {
        ok: false,
        error: upErr.message,
        details: upErr.details ?? null,
        hint: upErr.hint ?? null,
        payload: updatePayload,
        params: { courseId, lastSegment },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
