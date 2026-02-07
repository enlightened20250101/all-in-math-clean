// src/app/learn/components/ExerciseRequestDialog.tsx
'use client';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: {
    count: number;
    difficulty: number;
    topics: string[];
    methods: string[];
    requireProof: boolean;
  }) => void;
};

export default function ExerciseRequestDialog({ open, onClose, onSubmit }: Props) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(5);
  const [topics, setTopics] = useState('極限, 微分, 指数関数');
  const [methods, setMethods] = useState('置換積分, 部分積分');
  const [requireProof, setRequireProof] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">出題パラメータ</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">出題数: {count}</label>
            <input type="range" min={1} max={20} value={count} onChange={(e)=> setCount(Number(e.target.value))} className="w-full"/>
          </div>
          <div>
            <label className="block text-sm mb-1">難易度: {difficulty}</label>
            <input type="range" min={1} max={10} value={difficulty} onChange={(e)=> setDifficulty(Number(e.target.value))} className="w-full"/>
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">テーマ（カンマ区切り）</label>
            <input value={topics} onChange={(e)=> setTopics(e.target.value)} className="w-full rounded-lg border px-3 py-2"/>
          </div>
          <div className="col-span-2">
            <label className="block text-sm mb-1">解法タイプ（カンマ区切り）</label>
            <input value={methods} onChange={(e)=> setMethods(e.target.value)} className="w-full rounded-lg border px-3 py-2"/>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input id="reqProof" type="checkbox" checked={requireProof} onChange={(e)=> setRequireProof(e.target.checked)} />
            <label htmlFor="reqProof">証明を要求する</label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">キャンセル</button>
          <button onClick={()=> onSubmit({
              count, difficulty,
              topics: topics.split(',').map(s=>s.trim()).filter(Boolean),
              methods: methods.split(',').map(s=>s.trim()).filter(Boolean),
              requireProof
          })} className="rounded-lg px-4 py-2 bg-black text-white">出題</button>
        </div>
      </div>
    </div>
  );
}
