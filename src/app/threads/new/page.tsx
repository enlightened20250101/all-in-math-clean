'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import MarkdownEditor from '@/components/MarkdownEditor';
import ImageUploader from '@/components/ImageUploader';
import TagInput, { normalizeTag } from '@/components/TagInput';
import { sanitizeOnSubmit } from '@/lib/sanitize-on-submit';

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]); // ← 配列で管理
  const [body, setBody] = useState('');
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function submit() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setToast({ message: 'ログインが必要です', type: 'error' });
    if (!title.trim()) return setToast({ message: 'タイトルを入力してください', type: 'error' });

    setSending(true);
    try {
      // サーバー側でも最終正規化（ダブルガード）
      const normalized = Array.from(new Set(
        tags.map(normalizeTag).filter(Boolean).map(t => t.slice(0, 30))
      )).slice(0, 10);

      // 1) threads: タイトル/タグ/slugのみ
      const slug = slugify(title);
      const { data: thread, error: thErr } = await supabase
        .from('threads')
        .insert(
          sanitizeOnSubmit({
            title: title.trim(),
            slug,
            author_id: user.id,
            tags: normalized,   // ← 配列のまま保存（text[]）
          })
        )
        .select('id, slug')
        .single();
      if (thErr) throw thErr;

      // 2) 最初の返信（本文/画像）
      const content = body.trim();
      if (thread && (content || images.length)) {
        const { error: tpErr } = await supabase
          .from('thread_posts')
          .insert(
            sanitizeOnSubmit({
              thread_id: thread.id,
              author_id: user.id,
              body_md: content || '',
              images: images.map(i => i.url),
            })
          );
        if (tpErr) throw tpErr;
      }

      router.replace(`/threads/${thread!.slug}`);
    } catch (e: any) {
      setToast({ message: e.message || '作成に失敗しました', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  const onComposerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      if (sending) return;
      submit();
    },
    [sending, submit]
  );

  return (
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
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">New Thread</div>
          <h1 className="mt-2 text-lg sm:text-xl font-semibold">新しいスレッド</h1>
          <p className="text-[11px] sm:text-sm text-white/95 mt-2">質問や共有したい内容を投稿しましょう</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
        <div className="rounded-[31px] bg-white/95 p-5 sm:p-6 space-y-4">
          <input
            className="w-full border rounded-full px-4 py-2.5 text-[12px] sm:text-sm"
            placeholder="タイトル"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />

          <TagInput value={tags} onChange={setTags} placeholder="タグを追加（Enter / カンマ / スペース）" />

          {/* “本文＝最初の返信” */}
          <div className="border rounded-[24px] p-4 bg-white space-y-2">
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
              <MarkdownEditor value={body} onChange={setBody} placeholder="本文（Markdown + TeX 任意）" />
            </div>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white disabled:opacity-50 text-[11px] sm:text-sm transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
            onClick={submit}
            disabled={sending}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
              GO
            </span>
            {sending ? '作成中…' : '作成する'}
          </button>
        </div>
      </div>
    </div>
  );
}
