// src/app/api/debug/views/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadCurriculumViews } from "@/server/curriculum";
export async function GET() {
  const v = await loadCurriculumViews();
  return NextResponse.json({ ok:true, view_codes: Object.keys(v).slice(0,100) });
}
