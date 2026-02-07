import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { loadCurriculumViewsIndex } from "@/server/courseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const views = await loadCurriculumViewsIndex();
  return NextResponse.json({ ok: true, views });
}
