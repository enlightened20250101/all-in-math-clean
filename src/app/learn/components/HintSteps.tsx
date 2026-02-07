// src/app/learn/components/HintSteps.tsx
'use client';
import { useState } from 'react';

export default function HintSteps({ hints, onReveal }: { hints: string[]; onReveal?: (n:number)=>void }) {
  const [shown, setShown] = useState(0);
  const reveal = () => {
    const n = Math.min(hints.length, shown + 1);
    setShown(n);
    onReveal?.(n);
  };
  return (
    <div className="space-y-2">
      {Array.from({ length: shown }).map((_,i) => (
        <div key={i} className="rounded bg-amber-50 border border-amber-200 p-2 text-sm">
          {hints[i]}
        </div>
      ))}
      {shown < hints.length && (
        <button onClick={reveal} className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50">
          ヒントをもう少し見る（{shown}/{hints.length}）
        </button>
      )}
    </div>
  );
}
