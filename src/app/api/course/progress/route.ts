import { NextResponse } from "next/server";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await await supabaseServerAction();
  const sbr = await await supabaseServerReadOnly();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const { data, error } = await sbr
    .from("course_topic_srs")
    .select("topic_id, due_at, interval_days, reps, lapses, ef, last_quality, updated_at")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}
