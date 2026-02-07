// src/components/MarkdownRenderer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { createRoot, type Root } from 'react-dom/client';
import GraphEmbed from './graphs/GraphEmbed';

import { sanitizeTex, transformOutsideMath } from '@/lib/tex';
import { katexTrust } from './graphs/trustPolicy';

export function MarkdownRenderer({ markdown }: { markdown: string }) {
  // ここで一度だけ sanitize（冪等なので二重でもOK）
  const input = sanitizeTex(markdown ?? '');

  const [html, setHtml] = useState<string>('');
  const containerRef = useRef<HTMLElement | null>(null);
  const rootsRef = useRef<Map<Element, Root>>(new Map());
  const observerRef = useRef<MutationObserver | null>(null);

  // Markdown -> HTML (+ KaTeX)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // 数式外の全角スペース/行末空白を整える（transformOutsideMath が無ければ input をそのまま）
        const src = typeof transformOutsideMath === 'function'
          ? transformOutsideMath(input, t => t.replace(/\u3000/g, ' ').replace(/[ \t]+\n/g, '\n'))
          : input;

        let out = String(
          await unified()
            .use(remarkParse)
            .use(remarkGfm)
            .use(remarkMath)
            .use(remarkRehype)
            .use(rehypeKatex as any, {
              throwOnError: false,
              strict: false,
              trust: katexTrust, // ← ここがポイント
            } as any)
            .use(rehypeStringify)
            .process(src)
        )
          // <p><span class="katex-display">…</span></p> → <div class="katex-display">…</div>
          .replace(/<p>(\s*)<span class="katex-display">/g, '<div class="katex-display">')
          .replace(/<\/span>(\s*)<\/p>/g, '</div>');

        // [graph:id=123] → <div data-graph-id="123" class="graph-embed"></div>
        out = out.replace(/\[graph:id=(\d+)\]/g, (_all, id) =>
          `<div data-graph-id="${id}" class="graph-embed"></div>`
        );

        if (active) setHtml(out);
      } catch (e) {
        console.error('[MarkdownRenderer] render error:', e);
        if (active) setHtml('<p class="text-red-600">レンダリングに失敗しました</p>');
      }
    })();
    return () => { active = false; };
  }, [input]);

  // GraphEmbed のマウント
  useEffect(() => {
    // 再レンダ時の掃除
    rootsRef.current.forEach(root => root.unmount());
    rootsRef.current.clear();

    if (!containerRef.current) return;

    const mountAll = () => {
      if (!containerRef.current) return;
      const hosts = containerRef.current.querySelectorAll<HTMLDivElement>('.graph-embed[data-graph-id]:not([data-mounted])');
      hosts.forEach((host) => {
        const idAttr = host.getAttribute('data-graph-id');
        const id = idAttr ? Number(idAttr) : NaN;
        if (!Number.isFinite(id)) return;

        host.setAttribute('data-mounted', '1'); // 二重マウント防止
        const root = createRoot(host);
        root.render(<GraphEmbed id={id} />);
        rootsRef.current.set(host, root);
      });
    };

    // 初回マウント
    mountAll();

    // 後から挿入された場合にも反応
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && (m.addedNodes?.length || m.removedNodes?.length)) {
          mountAll();
          break;
        }
      }
    });
    obs.observe(containerRef.current, { childList: true, subtree: true });
    observerRef.current = obs;

    // 手動リフレッシュ用
    const refresh = () => mountAll();
    window.addEventListener('markdown:refresh', refresh);

    const roots = rootsRef.current;
    return () => {
      window.removeEventListener('markdown:refresh', refresh);
      observerRef.current?.disconnect();
      observerRef.current = null;
      roots.forEach(root => root.unmount());
      roots.clear();
    };
  }, [html]);

  return (
    <article
      ref={(el) => { containerRef.current = el; }}
      className="prose prose-sm sm:prose-lg max-w-none math-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownRenderer;
