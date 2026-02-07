// components/MathEditorInner.tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

/**
 * Mathlive を動的ロードして、失敗したら textarea にフォールバック
 */
export default function MathEditorInner({ value, onChange, placeholder }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // できるだけ明示パスを指定（バージョンにより mjs/min.js は調整可）
        await import("mathlive");
        if (mounted) setReady(true);
      } catch (e) {
        console.warn("mathlive load failed, fallback to textarea", e);
        if (mounted) setFailed(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // フォールバック
  if (!ready || failed) {
    return (
      <textarea
        className="w-full border rounded p-2 min-h-[200px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  // ここで MathfieldElement を使った高度な入力に切り替える場合は実装
  // ひとまずは上の fallback で十分なら、そのまま返してOK
  return (
    <textarea
      className="w-full border rounded p-2 min-h-[200px]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
