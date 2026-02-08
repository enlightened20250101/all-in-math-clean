import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const courseId = segments[segments.length - 2];
  if (!courseId || courseId === "undefined") {
    return NextResponse.json({ ok: false, error: "courseId is missing" }, { status: 400 });
  }
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(courseId)) {
    return NextResponse.json({ ok: false, error: `invalid courseId: ${courseId}` }, { status: 400 });
  }
  const supabase = await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const { data: targetCourse, error: selErr } = await supabase
    .from("course_user_courses")
    .select("id, is_completed")
    .eq("id", courseId)
    .eq("user_id", user.id)
    .single();

  if (selErr || !targetCourse) {
    return NextResponse.json({ ok: false, error: "Course not found" }, { status: 404 });
  }
  if (targetCourse.is_completed) {
    return NextResponse.json({ ok: false, error: "course_completed" }, { status: 400 });
  }

  const { error: clearErr } = await supabase
    .from("course_user_courses")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .eq("is_active", true);

  if (clearErr) {
    return NextResponse.json({ ok: false, error: clearErr.message }, { status: 500 });
  }

  const { error: actErr } = await supabase
    .from("course_user_courses")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", courseId)
    .eq("user_id", user.id);

  if (actErr) {
    return NextResponse.json({ ok: false, error: actErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
