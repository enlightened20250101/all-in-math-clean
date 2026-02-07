// src/app/learn/components/FreeChatBox.tsx
'use client';
import { useState } from 'react';
import { sanitizeTex } from '@/lib/tex';

type Props = {
  onSend: (text: string) => void;
  placeholder?: string;
};
export default function FreeChatBox({ onSend, placeholder = 'なんでも質問してね（式はTeXでも通常入力でもOK）' }: Props) {
  const [text, setText] = useState('');
  return (
    <div className="rounded-xl border p-3">
      <textarea
        value={text}
        onChange={(e)=> setText(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[120px] rounded-lg border px-3 py-2"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={()=> {
            const t = text.trim();
            if (t) { onSend(sanitizeTex(t)); setText(''); }
          }}
          className="rounded-lg px-4 py-2 bg-black text-white"
        >送信</button>
      </div>
    </div>
  );
}
