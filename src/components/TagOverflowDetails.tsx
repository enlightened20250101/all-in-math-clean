'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Props = {
  storageKey: string;
  tags: string[];
  hrefBase?: string;
  baseQuery?: string;
  queryKey?: string;
  pageKey?: string;
  resetPage?: boolean;
  maxVisible?: number;
  forceOpen?: boolean;
};

export default function TagOverflowDetails({
  storageKey,
  tags,
  hrefBase,
  baseQuery,
  queryKey = "q",
  pageKey = "page",
  resetPage = true,
  maxVisible = 3,
  forceOpen = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contentId = useMemo(() => `tag-overflow-${storageKey.replace(/[^a-z0-9_-]/gi, '-')}`, [storageKey]);

  useEffect(() => {
    setMounted(true);
    try {
      if (forceOpen) {
        setOpen(true);
        return;
      }
      const raw = window.localStorage.getItem(storageKey);
      if (raw === '1') setOpen(true);
      if (raw === '0') setOpen(false);
    } catch {
      // ignore
    }
  }, [storageKey, forceOpen]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, open ? '1' : '0');
    } catch {
      // ignore
    }
  }, [open, storageKey]);

  const rest = useMemo(() => tags.slice(maxVisible), [tags, maxVisible]);

  if (!rest.length) return null;

  const buildHref = (tag: string) => {
    const params = new URLSearchParams(baseQuery ?? "");
    params.set(queryKey, tag);
    if (resetPage) params.set(pageKey, "1");
    const query = params.toString();
    if (hrefBase) return query ? `${hrefBase}?${query}` : hrefBase;
    return `?${query}`;
  };

  return (
    <details
      className="group"
      open={mounted ? open : undefined}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary
        className="cursor-pointer px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200 list-none"
        aria-label={`残りのタグを${open ? "閉じる" : "表示する"}（${rest.length}件）`}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="group-open:hidden">+{rest.length}</span>
        <span className="hidden group-open:inline">−</span>
      </summary>
      <div id={contentId} className="mt-1 flex flex-wrap gap-1">
        {rest.map((tag) => (
          <Link
            key={tag}
            href={buildHref(tag)}
            className="px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
          >
            {tag}
          </Link>
        ))}
      </div>
    </details>
  );
}
