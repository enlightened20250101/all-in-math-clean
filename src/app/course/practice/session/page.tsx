// src/app/course/practice/session/page.tsx
import { redirect } from 'next/navigation';
import PracticeSessionClient from './PracticeSessionClient';
import { TOPICS } from '@/lib/course/topics';

type Props = {
  searchParams: Promise<{ topic?: string; mode?: string; limit?: string; scope?: string }>;
};

export default async function CoursePracticeSessionPage({ searchParams }: Props) {
  const sp = await searchParams;
  const topicId = sp.topic;
  const scope = sp.scope;
  const isCommonScope = scope === 'common';

  const commonPool = isCommonScope
    ? TOPICS.filter((t) => ["math1", "mathA", "math2", "mathB"].includes(t.unit)).map((t) => t.id)
    : [];

  if (!topicId && !commonPool.length) redirect('/course/topics');

  const mode = sp.mode === 'review' ? 'review' : 'practice';
  const maxQuestions = sp.limit ? Number(sp.limit) : undefined;

  return (
    <PracticeSessionClient
      topicId={topicId ?? "common"}
      mode={mode}
      maxQuestions={maxQuestions}
      topicPool={commonPool}
    />
  );
}
