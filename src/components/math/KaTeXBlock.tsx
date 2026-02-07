'use client';
import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { normalizeTeXSigns } from '@/lib/tex/format';

export default function KaTeXBlock({ tex, inline = false }: { tex: string; inline?: boolean }) {
  const divRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target = inline ? spanRef.current : divRef.current;
    if (!target) return;
    const clean = normalizeTeXSigns(tex);
    try {
      katex.render(clean, target, { throwOnError: false, displayMode: !inline });
    } catch {
      target.textContent = clean;
    }
  }, [tex, inline]);
  if (inline) {
    return <span ref={spanRef} />;
  }
  return <div ref={divRef} />;
}
