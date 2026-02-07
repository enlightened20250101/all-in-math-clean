// src/app/api/debug/whoami/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await await supabaseServerReadOnly();
  const { data, error } = await supabase.auth.getUser();
  return NextResponse.json({
    user_id: data?.user?.id ?? null,
    email: data?.user?.email ?? null,
    error: error?.message ?? null,
  });
}
