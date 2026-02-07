import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const p = path.join(process.cwd(), "data/course/graph.json");
    const raw = await fs.readFile(p, "utf8");
    const json = JSON.parse(raw);
    return NextResponse.json({ ok: true, graph: json });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "graph load error" }, { status: 500 });
  }
}
