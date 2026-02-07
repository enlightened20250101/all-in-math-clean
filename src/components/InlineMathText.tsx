import React from "react";
import katex from "katex";
import { sanitizeTex } from "@/lib/tex";
import { katexTrust } from "@/components/graphs/trustPolicy";

type Segment = { type: "text" | "math"; content: string };

function findDelimiter(src: string, start: number, delim: string) {
  for (let i = start; i <= src.length - delim.length; i += 1) {
    if (src.slice(i, i + delim.length) === delim && src[i - 1] !== "\\") {
      return i;
    }
  }
  return -1;
}

function splitMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let i = 0;
  while (i < input.length) {
    if (input[i] === "$") {
      const isDouble = input[i + 1] === "$";
      const delim = isDouble ? "$$" : "$";
      const start = i + (isDouble ? 2 : 1);
      const end = findDelimiter(input, start, delim);
      if (end !== -1) {
        const content = input.slice(start, end);
        segments.push({ type: "math", content });
        i = end + (isDouble ? 2 : 1);
        continue;
      }
    }
    const next = input.indexOf("$", i + 1);
    const end = next === -1 ? input.length : next;
    segments.push({ type: "text", content: input.slice(i, end) });
    i = end;
  }
  return segments;
}

function highlightTextSegment(text: string, terms: string[]) {
  if (!text || terms.length === 0) return text;
  const lower = text.toLowerCase();
  const hit = terms.find((t) => lower.includes(t.toLowerCase()));
  if (!hit) return text;
  const idx = lower.indexOf(hit.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100">{text.slice(idx, idx + hit.length)}</mark>
      {text.slice(idx + hit.length)}
    </>
  );
}

export default function InlineMathText({
  text,
  highlightTerms = [],
  className,
}: {
  text: string;
  highlightTerms?: string[];
  className?: string;
}) {
  const normalized = sanitizeTex(text ?? "");
  const segments = splitMathSegments(normalized);

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === "math") {
          try {
            const html = katex.renderToString(seg.content, {
              throwOnError: false,
              strict: false,
              trust: katexTrust,
              displayMode: false,
            });
            return (
              <span
                key={`m-${idx}`}
                className="katex-inline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={`m-${idx}`} className="text-gray-700">
                {seg.content}
              </span>
            );
          }
        }
        return (
          <span key={`t-${idx}`}>
            {highlightTextSegment(seg.content, highlightTerms)}
          </span>
        );
      })}
    </span>
  );
}
