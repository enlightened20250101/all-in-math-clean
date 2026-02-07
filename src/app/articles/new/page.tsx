'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import slugify from 'slugify';

import AuthGate from '@/components/AuthGate';
import { supabase } from '@/lib/supabaseClient';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageUploader from '@/components/ImageUploader';
import { sanitizeOnSubmit } from '@/lib/sanitize-on-submit';

export default function NewArticlePage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const create = async () => {
    if (saving) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return setToast({ message: 'ログインが必要です', type: 'error' });
    if (!title.trim()) return setToast({ message: 'タイトルを入力してください', type: 'error' });

    setSaving(true);

    try {
      const slugBase = slugify(title, { lower: true, strict: true });
      const slug = `${slugBase}-${Date.now().toString(36)}`;

      const { error } = await supabase.from('articles').insert(
        sanitizeOnSubmit({
          title,
          slug,
          body_mdx: body,
          author_id: user.id,
          is_published: true,
          images: images.map((i) => i.url),
        })
      );

      if (error) throw error;

      setTitle('');
      setBody('');
      setImages([]);

      setToast({ message: '記事を公開しました。移動します…', type: 'success' });
      window.setTimeout(() => router.push(`/articles/${slug}`), 500);
    } catch (e: any) {
      setToast({ message: e?.message || '作成に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onComposerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      if (saving) return;
      create();
    },
    [saving, create]
  );

  return (
    <AuthGate>
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {toast ? (
          <div
            className={`rounded-md border px-2 py-1 text-xs ${
              toast.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
            role="status"
          >
            {toast.message}
          </div>
        ) : null}
        <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">New Article</div>
            <h1 className="mt-2 text-lg sm:text-xl font-semibold">記事の新規作成</h1>
            <p className="text-[11px] sm:text-sm text-white/95 mt-2">学びのまとめや解説を書いて共有できます</p>
          </div>
        </div>

        <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/95 p-5 sm:p-6 space-y-4">
            <input
              className="border rounded-full px-4 py-2.5 w-full text-[12px] sm:text-sm"
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-sm text-gray-600">
                <span>本文</span>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Shift + Enter 改行</span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Ctrl/⌘ + Enter 送信</span>
                </div>
              </div>
              <div
                onKeyDown={onComposerKeyDown}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 focus-within:ring-2 focus-within:ring-blue-200"
              >
                <MarkdownEditor
                  value={body}
                  onChange={setBody}
                  placeholder={
                    '例）解の公式: $$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$'
                  }
                />
              </div>
            </div>

            <ImageUploader value={images} onChange={setImages} />

            <button
              onClick={create}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-[11px] sm:text-sm disabled:opacity-50 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                GO
              </span>
              {saving ? '公開中…' : '公開する'}
            </button>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
