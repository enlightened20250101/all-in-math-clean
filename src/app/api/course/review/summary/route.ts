// src/app/api/course/review/summary/route.ts

import { NextResponse } from "next/server";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await await supabaseServerAction();
  const sbr = await await supabaseServerReadOnly();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const nowIso = new Date().toISOString();

  const { data, error } = await sbr
    .from("course_topic_srs")
    .select("topic_id, due_at")
    .eq("user_id", user.id)
    .lte("due_at", nowIso)
    .order("due_at", { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items = data ?? [];
  const count = items.length;
  const nextTopicId = items[0]?.topic_id ?? null;

  return NextResponse.json({
    ok: true,
    count,
    nextTopicId,
    items, // 使わないなら消してOK
  });
}
