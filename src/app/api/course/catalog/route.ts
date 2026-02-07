import { NextResponse } from "next/server";
import { loadCourseCatalog } from "@/server/courseCatalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? "hs_ia";

  try {
    const catalog = await loadCourseCatalog(courseId);
    return NextResponse.json({ ok: true, catalog });
  } catch (e: any) {
    console.error("[course/catalog] failed:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "catalog error" }, { status: 500 });
  }
}
