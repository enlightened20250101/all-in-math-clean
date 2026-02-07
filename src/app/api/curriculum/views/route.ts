// src/app/api/curriculum/views/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadCurriculumViews } from "@/server/curriculum";

export async function GET() {
  const v = await loadCurriculumViews();
  const list = Object.entries(v).map(([code, obj]) => ({ code, count: obj.items.length }));
  return NextResponse.json({ ok:true, views: list });
}
