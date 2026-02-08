import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CompleteSchema = z.object({
  courseId: z.string().uuid(),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
  passed: z.boolean(),
});

export async function POST(req: Request) {
  const supabase = await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  if (!parsed.data.passed) {
    return NextResponse.json({ ok: false, error: "not_passed" }, { status: 400 });
  }

  const { error: upErr } = await supabase
    .from("course_user_courses")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.courseId)
    .eq("user_id", user.id);

  if (upErr) {
    return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
