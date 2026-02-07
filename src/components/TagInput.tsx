'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;       // 例: 10
  maxLen?: number;        // 例: 30
  suggestions?: string[]; // 任意: 既存タグを渡せば補完UIも出せます（簡易）
};

const SEP = /[,\s、，／\/]+/u; // 半角/全角のカンマ・空白・スラッシュなどで区切る

// 全角→半角の簡易変換 + NFKC 正規化 + トリム + #除去 + 連続記号除去
export function normalizeTag(raw: string): string {
  if (!raw) return '';
  // 全角英数を半角へ（ざっくり）
  const zenkakuToHankaku = (s: string) =>
    s.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
     .replace(/　/g, ' ');
  let s = zenkakuToHankaku(raw).normalize('NFKC').trim();
  s = s.replace(/^#/, '');              // #タグ → タグ
  s = s.replace(/\s+/g, ' ');           // 連続空白を1つに
  s = s.replace(/[-_]{2,}/g, '-');      // 記号の連続を整形（お好み）
  return s;
}

export default function TagInput({
  value,
  onChange,
  placeholder = 'タグを追加（Enter / カンマ / スペース）',
  maxTags = 10,
  maxLen = 30,
  suggestions = [],
}: Props) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTags = (parts: string[]) => {
    if (!parts.length) return;
    const next = new Set(value);
    for (const p of parts) {
      const t = normalizeTag(p);
      if (!t) continue;
      if (t.length > maxLen) continue;
      if (next.size >= maxTags) break;
      next.add(t);
    }
    onChange(Array.from(next));
    setInput('');
  };

  const removeTag = (t: string) => {
    onChange(value.filter((x) => x !== t));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', 'Tab'].includes(e.key) || (e.key === ' ' && input.trim() !== '')) {
      e.preventDefault();
      addTags(input.split(SEP));
    } else if (e.key === ',' || e.key === '，' || e.key === '、' || e.key === '/') {
      e.preventDefault();
      addTags(input.split(SEP));
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      // バックスペースで最後のタグを削除
      removeTag(value[value.length - 1]);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (SEP.test(text)) {
      e.preventDefault();
      addTags(text.split(SEP));
    }
  };

  const filteredSuggestions = useMemo(() => {
    const q = normalizeTag(input);
    if (!q) return [];
    const already = new Set(value.map((v) => v.toLowerCase()));
    return suggestions
      .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
      .filter((s) => !already.has(s.toLowerCase()))
      .slice(0, 6);
  }, [input, suggestions, value]);

  return (
    <div className="border rounded p-2">
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-sm flex items-center gap-1">
            {t}
            <button
              type="button"
              aria-label={`${t} を削除`}
              className="text-gray-500 hover:text-black"
              onClick={() => removeTag(t)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => input && addTags([input])}
          className="flex-1 min-w-[160px] outline-none"
          placeholder={placeholder}
        />
      </div>

      {/* 簡易サジェスト（任意） */}
      {filteredSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="px-2 py-0.5 bg-gray-50 hover:bg-gray-100 rounded text-xs border"
              onClick={() => addTags([s])}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        {value.length}/{maxTags}（最大）、1タグ最大{maxLen}文字。全角カンマ・スペース・スラッシュでも区切れます。
      </div>
    </div>
  );
}
