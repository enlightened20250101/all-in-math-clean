import { NextResponse } from "next/server";
import { loadCoursePlan } from "@/server/coursePlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? "hs_ia";
  const goal = Number(url.searchParams.get("goal") ?? "65");

  const plan = await loadCoursePlan(courseId, goal);
  return NextResponse.json({ ok: true, plan });
}
