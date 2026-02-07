import { NextResponse } from "next/server";
import { supabaseServerAction, supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await supabaseServerReadOnly();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("mastered_topic_ids")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      masteredTopicIds: Array.isArray(data?.mastered_topic_ids) ? data?.mastered_topic_ids : [],
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServerAction();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const masteredTopicIds = Array.isArray(body?.masteredTopicIds) ? body.masteredTopicIds : [];

    const { error } = await supabase
      .from("profiles")
      .update({ mastered_topic_ids: masteredTopicIds })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, masteredTopicIds });
  } catch {
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
