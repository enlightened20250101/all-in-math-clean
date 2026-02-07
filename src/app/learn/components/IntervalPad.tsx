"use client";
export default function IntervalPad({
  onInsert,
}: { onInsert: (text: string) => void }) {
  const btn = (t: string, label?: string) => (
    <button type="button" key={t}
      onClick={() => onInsert(t)}
      className="px-2 py-1 rounded-lg border text-xs bg-white hover:bg-gray-50">
      {label ?? t}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {btn("(-oo, ")}{btn("[", " [ ")}{btn("]", " ] ")}{btn(",", " , ")}{btn("oo)", " oo)")}
      {btn(" U ", " ∪ ")}{btn("(-oo,0)")}
      {btn("[0,oo)")}
      {btn("(-oo,-1] U [1,oo)")}
    </div>
  );
}
