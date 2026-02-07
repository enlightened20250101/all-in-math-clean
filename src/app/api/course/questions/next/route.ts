import { NextResponse } from "next/server";
import { generateNextQuestionForTopic, generateNextQuestionFromPool } from "@/lib/course/questions.service";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const topicId = body?.topicId as string | undefined;
  const recentTemplateIds = Array.isArray(body?.recentTemplateIds) ? body.recentTemplateIds : [];
  const recentSignatures = Array.isArray(body?.recentSignatures) ? body.recentSignatures : [];
  const topicIds = Array.isArray(body?.topicIds) ? body.topicIds : [];
  const recentTopicIds = Array.isArray(body?.recentTopicIds) ? body.recentTopicIds : [];
  const courseId = typeof body?.courseId === "string" ? body.courseId : undefined;

  if (!topicId && !topicIds.length) {
    return NextResponse.json({ error: "topicId is required" }, { status: 400 });
  }

  try {
    const question = topicIds.length
      ? generateNextQuestionFromPool(topicIds, {
          excludeTemplateIds: recentTemplateIds,
          excludeSignatures: recentSignatures,
          excludeTopicIds: recentTopicIds,
          courseId,
        })
      : generateNextQuestionForTopic(topicId as string, {
          excludeTemplateIds: recentTemplateIds,
          excludeSignatures: recentSignatures,
          courseId,
        });
    return NextResponse.json(question);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Failed to generate question" }, { status: 500 });
  }
}
