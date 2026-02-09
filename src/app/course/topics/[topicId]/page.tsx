// src/app/course/topics/[topicId]/page.tsx
import type { Metadata } from "next";
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { getTopicById } from '@/lib/course/topics';
import { TOPIC_CONTENT } from '@/lib/course/topicContent';
import MathMarkdown from '@/components/MathMarkdown';
import TopicLessonPanel from './TopicLessonPanel';
import TopicProgressClient from './TopicProgressClient';
import TopicQuickCheckClient from './TopicQuickCheckClient';
import TopicRelationStatusDot from './TopicRelationStatusDot';
import { getTemplatesByTopic } from '@/lib/course/templateRegistry';

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams?: Promise<{ course?: string; unit?: string }>;
};

const UNIT_LABELS: Record<string, string> = {
  math1: '数学I',
  mathA: '数学A',
  math2: '数学II',
  mathB: '数学B',
  mathC: '数学C',
  math3: '数学III',
};

export default async function TopicDetailPage({ params, searchParams }: Props) {
  const { topicId } = await params;
  const sp = (await searchParams) ?? {};
  const courseParam = typeof sp.course === 'string' ? sp.course : '';
  const unitParam = typeof sp.unit === 'string' ? sp.unit : '';
  const backParams = new URLSearchParams();
  if (courseParam) backParams.set('course', courseParam);
  if (unitParam) backParams.set('unit', unitParam);
  const backHref = backParams.toString()
    ? `/course/topics?${backParams.toString()}`
    : '/course/topics';
  const topic = getTopicById(topicId);
  if (!topic) return notFound();

  const content = TOPIC_CONTENT[topic.id];
  const templateCount = getTemplatesByTopic(topic.id).length;
  let prereqIds: string[] = [];
  let nextIds: string[] = [];
  try {
    const graphPath = path.join(process.cwd(), 'data/course/graph.json');
    const raw = fs.readFileSync(graphPath, 'utf8');
    const graph = JSON.parse(raw) as { edges?: Array<{ from: string; to: string }> };
    const edges = graph.edges ?? [];
    prereqIds = edges.filter((e) => e.to === topic.id).map((e) => e.from);
    nextIds = edges.filter((e) => e.from === topic.id).map((e) => e.to);
  } catch {
    prereqIds = [];
    nextIds = [];
  }
  const prereqs = prereqIds.map((id) => getTopicById(id)).filter(Boolean);
  const nexts = nextIds.map((id) => getTopicById(id)).filter(Boolean);

  const baseUrl = 'https://all-in-math.com';
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'トピック一覧', item: `${baseUrl}/course/topics` },
      { '@type': 'ListItem', position: 3, name: topic.title, item: `${baseUrl}/course/topics/${topic.id}` },
    ],
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Link
        href={backHref}
        className="inline-flex items-center justify-center sm:justify-start gap-2 text-[11px] sm:text-sm text-blue-700 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full sm:w-auto"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-white/80">
          BK
        </span>
        トピック一覧へ
      </Link>

      <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/80">
            {UNIT_LABELS[topic.unit] ?? topic.unit}
          </p>
          <h2 className="mt-2 text-xl sm:text-2xl font-semibold">{topic.title}</h2>
          <MathMarkdown
            content={topic.description}
            className="prose max-w-none text-white/80 mt-2 text-[10px] sm:text-base"
          />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              演習テンプレ数: {templateCount} 問
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              おすすめ: 解説 → 1問確認 → 演習
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-3 z-10 sm:static">
        <div className="flex items-center gap-2 overflow-x-auto rounded-[20px] border border-slate-200/80 bg-white/95 px-3 py-2 shadow-sm ring-1 ring-slate-200/70">
          <a
            href="#topic-core"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            解説
          </a>
          <a
            href="#topic-progress"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            進捗
          </a>
          <a
            href="#topic-lesson"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            講義
          </a>
          <a
            href="#topic-quick"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            クイック
          </a>
          <a
            href="#topic-practice"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            演習
          </a>
          <a
            href="#topic-writeup"
            className="shrink-0 rounded-full border px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
          >
            記述
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[2fr_1fr]">
        {/* 固定解説 */}
        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <section id="topic-core" className="rounded-[30px] bg-white/95 p-5 sm:p-6 scroll-mt-24">
            <h3 className="font-semibold mb-2 sm:mb-3 text-[15px] sm:text-base">基本の解説</h3>
            {content ? (
              <MathMarkdown content={content.core} className="prose max-w-none text-[11px] sm:text-base" />
            ) : (
              <p className="text-[10px] sm:text-sm text-gray-500">このトピックの解説はまだ準備中です。</p>
            )}
          </section>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
            <section className="rounded-[30px] bg-white/95 p-5 sm:p-6">
              <h3 className="font-semibold mb-2 text-[15px] sm:text-base">学習の目安</h3>
              <div className="text-[10px] sm:text-sm text-gray-700 space-y-1">
                <div>演習テンプレ数: {templateCount} 問</div>
                <div>おすすめ: 解説 → 1問確認 → 演習</div>
              </div>
            </section>
          </div>
          <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
            <section className="rounded-[30px] bg-white/95 p-5 sm:p-6">
              <h3 className="font-semibold mb-2 text-[15px] sm:text-base">前提と次のトピック</h3>
              {prereqs.length || nexts.length ? (
                <div className="relative space-y-2 pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-sky-200 to-emerald-200/70" />
                  {prereqs.map((p, idx) => {
                    if (!p) return null;
                    return (
                      <div key={p.id} className="relative flex items-center gap-2">
                        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-slate-300" />
                        <Link
                          href={`/course/topics/${p.id}?course=${courseParam || ''}&unit=${p.unit}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 hover:border-slate-300 hover:text-slate-800 transition"
                        >
                          <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white text-[8px] text-slate-500">
                            {idx + 1}
                          </span>
                          前提: {p.title}
                        </Link>
                        {idx < prereqs.length - 1 ? <span className="text-slate-300">→</span> : null}
                      </div>
                    );
                  })}
                  <div className="relative flex items-center gap-2">
                    <TopicRelationStatusDot topicId={topic.id} />
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] text-blue-800">
                      現在: {topic.title}
                    </span>
                  </div>
                  {nexts.map((n, idx) => {
                    if (!n) return null;
                    return (
                      <div key={n.id} className="relative flex items-center gap-2">
                        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-400" />
                        <Link
                          href={`/course/topics/${n.id}?course=${courseParam || ''}&unit=${n.unit}`}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] text-emerald-700 hover:border-emerald-300 hover:text-emerald-800 transition"
                        >
                          <span className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-[8px] text-emerald-700">
                            {idx + 1}
                          </span>
                          次へ: {n.title}
                        </Link>
                        {idx < nexts.length - 1 ? <span className="text-slate-300">→</span> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[10px] sm:text-sm text-slate-500">
                  関係図は準備中です。
                </div>
              )}
            </section>
          </div>
          <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
            <div id="topic-progress" className="rounded-[30px] bg-white/95 p-1.5 scroll-mt-24">
              <TopicProgressClient topicId={topic.id} />
            </div>
          </div>
        </div>
      </div>

      {/* AI講義モード */}
      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <section id="topic-lesson" className="rounded-[30px] bg-white/95 p-5 sm:p-6 scroll-mt-24">
          <TopicLessonPanel topicId={topic.id} />
        </section>
      </div>

      {/* クイックチェック */}
      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <section id="topic-quick" className="rounded-[30px] bg-white/95 p-5 sm:p-6 scroll-mt-24">
          <h3 className="font-semibold mb-2 sm:mb-3 text-[15px] sm:text-base">クイックチェック</h3>
          <TopicQuickCheckClient topicId={topic.id} />
        </section>
      </div>

      {/* 演習への導線 */}
      <div id="topic-practice" className="flex flex-col gap-2 sm:flex-row sm:items-center scroll-mt-24">
        <Link
          href={`/course/practice/session?topic=${topic.id}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
            PR
          </span>
          このトピックの問題演習へ進む
        </Link>
      </div>

      <div id="topic-writeup" className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)] scroll-mt-24">
        <section className="rounded-[30px] bg-white/95 p-5 sm:p-6">
          <h3 className="font-semibold mb-2 sm:mb-3 text-[15px] sm:text-base">記述で深掘り</h3>
          <div className="text-[11px] sm:text-sm text-gray-600">
            紙で解いた内容を清書し、要点を整理して提出する記述演習です。
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href={`/course/topics/${topic.id}/writeup`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs sm:text-sm w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                WR
              </span>
              記述演習へ進む
            </Link>
            <span className="text-[10px] sm:text-xs text-slate-500">
              1問ずつ丁寧に取り組む設計です
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getTopicById(topicId);
  if (!topic) {
    return { title: "トピックが見つかりません" };
  }

  const unitLabel = UNIT_LABELS[topic.unit] ?? topic.unit;
  const description = topic.description
    ? `${topic.description}（${unitLabel}）`
    : `${unitLabel}のトピック学習ページ`;

  return {
    title: `${topic.title}`,
    description,
    openGraph: {
      title: `${topic.title}`,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${topic.title}`,
      description,
    },
  };
}
