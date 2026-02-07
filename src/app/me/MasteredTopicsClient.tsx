"use client";

import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/course/topics";

type TopicRow = {
  id: string;
  title: string;
  unit: string;
  section: string;
};

const UNIT_LABELS: Record<string, string> = {
  math1: "数学I",
  mathA: "数学A",
  math2: "数学II",
  mathB: "数学B",
  mathC: "数学C",
  math3: "数学III",
};

export default function MasteredTopicsClient() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mastered, setMastered] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/profile/mastered", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) return;
        if (!active) return;
        setMastered(Array.isArray(data.masteredTopicIds) ? data.masteredTopicIds : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const topics = useMemo<TopicRow[]>(() => {
    const q = search.trim().toLowerCase();
    const list = TOPICS.map((t) => ({
      id: t.id,
      title: t.title,
      unit: t.unit,
      section: t.section ?? "",
    }));
    if (!q) return list;
    return list.filter((t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
  }, [search]);

  const byUnit = useMemo(() => {
    const m = new Map<string, TopicRow[]>();
    topics.forEach((t) => {
      const list = m.get(t.unit) ?? [];
      list.push(t);
      m.set(t.unit, list);
    });
    return [...m.entries()];
  }, [topics]);

  const toggleTopic = (id: string) => {
    setMastered((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleUnit = (unit: string, ids: string[]) => {
    const allSelected = ids.every((id) => mastered.includes(id));
    setMastered((prev) => {
      const set = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => set.delete(id));
      } else {
        ids.forEach((id) => set.add(id));
      }
      return [...set];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/mastered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masteredTopicIds: mastered }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "save error");
      setOpen(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">共通の学習済みトピック</div>
          <div className="text-[11px] sm:text-xs text-slate-500">
            {mastered.length}件登録済み（全コースに反映）
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] sm:text-sm hover:bg-slate-50 transition"
        >
          編集する
        </button>
      </div>

      {open ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="w-full sm:w-80 rounded-full border bg-white px-4 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="トピック名・IDで検索"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border px-4 py-2 text-[11px] sm:text-sm hover:bg-white transition"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-full border bg-slate-900 px-4 py-2 text-[11px] sm:text-sm text-white hover:bg-slate-800 transition disabled:opacity-60"
              >
                {saving ? "保存中…" : "保存"}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {byUnit.map(([unit, list]) => {
              const ids = list.map((t) => t.id);
              const allSelected = ids.every((id) => mastered.includes(id));
              return (
                <div key={unit} className="rounded-xl border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-700">{UNIT_LABELS[unit] ?? unit}</div>
                    <button
                      type="button"
                      onClick={() => toggleUnit(unit, ids)}
                      className="text-[11px] text-slate-500 hover:text-slate-700"
                    >
                      {allSelected ? "一括解除" : "一括選択"}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((topic) => {
                      const selected = mastered.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => toggleTopic(topic.id)}
                          className={`rounded-xl border px-3 py-2 text-left text-[11px] sm:text-sm transition ${
                            selected
                              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-[10px] text-slate-400">{topic.section || topic.id}</div>
                          <div className="mt-1 font-semibold">{topic.title}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
