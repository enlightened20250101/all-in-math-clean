// src/app/api/math/graph/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { loadCurriculumGraph } from "@/server/curriculum";

export async function GET() {
  try {
    const g = await loadCurriculumGraph();
    return NextResponse.json({ ok: true, prereqs: g.prereqs, titles: g.titles });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e) }, { status: 500 });
  }
}
