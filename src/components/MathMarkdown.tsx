// src/components/MathMarkdown.tsx
'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { sanitizeTex, transformOutsideMath } from '@/lib/tex';

export default function MathMarkdown({ content, className }: { content: string; className?: string; }) {
  const normalized = React.useMemo(() => {
    let s = sanitizeTex(content ?? '');

    // $ の外側だけ整える（日本語/スペース/グリッチ）
    s = transformOutsideMath(s, (t) => {
      let u = t;
      // 日本語整形（全角スペース・行末タブ→改行）
      u = u.replace(/\u3000/g, ' ')
           .replace(/[ \t]+\n/g, '\n');

      // --- ここからグリッチ補修（クライアント側保険） ---
      // 実タブ（制御文字）とリテラル \t の両方を除去
      u = u.replace(/\t+/g, '').replace(/\\t+/g, '');

      // \text{sin}/\text{cos}/… → \sin/\cos/…
      u = u.replace(/\\text\{(sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\}/gi,
                    (_m, fn) => `\\${String(fn).toLowerCase()}`);

      // 余分な 't' がコマンド直前に混入（"t\text{sin}" や "t\sin"）
      u = u.replace(
        /(^|[^\\])t\\(text\{(sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\}|sin|cos|tan|log|ln|lim|arcsin|arccos|arctan)\b/gi,
        (_m, p1, rest) => {
          if (/^text\{/.test(rest)) {
            const m = rest.match(/^text\{(\w+)\}$/i);
            return p1 + '\\' + (m ? m[1].toLowerCase() : rest);
          }
          return p1 + '\\' + rest.toLowerCase();
        }
      );

      // $ の外の \boxed{...} を $...$ で包む（KaTeX表示の安定化）
      u = u.replace(/\\boxed\{[^{}]*\}/g, (m) => `$${m}$`);

      return u;
    });

    return s;
  }, [content]);

  const rootClass = ['math-prose', className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict:false, throwOnError:false }]]}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
