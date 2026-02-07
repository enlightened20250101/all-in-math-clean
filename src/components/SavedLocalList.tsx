'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import CopyLinkButton from './CopyLinkButton';
import LocalSaveButton from './LocalSaveButton';

type Props = {
  storageKey: string;
  itemPath: string;
  kind: 'threads' | 'articles' | 'posts';
};

function readList(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map(String);
  } catch {
    return [];
  }
}

export default function SavedLocalList({ storageKey, itemPath, kind }: Props) {
  const [items, setItems] = useState<string[]>([]);
  const [details, setDetails] = useState<Map<string, { title: string; href: string; tags?: string[] }>>(new Map());
  const [order, setOrder] = useState<'new' | 'old'>('new');
  const [loading, setLoading] = useState(false);
  const [lastFailed, setLastFailed] = useState(false);
  const [tag, setTag] = useState<string>('');
  const [query, setQuery] = useState('');
  const [tagOrder, setTagOrder] = useState<'freq' | 'alpha'>('freq');
  const [showTags, setShowTags] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const refresh = () => setItems(readList(storageKey));
    refresh();
    const prefKey = `saved:showTags:${storageKey}`;
    const showAllKey = `saved:showAllTags:${storageKey}`;
    const orderKey = `saved:order:${storageKey}`;
    const tagOrderKey = `saved:tagOrder:${storageKey}`;
    const queryKey = `saved:query:${storageKey}`;
    try {
      const raw = window.localStorage.getItem(prefKey);
      if (raw === "0") setShowTags(false);
      if (raw === "1") setShowTags(true);
      const showAllRaw = window.localStorage.getItem(showAllKey);
      if (showAllRaw === "0") setShowAllTags(false);
      if (showAllRaw === "1") setShowAllTags(true);
      const orderRaw = window.localStorage.getItem(orderKey);
      if (orderRaw === "old" || orderRaw === "new") setOrder(orderRaw);
      const tagOrderRaw = window.localStorage.getItem(tagOrderKey);
      if (tagOrderRaw === "freq" || tagOrderRaw === "alpha") setTagOrder(tagOrderRaw);
      const queryRaw = window.localStorage.getItem(queryKey);
      if (typeof queryRaw === "string") setQuery(queryRaw);
    } catch {
      // ignore
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) refresh();
    };
    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail?.key || detail.key === storageKey) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('saved:changed', onSaved as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('saved:changed', onSaved as EventListener);
    };
  }, [storageKey]);

  useEffect(() => {
    const prefKey = `saved:showTags:${storageKey}`;
    try {
      window.localStorage.setItem(prefKey, showTags ? "1" : "0");
    } catch {
      // ignore
    }
  }, [showTags, storageKey]);

  useEffect(() => {
    const orderKey = `saved:order:${storageKey}`;
    const tagOrderKey = `saved:tagOrder:${storageKey}`;
    const queryKey = `saved:query:${storageKey}`;
    const showAllKey = `saved:showAllTags:${storageKey}`;
    try {
      window.localStorage.setItem(orderKey, order);
      window.localStorage.setItem(tagOrderKey, tagOrder);
      window.localStorage.setItem(queryKey, query);
      window.localStorage.setItem(showAllKey, showAllTags ? "1" : "0");
    } catch {
      // ignore
    }
  }, [order, tagOrder, query, showAllTags, storageKey]);

  const itemKey = useMemo(() => items.join('|'), [items]);

  const loadDetails = useCallback(async (activeFlag?: { current: boolean }) => {
    if (!items.length) {
      if (!activeFlag || activeFlag.current) setDetails(new Map());
      return;
    }
    setLoading(true);
    setLastFailed(false);
    try {
      if (kind === 'threads') {
        const { data } = await supabase
          .from('threads')
          .select('id,title,slug')
          .in('slug', items);
        const map = new Map<string, { title: string; href: string; tags?: string[] }>();
        (data ?? []).forEach((r: any) =>
          map.set(String(r.slug), { title: r.title, href: `/threads/${r.slug}`, tags: r.tags || [] })
        );
        if (!activeFlag || activeFlag.current) setDetails(map);
        return;
      }
      if (kind === 'articles') {
        const { data } = await supabase
          .from('articles')
          .select('id,title,slug,tags')
          .in('slug', items);
        const map = new Map<string, { title: string; href: string; tags?: string[] }>();
        (data ?? []).forEach((r: any) =>
          map.set(String(r.slug), { title: r.title, href: `/articles/${r.slug}`, tags: r.tags || [] })
        );
        if (!activeFlag || activeFlag.current) setDetails(map);
        return;
      }
      const ids = items.map((id) => Number(id)).filter((n) => Number.isFinite(n));
      if (!ids.length) {
        if (!activeFlag || activeFlag.current) setDetails(new Map());
        return;
      }
      const { data } = await supabase
        .from('posts')
        .select('id,title,tags')
        .in('id', ids);
      const map = new Map<string, { title: string; href: string; tags?: string[] }>();
      (data ?? []).forEach((r: any) =>
        map.set(String(r.id), { title: r.title, href: `/posts/${r.id}`, tags: r.tags || [] })
      );
      if (!activeFlag || activeFlag.current) setDetails(map);
    } catch {
      if (!activeFlag || activeFlag.current) {
        setDetails(new Map());
        setLastFailed(true);
      }
    } finally {
      if (!activeFlag || activeFlag.current) setLoading(false);
    }
  }, [items, kind]);

  useEffect(() => {
    const active = { current: true };
    loadDetails(active);
    return () => { active.current = false; };
  }, [itemKey, loadDetails]);

  const { tags, tagCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    details.forEach((v) => {
      (v.tags || []).forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
    });
    const entries = Array.from(counts.entries());
    const list = entries
      .sort((a, b) => {
        if (tagOrder === 'alpha') return a[0].localeCompare(b[0]);
        return b[1] - a[1] || a[0].localeCompare(b[0]);
      })
      .map(([t]) => t);
    return { tags: list, tagCounts: counts };
  }, [details, tagOrder]);

  let viewItems = order === 'new' ? items : [...items].reverse();
  if (tag) {
    viewItems = viewItems.filter((id) => details.get(id)?.tags?.includes(tag));
  }
  const queryText = query.trim();
  if (queryText) {
    const q = queryText.toLowerCase();
    viewItems = viewItems.filter((id) => {
      const info = details.get(id);
      const text = `${info?.title ?? ''} ${info?.href ?? ''} ${(info?.tags || []).join(' ')} ${id}`.toLowerCase();
      return text.includes(q);
    });
  }

  const highlight = (text: string) => {
    if (!queryText) return text;
    const q = queryText.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100">{text.slice(idx, idx + queryText.length)}</mark>
        {text.slice(idx + queryText.length)}
      </>
    );
  };

  if (items.length === 0) {
    return <div className="text-[11px] sm:text-sm text-gray-500">保存済みがありません。</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
        <button
          type="button"
          className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          onClick={() => setOrder(order === 'new' ? 'old' : 'new')}
        >
          {order === 'new' ? '新しい順' : '古い順'}
        </button>
        <span className="text-gray-500">全{items.length}件</span>
        <button
          type="button"
          className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          onClick={() => {
            if (!window.confirm('保存済みをすべて削除しますか？')) return;
            try {
              window.localStorage.removeItem(storageKey);
              window.dispatchEvent(new CustomEvent('saved:changed', { detail: { key: storageKey } }));
              setItems([]);
            } catch {
              // ignore
            }
          }}
        >
          まとめて削除
        </button>
        {lastFailed && (
          <button
            type="button"
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
            onClick={() => loadDetails()}
            disabled={loading}
          >
            再取得
          </button>
        )}
        {loading && <span className="text-gray-400">取得中…</span>}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
          {(tag || query.trim()) && (
            <button
              type="button"
              className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
              onClick={() => { setTag(''); setQuery(''); }}
            >
              クリア
            </button>
          )}
          <button
            type="button"
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
            onClick={() => setTagOrder(tagOrder === 'freq' ? 'alpha' : 'freq')}
          >
            {tagOrder === 'freq' ? '頻度順' : 'A→Z'}
          </button>
          <button
            type="button"
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
            onClick={() => setShowTags((v) => !v)}
          >
            {showTags ? 'タグを隠す' : 'タグを表示'}
          </button>
          {showTags && (
            <button
              type="button"
              className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
              onClick={() => setShowAllTags((v) => !v)}
            >
              {showAllTags ? 'タグを折りたたむ' : 'タグを展開'}
            </button>
          )}
          {showTags && (
            <button
              type="button"
              className={`border rounded px-2 py-1 ${tag === '' ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setTag('')}
            >
              すべて
            </button>
          )}
          {showTags && (showAllTags ? tags : tags.slice(0, 12)).map((t) => (
            <button
              key={t}
              type="button"
              className={`border rounded px-2 py-1 ${tag === t ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setTag(t)}
            >
              {t} ({tagCounts.get(t) ?? 0})
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-2 py-1 text-[11px] sm:text-sm w-full"
          placeholder="保存内検索（タイトル/URL）"
          id={`saved-search-${storageKey}`}
        />
        {query.trim() !== '' && (
          <button
            type="button"
            className="border rounded px-2 py-1 text-[10px] sm:text-xs bg-white hover:bg-gray-50"
            onClick={() => {
              setQuery('');
              const el = document.getElementById(`saved-search-${storageKey}`) as HTMLInputElement | null;
              el?.focus();
            }}
          >
            クリア
          </button>
        )}
        <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{viewItems.length}件</span>
      </div>
      <ul className="grid gap-2">
        {viewItems.map((id) => {
          const href = `${itemPath}${id}`;
        const info = details.get(id);
        const title = info?.title;
        const realHref = info?.href || href;
        return (
          <li key={id} className="flex items-center justify-between gap-2 border rounded px-2.5 py-2 bg-white">
            <Link href={realHref} className="text-[11px] sm:text-sm text-blue-700 hover:underline break-all">
              {highlight(title || realHref)}
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <LocalSaveButton storageKey={storageKey} value={id} />
              <CopyLinkButton href={realHref} />
            </div>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
