import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  let payload: { name?: string; email?: string; subject?: string; message?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  let sb;
  try {
    sb = await supabaseServerAction();
  } catch {
    return NextResponse.json({ ok: false, error: "supabase_disabled" }, { status: 503 });
  }

  const { error } = await sb.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
