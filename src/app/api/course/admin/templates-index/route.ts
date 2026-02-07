import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { ALL_TEMPLATES } from "@/lib/course/templateRegistry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const templates = ALL_TEMPLATES.map((t) => ({
    id: t.meta.id,
    topicId: t.meta.topicId,
    title: t.meta.title,
    difficulty: t.meta.difficulty,
    tags: t.meta.tags ?? [],
  }));

  const topicIds = Array.from(new Set(templates.map((t) => t.topicId))).sort();

  return NextResponse.json({
    ok: true,
    topicIds,
    templates,
  });
}
