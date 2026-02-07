import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PutSchema = z.object({
  courseId: z.string().default("hs_ia"),
  goal: z.number().int().refine((v) => [55, 65, 80].includes(v), "goal must be 55/65/80"),
});

export async function GET() {
  const supabase = await await supabaseServerAction();
  const sbr = await await supabaseServerReadOnly();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const { data, error: selErr } = await sbr
    .from("course_user_courses")
    .select("id, name, base_course_id, goal, updated_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("is_archived", false)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ ok: false, error: selErr.message }, { status: 500 });
  }

  if (data) {
    return NextResponse.json({
      ok: true,
      settings: {
        courseId: data.base_course_id,
        goal: data.goal,
        updatedAt: data.updated_at,
        courseName: data.name,
        courseInstanceId: data.id,
      },
    });
  }

  const { data: legacy, error: legacyErr } = await sbr
    .from("course_user_settings")
    .select("course_id, goal, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (legacyErr) {
    return NextResponse.json({ ok: false, error: legacyErr.message }, { status: 500 });
  }

  // 未作成ならデフォルト返す（DBにはまだ作らない）
  const settings = legacy ?? { course_id: "hs_ia", goal: 65, updated_at: null };

  return NextResponse.json({
    ok: true,
    settings: {
      courseId: settings.course_id,
      goal: settings.goal,
      updatedAt: settings.updated_at,
    },
  });
}

export async function PUT(req: Request) {
  const supabase = await await supabaseServerAction();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const { courseId, goal } = parsed.data;

  const { data: active, error: activeErr } = await supabase
    .from("course_user_courses")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .eq("is_archived", false)
    .maybeSingle();

  if (activeErr) {
    return NextResponse.json({ ok: false, error: activeErr.message }, { status: 500 });
  }

  if (active?.id) {
    const { error: upErr } = await supabase
      .from("course_user_courses")
      .update({
        base_course_id: courseId,
        goal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", active.id)
      .eq("user_id", user.id);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }
  } else {
    // fallback legacy upsert
    const { error: upErr } = await supabase
      .from("course_user_settings")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          goal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
