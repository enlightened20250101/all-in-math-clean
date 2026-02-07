// src/components/graphs/InlineKatex.tsx
'use client';
import katex from 'katex';
import { sanitizeTex } from '@/lib/tex';
import { katexTrust } from './trustPolicy';

export default function InlineKatex({ tex, className='' }:{ tex:string; className?:string }) {
  const clean = sanitizeTex(tex);
  const html = katex.renderToString(clean, { throwOnError:false, strict:false, trust:katexTrust, displayMode:false });
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
