// src/app/learn/components/StudyPrefsDialog.tsx
'use client';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (prefs: {
    detailLevel: number;
    difficulty: number;
    practiceAmount: number;
    rigor: number;
    speed: number;
    languageLevel: number;
  }) => void;
};

export default function StudyPrefsDialog({ open, onClose, onSave }: Props) {
  const [detailLevel, setDetailLevel] = useState(7);
  const [difficulty, setDifficulty] = useState(5);
  const [practiceAmount, setPracticeAmount] = useState(5);
  const [rigor, setRigor] = useState(7);
  const [speed, setSpeed] = useState(5);
  const [languageLevel, setLanguageLevel] = useState(6);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">学習プリセット設定</h2>

        {[
          ['説明の細かさ(detailLevel)', detailLevel, setDetailLevel],
          ['問題の難易度(difficulty)', difficulty, setDifficulty],
          ['出題数(practiceAmount)', practiceAmount, setPracticeAmount],
          ['厳密さ(rigor)', rigor, setRigor],
          ['要点重視(speed)', speed, setSpeed],
          ['やさしさ(languageLevel)', languageLevel, setLanguageLevel],
        ].map(([label, val, setter], idx) => (
          <div key={idx} className="mb-4">
            <label className="block text-sm font-medium mb-1">{label as string}: {val as number}</label>
            <input type="range" min={1} max={10} value={val as number}
              onChange={(e)=> (setter as any)(Number(e.target.value))}
              className="w-full" />
          </div>
        ))}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 border">キャンセル</button>
          <button onClick={()=> onSave({ detailLevel, difficulty, practiceAmount, rigor, speed, languageLevel })}
            className="rounded-lg px-4 py-2 bg-black text-white">保存</button>
        </div>
      </div>
    </div>
  );
}
