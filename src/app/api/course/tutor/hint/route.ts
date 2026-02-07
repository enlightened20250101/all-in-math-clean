// src/app/api/course/tutor/hint/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildTutorPrompt } from '@/lib/course/tutor';
import type { HintStep } from '@/lib/course/tutor';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const question = body?.question as string | undefined;
  const userAnswer = (body?.userAnswer ?? null) as string | null;
  const hintStep = body?.hintStep as HintStep | undefined;

  if (!question || !hintStep) {
    return NextResponse.json(
      { error: 'question and hintStep are required' },
      { status: 400 }
    );
  }

  const prompt = buildTutorPrompt({ question, userAnswer, hintStep });

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'あなたは日本の高校数学IAを教える家庭教師です。',
        },
        { role: 'user', content: prompt },
      ],
    });

    const content = res.choices[0]?.message?.content ?? '';
    return NextResponse.json({ hint: content });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to generate hint' },
      { status: 500 }
    );
  }
}
