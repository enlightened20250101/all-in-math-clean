// src/app/api/course/index/route.ts
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const p = path.join(process.cwd(), "data/course/catalogs/index.json");
    const raw = await fs.readFile(p, "utf8");
    return new NextResponse(raw, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("[course/index] failed:", e?.message ?? e);
    return NextResponse.json({ ok: false, error: "index error" }, { status: 500 });
  }
}
