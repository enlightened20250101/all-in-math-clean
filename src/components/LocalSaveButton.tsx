'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  storageKey: string;
  value: string | number;
  className?: string;
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

function writeSet(key: string, set: Set<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new CustomEvent('saved:changed', { detail: { key } }));
  } catch {
    // ignore
  }
}

export default function LocalSaveButton({ storageKey, value, className = '' }: Props) {
  const id = String(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const set = readSet(storageKey);
    setSaved(set.has(id));
  }, [storageKey, id]);

  const label = saved ? '保存済み' : '保存';

  const onClick = () => {
    const set = readSet(storageKey);
    if (set.has(id)) {
      set.delete(id);
      setSaved(false);
    } else {
      set.add(id);
      setSaved(true);
    }
    writeSet(storageKey, set);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded px-2.5 py-1 text-[10px] sm:text-xs bg-white hover:bg-gray-50 ${className}`}
      aria-pressed={saved}
    >
      {label}
    </button>
  );
}
