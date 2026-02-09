// src/app/course/topics/[topicId]/writeup/page.tsx
import Link from "next/link";
import { getTopicById } from "@/lib/course/topics";
import WriteupClient from "@/app/course/writeup/WriteupClient";
import MathMarkdown from "@/components/MathMarkdown";

type TopicWriteupPageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function TopicWriteupPage({ params }: TopicWriteupPageProps) {
  const { topicId } = await params;
  const topic = getTopicById(topicId);

  if (!topic) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-6">
        <div className="text-sm text-slate-500">トピックが見つかりませんでした。</div>
        <Link
          href="/course/topics"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
        >
          トピック一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Topic Writeup</div>
            <div className="mt-2 text-lg sm:text-xl font-semibold">{topic.title}</div>
            <MathMarkdown content={topic.description} className="mt-1 text-sm text-slate-600" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/course/topics/${topic.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              トピックへ戻る
            </Link>
            <Link
              href="/course/writeup/list"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              記述問題一覧
            </Link>
            <Link
              href="/course/writeup"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
            >
              記述演習ホーム
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <div className="rounded-[31px] bg-white/90 p-6 sm:p-8">
          <WriteupClient topicTitle={topic.title} topicId={topic.id} />
        </div>
      </div>
    </div>
  );
}
