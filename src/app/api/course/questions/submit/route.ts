import { NextResponse } from "next/server";
import { gradeAnswer } from "@/lib/course/questions.service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const templateId = body?.templateId as string | undefined;
  const params = body?.params as Record<string, number> | undefined;
  const userAnswer = body?.userAnswer as string | undefined;

  if (!templateId || !params || userAnswer == null) {
    return NextResponse.json({ error: "templateId, params, userAnswer are required" }, { status: 400 });
  }

  try {
    const result = gradeAnswer(templateId, params, userAnswer);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed to grade answer" }, { status: 500 });
  }
}
