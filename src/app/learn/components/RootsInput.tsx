"use client";
import { useState } from "react";

export default function RootsInput({
  value, onChange, placeholder = "-1, 1",
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [chip, setChip] = useState("");

  const chips = value.split(",").map(s => s.trim()).filter(Boolean);

  function addChip() {
    const v = chip.trim();
    if (!v) return;
    const set = new Set(chips);
    set.add(v);
    onChange([...set].join(", "));
    setChip("");
  }
  function removeChip(x: string) {
    onChange(chips.filter(c => c !== x).join(", "));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {chips.map(c => (
          <button key={c} type="button"
            onClick={() => removeChip(c)}
            className="px-2 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200">
            {c} ×
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={chip}
          onChange={e => setChip(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addChip(); } }}
          placeholder="解を1つずつ入力してEnter"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          inputMode="numeric"
        />
        <button type="button" onClick={addChip} className="px-3 py-2 rounded-lg border text-sm">追加</button>
      </div>
    </div>
  );
}
