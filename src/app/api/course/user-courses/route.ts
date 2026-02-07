import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  baseCourseId: z.string().min(1),
  goal: z.number().int().refine((v) => [55, 65, 80].includes(v), "goal must be 55/65/80"),
  startTopicId: z.string().optional(),
  targetTopicId: z.string().optional(),
  targetType: z.string().optional(),
  targetName: z.string().optional(),
  targetDate: z.string().optional(),
  weeklyHours: z.number().int().optional(),
  note: z.string().optional(),
  electives: z.record(z.array(z.string())).optional(),
  level: z.number().int().min(1).max(5).optional(),
  masteredTopicIds: z.array(z.string()).optional(),
});

export async function GET() {
  const supabase = await supabaseServerReadOnly();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const { data, error: selErr } = await supabase
    .from("course_user_courses")
    .select(
      "id, name, base_course_id, goal, start_topic_id, target_topic_id, target_type, target_name, target_date, weekly_hours, note, electives, level, mastered_topic_ids, is_active, is_archived, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("is_active", { ascending: false })
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (selErr) {
    return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
  }

  const courses = (data ?? []).map((row: any) => ({
    id: row.id ? String(row.id) : null,
    name: row.name,
    baseCourseId: row.base_course_id,
    goal: row.goal,
    startTopicId: row.start_topic_id,
    targetTopicId: row.target_topic_id,
    targetType: row.target_type,
    targetName: row.target_name,
    targetDate: row.target_date,
    weeklyHours: row.weekly_hours,
    note: row.note,
    electives: row.electives,
    level: row.level,
    masteredTopicIds: row.mastered_topic_ids ?? [],
    isActive: row.is_active,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json({ ok: true, courses });
}

export async function POST(req: Request) {
  const supabase = await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  const { error: clearErr } = await supabase
    .from("course_user_courses")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .eq("is_active", true);

  if (clearErr) {
    return NextResponse.json({ ok: false, error: clearErr.message }, { status: 500 });
  }

  const { data, error: insErr } = await supabase
    .from("course_user_courses")
    .insert({
      user_id: user.id,
      name: payload.name,
      base_course_id: payload.baseCourseId,
      goal: payload.goal,
      start_topic_id: payload.startTopicId ?? null,
      target_topic_id: payload.targetTopicId ?? null,
      target_type: payload.targetType ?? null,
      target_name: payload.targetName ?? null,
      target_date: payload.targetDate ?? null,
      weekly_hours: payload.weeklyHours ?? null,
      note: payload.note ?? null,
      electives: payload.electives ?? null,
      level: payload.level ?? null,
      mastered_topic_ids: payload.masteredTopicIds ?? [],
      is_active: true,
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insErr) {
    return NextResponse.json({ ok: false, error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}
