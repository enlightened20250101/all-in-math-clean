import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { loadCoursePlan } from "@/server/coursePlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const StartSchema = z.object({
  courseId: z.string().uuid(),
});

export async function POST(req: Request) {
  const supabase = await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid courseId" }, { status: 400 });
  }

  const { data: course, error: selErr } = await supabase
    .from("course_user_courses")
    .select("id, name, base_course_id, goal, start_topic_id, target_topic_id, is_completed")
    .eq("id", parsed.data.courseId)
    .eq("user_id", user.id)
    .single();

  if (selErr || !course) {
    return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
  }

  const plan = await loadCoursePlan(course.base_course_id, course.goal);
  const order = plan.topicOrder ?? [];

  const startIdxRaw = course.start_topic_id ? order.indexOf(course.start_topic_id) : 0;
  const startIdx = startIdxRaw >= 0 ? startIdxRaw : 0;
  const endIdxRaw = course.target_topic_id ? order.indexOf(course.target_topic_id) : order.length - 1;
  const endIdx = endIdxRaw >= startIdx ? endIdxRaw : order.length - 1;

  const pool = order.slice(startIdx, endIdx + 1);
  const topicPool = Array.from(new Set(pool));
  if (!topicPool.length) {
    return NextResponse.json({ ok: false, error: "No topics in pool" }, { status: 400 });
  }
  const total = Math.min(10, Math.max(3, topicPool.length));

  return NextResponse.json({
    ok: true,
    courseId: course.id,
    courseName: course.name,
    baseCourseId: course.base_course_id,
    isCompleted: !!course.is_completed,
    topicPool,
    total,
    passRate: 0.7,
  });
}
