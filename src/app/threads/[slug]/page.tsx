'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import MarkdownEditor from '@/components/MarkdownEditor';
import AuthGate from '@/components/AuthGate';
import ImageUploader from '@/components/ImageUploader';
import CopyLinkButton from '@/components/CopyLinkButton';
import LocalSaveButton from '@/components/LocalSaveButton';
import InlineMathText from "@/components/InlineMathText";
import ReportMenuButton from "@/components/ReportMenuButton";

type ThreadPost = {
  id: number;
  thread_id: number;
  author_id: string | null;
  body_md: string;
  images?: string[];
  created_at: string;
};

export default function ThreadDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();

  const [thread, setThread]   = useState<any>(null);
  const [posts, setPosts]     = useState<ThreadPost[]>([]);
  const [body, setBody]       = useState('');
  const [images, setImages]   = useState<{ url: string; path: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // 初回ロード
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    // ※ 2ch方式では threads から本文は取らない
    try {
      const { data: t, error } = await supabase
        .from('threads')
        .select('id,title,slug,created_at,author_id,tags')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('threads fetch error:', error);
        setError('スレッドの取得に失敗しました');
        return;
      }
      if (!t) {
        setNotFound(true);
        return;
      }
      setThread(t);

      // 返信は thread_posts から（昇順＝古い順）
      const { data: p, error: e2 } = await supabase
        .from('thread_posts')
        .select('id,thread_id,author_id,body_md,images,created_at')
        .eq('thread_id', t.id)
        .order('created_at', { ascending: true });

      if (e2) {
        console.error('thread_posts fetch error:', e2);
        setError((prev) => prev ?? '返信の取得に失敗しました');
        return;
      }
      setPosts((p as ThreadPost[]) || []);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!thread?.id) return;
    const loadRelated = async () => {
      try {
        let rows: any[] = [];
        if (Array.isArray(thread.tags) && thread.tags.length > 0) {
          const { data } = await supabase
            .from('threads')
            .select('id,title,slug,created_at,tags')
            .overlaps('tags', thread.tags)
            .neq('id', thread.id)
            .order('created_at', { ascending: false })
            .limit(6);
          rows = data ?? [];
        }
        if (!rows.length) {
          const { data } = await supabase
            .from('threads')
            .select('id,title,slug,created_at,tags')
            .neq('id', thread.id)
            .order('created_at', { ascending: false })
            .limit(6);
          rows = data ?? [];
        }
        setRelated(rows);
      } catch (e) {
        console.error('related threads fetch error:', e);
        setError((prev) => prev ?? '関連スレッドの取得に失敗しました');
      }
    };
    loadRelated();
  }, [thread?.id, thread?.tags]);

  // Realtime 購読（INSERT / UPDATE / DELETE）
  useEffect(() => {
    if (!thread?.id) return;
    const ch = supabase
      .channel(`thread_posts:${thread.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'thread_posts', filter: `thread_id=eq.${thread.id}` },
        (payload: any) => {
          setPosts(prev => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as ThreadPost;
              // 重複防止（送信直後の返り値とINSERT通知が両方来るケース）
              if (prev.some(p => p.id === row.id)) return prev;
              return [...prev, row];
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as ThreadPost;
              return prev.map(p => p.id === row.id ? row : p);
            }
            if (payload.eventType === 'DELETE') {
              const row = payload.old as ThreadPost;
              return prev.filter(p => p.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [thread?.id]);

  // 返信を送信（楽観追加＋重複防止）
  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setToast({ message: 'ログインが必要です', type: 'error' });
    if (!thread) return;

    const content = body.trim();
    if (!content && images.length === 0) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('thread_posts')
        .insert({
          thread_id: thread.id,
          author_id: user.id,
          body_md: content,
          images: images.map(i => i.url),
        })
        .select()
        .single();

      if (error) throw error;

      // 楽観反映（Realtimeで同じIDが届いても重複しない）
      setPosts(prev => prev.some(p => p.id === data!.id) ? prev : [...prev, data as ThreadPost]);

      // 入力クリア
      setBody('');
      setImages([]);
    } catch (e: any) {
      setToast({ message: e.message || '投稿に失敗しました', type: 'error' });
    } finally {
      setSending(false);
    }
  };

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

  const [order, setOrder] = useState<"old" | "new" | "featured">("old");
  const op = useMemo(() => posts[0], [posts]);           // 最初の1件＝本文（OP）
  const replies = useMemo(() => posts.slice(1), [posts]); // 2件目以降＝返信
  const lastActivity = useMemo(() => {
    const last = posts[posts.length - 1];
    return last?.created_at ?? thread?.created_at ?? null;
  }, [posts, thread?.created_at]);
  const featured = useMemo(() => {
    const pick = [...replies].sort((a, b) => (b.body_md?.length ?? 0) - (a.body_md?.length ?? 0)).slice(0, 1);
    return pick[0] ?? null;
  }, [replies]);
  const sortedReplies = useMemo(() => {
    const list = [...replies];
    list.sort((a, b) => {
      const aTime = +new Date(a.created_at);
      const bTime = +new Date(b.created_at);
      return order === "new" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [replies, order]);
  const highlightReplyId = useMemo(() => {
    const raw = params.get("reply");
    const num = raw ? Number(raw) : NaN;
    return Number.isFinite(num) ? num : null;
  }, [params]);

  useEffect(() => {
    if (!highlightReplyId) return;
    const el = document.getElementById(`thread-reply-${highlightReplyId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightReplyId, posts]);

  if (notFound) return <div className="p-4 text-sm text-gray-600">スレッドが見つかりませんでした。</div>;
  if (!thread)   return <div className="p-4 text-sm text-gray-600">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6">
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
      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchAll}
            className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[10px] text-rose-700 hover:bg-rose-100 transition"
          >
            再試行
          </button>
        </div>
      ) : null}
      <header className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[12px] sm:text-sm">
            <Link
              href="/threads"
              className="inline-flex items-center gap-2 text-white/90 px-4 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                BK
              </span>
              掲示板一覧へ
            </Link>
            <a
              href="#reply"
              className="inline-flex items-center gap-2 text-white/90 px-4 py-2 rounded-full bg-white/15 border border-white/25 hover:bg-white/25 transition active:scale-[0.98] active:shadow-inner self-start sm:self-auto w-full sm:w-auto"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                RP
              </span>
              返信する →
            </a>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold">{thread.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-white/95">
            <span>{new Date(thread.created_at).toLocaleString()}</span>
            {lastActivity && (
              <span className="text-white/95">最終更新: {new Date(lastActivity).toLocaleString()}</span>
            )}
            <span className="text-white/95">返信: {replies.length}</span>
            <CopyLinkButton href={`/threads/${slug}`} />
            <LocalSaveButton storageKey="saved:threads" value={slug} />
            <ReportMenuButton targetType="thread" targetId={thread.id} />
          </div>
          {Array.isArray(thread.tags) && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
              {thread.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/threads?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                  className="px-3 py-1.5 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition active:scale-[0.98] active:shadow-inner"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 1レス目（OP本文） */}
      {op && (
        <article className="border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70">
          <div className="text-[11px] sm:text-xs text-gray-500 mb-2">OP • {new Date(op.created_at).toLocaleString()}</div>
          <div className="prose max-w-none text-[11px] sm:text-base">
            <MarkdownRenderer markdown={op.body_md} />
          </div>
          {Array.isArray(op.images) && op.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {op.images.map((u: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded" />
              ))}
            </div>
          )}
        </article>
      )}

      <div className="grid gap-2 text-xs sm:flex sm:items-center">
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto ${order === "old" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("old")}
        >
          古い順
        </button>
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto ${order === "new" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("new")}
        >
          新しい順
        </button>
        <button
          type="button"
          className={`border rounded-full px-4 py-2 sm:py-1 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto ${order === "featured" ? "bg-slate-900 text-white" : "bg-white hover:bg-gray-50"}`}
          onClick={() => setOrder("featured")}
        >
          注目
        </button>
      </div>

      {featured && order === "featured" && (
        <section className="space-y-2">
          <div className="text-[11px] sm:text-sm text-amber-700">注目返信</div>
          <article
            id={`thread-reply-${featured.id}`}
            className={`border border-slate-200/80 rounded-[28px] p-5 bg-amber-50/60 shadow-sm ${
              highlightReplyId === featured.id ? "ring-2 ring-amber-300" : ""
            }`}
          >
            <div className="prose max-w-none text-[11px] sm:text-base">
              <MarkdownRenderer markdown={featured.body_md} />
            </div>
            {Array.isArray(featured.images) && featured.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {featured.images.map((u: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded" />
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
              <span>{new Date(featured.created_at).toLocaleString()}</span>
              <ReportMenuButton targetType="thread_post" targetId={featured.id} />
            </div>
          </article>
        </section>
      )}

      {/* 返信一覧 */}
      <section id="comments" className="space-y-3">
        {sortedReplies.filter((p) => (order === "featured" ? p.id !== featured?.id : true)).map((p) => (
          <article
            key={p.id}
            id={`thread-reply-${p.id}`}
            className={`border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 ${
              highlightReplyId === p.id ? "ring-2 ring-amber-300" : ""
            }`}
          >
            <div className="prose max-w-none text-[11px] sm:text-base">
              <MarkdownRenderer markdown={p.body_md} />
            </div>

            {Array.isArray(p.images) && p.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {p.images.map((u: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded" />
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 text-[11px] sm:text-xs text-gray-500">
              <span>{new Date(p.created_at).toLocaleString()}</span>
              <ReportMenuButton targetType="thread_post" targetId={p.id} />
            </div>
          </article>
        ))}
      </section>
      <div id="latest" />

      {/* 返信フォーム */}
      <section id="reply">
        <AuthGate>
          <div className="space-y-2 border rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between text-[11px] sm:text-sm text-gray-600">
              <span>返信を書く</span>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Shift + Enter 改行</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Ctrl/⌘ + Enter 送信</span>
              </div>
            </div>
            <div
              onKeyDown={onComposerKeyDown}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 focus-within:ring-2 focus-within:ring-blue-200"
            >
              <MarkdownEditor value={body} onChange={setBody} placeholder={"返信を書く（Markdown + TeX）"} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ImageUploader value={images} onChange={setImages} />
              <button
                onClick={submit}
                className="px-4 py-2 rounded-lg bg-black text-white text-[11px] sm:text-sm hover:bg-slate-900 disabled:opacity-60"
                disabled={sending}
              >
                {sending ? "送信中…" : "返信する"}
              </button>
            </div>
          </div>
        </AuthGate>
      </section>

      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-semibold">次に読む</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {related.map((t) => (
            <li key={t.id} className="border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md transition">
              <Link href={`/threads/${t.slug}`} className="text-[15px] sm:text-base font-medium hover:underline">
                <InlineMathText text={t.title} />
              </Link>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5">
                {new Date(t.created_at).toLocaleString()}
              </div>
              {Array.isArray(t.tags) && t.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                  {t.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {related.length === 0 && (
            <li className="text-[11px] sm:text-sm text-gray-500">関連するスレッドが見つかりませんでした。</li>
          )}
        </ul>
      </section>
    </div>
  );
}
