import { NextResponse } from "next/server";
import { supabaseServerAction } from "@/lib/supabaseServer";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TopicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  viewCode: z.string(),
});

const CatalogSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  topics: z.array(TopicSchema),
});

function catalogPath(courseId: string) {
  return path.join(process.cwd(), "data/course/catalogs", `${courseId}.json`);
}

export async function GET(req: Request) {
  const supabase = await await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? "hs_ia";

  const p = catalogPath(courseId);
  const raw = await fs.readFile(p, "utf8");
  const json = JSON.parse(raw);

  const parsed = CatalogSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid catalog schema" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, catalog: parsed.data });
}

export async function PUT(req: Request) {
  const supabase = await await supabaseServerAction();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
  }

  const url = new URL(req.url);
  const courseId = url.searchParams.get("courseId") ?? "hs_ia";

  const body = await req.json().catch(() => null);
  const parsed = CatalogSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
  }

  // courseIdをURLのcourseIdに合わせて固定（事故防止）
  const catalog = { ...parsed.data, courseId };

  const p = catalogPath(courseId);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(catalog, null, 2) + "\n", "utf8");

  return NextResponse.json({ ok: true });
}
