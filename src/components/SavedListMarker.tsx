'use client';

import { useEffect } from 'react';

type Props = {
  storageKey: string;
  containerId: string;
};

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}

export default function SavedListMarker({ storageKey, containerId }: Props) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const apply = () => {
      const saved = readSet(storageKey);
      const items = container.querySelectorAll<HTMLElement>('[data-saved-item]');
      let savedCount = 0;
      items.forEach((el) => {
        const id = el.getAttribute('data-saved-id') || '';
        if (saved.has(id)) {
          el.setAttribute('data-saved', '1');
          savedCount += 1;
        } else {
          el.removeAttribute('data-saved');
        }
      });
      const emptyEl = container.querySelector<HTMLElement>('[data-saved-empty]');
      if (emptyEl) {
        if (savedCount === 0) emptyEl.classList.remove('hidden');
        else emptyEl.classList.add('hidden');
      }
    };

    apply();
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) apply();
    };
    const onSaved = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail?.key || detail.key === storageKey) apply();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('saved:changed', onSaved as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('saved:changed', onSaved as EventListener);
    };
  }, [storageKey, containerId]);

  return null;
}
