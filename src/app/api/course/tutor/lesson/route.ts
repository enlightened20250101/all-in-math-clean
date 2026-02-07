// src/app/api/course/tutor/lesson/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TOPIC_CONTENT } from '@/lib/course/topicContent';
import { getTopicById } from '@/lib/course/topics';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const topicId = body?.topicId as string | undefined;
  const level = (body?.level ?? 'basic') as 'basic' | 'alt';

  if (!topicId) {
    return NextResponse.json(
      { error: 'topicId is required' },
      { status: 400 }
    );
  }

  const topic = getTopicById(topicId);
  const content = topic ? TOPIC_CONTENT[topic.id] : undefined;

  if (!topic || !content) {
    return NextResponse.json(
      { error: 'Unknown topic or no content' },
      { status: 404 }
    );
  }

  const systemPrompt = `
あなたは日本の高校数学IAを教える丁寧な家庭教師です。
必ず以下の制約を守ってください。

- 与えられた「公式解説」をベースにして教える（新しい定理や公式を勝手に作らない）
- 説明は日本語で、高校生にわかる表現で
- 数式は $...$ で囲んだTeXで書く
- 説明の構成はつぎの3部構成にする：

1. 「直感的なイメージ」: 1〜2段落
2. 「公式・手順の整理」: 箇条書き中心
3. 「簡単な例題と解き方」: 1問 + 手順

最後に、学習者に投げかける**チェッククエスチョンを1つ**必ず入れてください。
（例：「このとき $a>0$ だとグラフはどちら向きに開きますか？」など）
`;

  const userPrompt = `
# トピック
${topic.title}

# 公式解説（参考にして再構成してください）
${content.core}

# 学習者のレベル
- レベル: ${level === 'basic' ? '基礎中心（初学者向け）' : '発展的な見方も少し混ぜて良い'}

上の情報をもとに、「このトピックを最初から学ぶ高校生」に向けて講義を行ってください。
`;

  try {
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: level === 'basic' ? 0.2 : 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const contentMd = res.choices[0]?.message?.content ?? '';

    return NextResponse.json({ lesson: contentMd });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: 'Failed to generate lesson' },
      { status: 500 }
    );
  }
}
