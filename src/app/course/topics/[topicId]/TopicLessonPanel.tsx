'use client';

import { useEffect, useState } from 'react';
import MathMarkdown from '@/components/MathMarkdown';

type Props = {
  topicId: string;
};

export default function TopicLessonPanel({ topicId }: Props) {
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<string | null>(null);
  const [level, setLevel] = useState<'basic' | 'alt'>('basic');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const handleExplain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/course/tutor/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'error');
      setLesson(data.lesson);
    } catch (e) {
      console.error(e);
      setToast('講義の生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {toast ? (
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2 text-[10px] sm:text-sm text-rose-700 shadow-sm">
          {toast}
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h3 className="font-semibold text-[15px] sm:text-base">AIに教えてもらう</h3>
        <div className="flex items-center gap-2 text-[10px] sm:text-sm">
          <span className="text-gray-600">レベル:</span>
          <button
            type="button"
            onClick={() => setLevel('basic')}
            className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs transition ${
              level === 'basic'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            基礎中心
          </button>
          <button
            type="button"
            onClick={() => setLevel('alt')}
            className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs transition ${
              level === 'alt'
                ? 'bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            別の視点も
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="px-4 py-2.5 rounded-full bg-indigo-600 text-white text-[11px] sm:text-sm hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner"
      >
        {loading ? '講義を準備中...' : 'このトピックを最初から説明してもらう'}
      </button>

      <div className="mt-2 min-h-[96px] text-[10px] sm:text-sm">
        {lesson ? (
          <MathMarkdown
            content={lesson}
            className="prose prose-sm max-w-none"
          />
        ) : (
          <p className="text-gray-500">
            「このトピックを最初から説明してもらう」を押すと、
            AIがこの単元のイメージ〜公式〜簡単な例題まで一通り教えてくれます。
          </p>
        )}
      </div>
    </div>
  );
}
