"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CurriculumView = { code: string; title: string };

type CatalogTopic = {
  id: string;
  title: string;
  description: string;
  viewCode: string;
};

type Catalog = {
  courseId: string;
  title: string;
  topics: CatalogTopic[];
};

type TemplateIndex = {
  topicIds: string[];
  templates: Array<{
    id: string;
    topicId: string;
    title: string;
    difficulty: number;
    tags: string[];
  }>;
};

export default function CatalogEditorClient({ courseId }: { courseId: string }) {
  const [views, setViews] = useState<CurriculumView[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [activeTopicIdx, setActiveTopicIdx] = useState<number>(0);

  const [templateIndex, setTemplateIndex] = useState<TemplateIndex | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [vRes, cRes, tRes] = await Promise.all([
        fetch("/api/course/admin/views", { cache: "no-store" }),
        fetch(`/api/course/admin/catalog?courseId=${encodeURIComponent(courseId)}`, { cache: "no-store" }),
        fetch("/api/course/admin/templates-index", { cache: "no-store" }),
      ]);

      const vData = await vRes.json();
      if (!vRes.ok || !vData.ok) throw new Error(vData.error ?? "views load error");
      setViews(vData.views ?? []);

      const cData = await cRes.json();
      if (!cRes.ok || !cData.ok) throw new Error(cData.error ?? "catalog load error");
      setCatalog(cData.catalog);

      const tData = await tRes.json();
      if (!tRes.ok || !tData.ok) throw new Error(tData.error ?? "templates-index load error");
      setTemplateIndex({ topicIds: tData.topicIds ?? [], templates: tData.templates ?? [] });

    } catch (e: any) {
      console.error(e);
      setError("読み込みに失敗しました（console確認）");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredViews = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return views;
    return views.filter((v) => {
      return v.code.toLowerCase().includes(key) || v.title.toLowerCase().includes(key);
    });
  }, [views, q]);

  const viewTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    views.forEach((v) => m.set(v.code, v.title));
    return m;
  }, [views]);

  const integrity = useMemo(() => {
    if (!catalog || !templateIndex) {
      return {
        catalogOnlyTopics: [] as string[],   // catalogにあるがテンプレ0件
        templateOnlyTopics: [] as string[],  // テンプレあるがcatalogにない
        templateCountByTopic: new Map<string, number>(),
      };
    }

    const catalogTopicIds = new Set(catalog.topics.map((t) => t.id));
    const templateTopicIds = new Set(templateIndex.topicIds);

    const templateCountByTopic = new Map<string, number>();
    templateIndex.templates.forEach((t) => {
      templateCountByTopic.set(t.topicId, (templateCountByTopic.get(t.topicId) ?? 0) + 1);
    });

    const catalogOnlyTopics: string[] = [];
    catalog.topics.forEach((t) => {
      const count = templateCountByTopic.get(t.id) ?? 0;
      if (count === 0) catalogOnlyTopics.push(t.id);
    });

    const templateOnlyTopics: string[] = [];
    templateIndex.topicIds.forEach((tid) => {
      if (!catalogTopicIds.has(tid)) templateOnlyTopics.push(tid);
    });

    catalogOnlyTopics.sort();
    templateOnlyTopics.sort();

    return { catalogOnlyTopics, templateOnlyTopics, templateCountByTopic };
  }, [catalog, templateIndex]);

  const updateTopic = (idx: number, patch: Partial<CatalogTopic>) => {
    if (!catalog) return;
    const next = [...catalog.topics];
    next[idx] = { ...next[idx], ...patch };
    setCatalog({ ...catalog, topics: next });
  };

  const addTopic = () => {
    if (!catalog) return;
    const next: CatalogTopic = {
      id: `new_topic_${Date.now()}`,
      title: "新しいトピック",
      description: "",
      viewCode: "",
    };
    setCatalog({ ...catalog, topics: [next, ...catalog.topics] });
  };

  const removeTopic = (idx: number) => {
    if (!catalog) return;
    const next = catalog.topics.filter((_, i) => i !== idx);
    setCatalog({ ...catalog, topics: next });
  };

  const save = async () => {
    if (!catalog) return;

    // 保存前にviewCodeの存在チェック
    const invalid = catalog.topics.find(
      (t) => t.viewCode && !viewTitleMap.get(t.viewCode)
    );

    if (invalid) {
      setError(
        `保存できません：viewCodeが存在しません -> ${invalid.id} : ${invalid.viewCode}`
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/course/admin/catalog?courseId=${encodeURIComponent(courseId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catalog),
        }
      );

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "save error");

      await loadAll(); // 保存後に再読込
    } catch (e: any) {
      console.error(e);
      setError("保存に失敗しました（console確認）");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !catalog) {
    return <p>{loading ? "読み込み中..." : "catalogがありません"}</p>;
  }

  return (
    <div className="space-y-4">
      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={addTopic}
          className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
        >
          トピック追加
        </button>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {saving ? "保存中..." : "保存"}
        </button>

        <button
          type="button"
          onClick={loadAll}
          className="px-3 py-2 rounded border hover:bg-gray-50 text-sm"
        >
          再読込
        </button>
      </div>

      {/* 整合性チェック */}
      {templateIndex ? (
        <div className="border rounded-lg p-3 bg-white space-y-2">
          <div className="font-semibold">整合性チェック</div>

          <div className="text-sm">
            テンプレ総数: <span className="font-semibold">{templateIndex.templates.length}</span>
          </div>

          {integrity.catalogOnlyTopics.length > 0 ? (
            <div className="text-sm text-red-700">
              ⚠️ catalogにあるのにテンプレ0件のtopic：
              <div className="mt-1 flex flex-wrap gap-2">
                {integrity.catalogOnlyTopics.map((id) => (
                  <span key={id} className="px-2 py-0.5 border rounded text-xs bg-red-50">
                    {id}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-green-700">
              ✅ catalog内の全topicにテンプレがあります
            </div>
          )}

          {integrity.templateOnlyTopics.length > 0 ? (
            <div className="text-sm text-yellow-800">
              ⚠️ テンプレはあるがcatalogに未登録のtopic：
              <div className="mt-1 flex flex-wrap gap-2">
                {integrity.templateOnlyTopics.map((id) => (
                  <span key={id} className="px-2 py-0.5 border rounded text-xs bg-yellow-50">
                    {id}
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ※ catalogに追加すると /course/topics に表示されます
              </div>
            </div>
          ) : (
            <div className="text-sm text-green-700">
              ✅ テンプレのtopicはすべてcatalogに登録済みです
            </div>
          )}
        </div>
      ) : null}

      <div className="border rounded-lg p-3 bg-white space-y-2">
        <div className="font-semibold">Catalog: {catalog.title} ({catalog.courseId})</div>

        <div className="grid gap-3">
          {catalog.topics.map((t, idx) => (
            <div
              key={t.id}
              className={`border rounded p-3 cursor-pointer ${
                idx === activeTopicIdx ? "ring-2 ring-blue-300" : ""
              }`}
              onClick={() => setActiveTopicIdx(idx)}
            >
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="text-xs text-gray-500">topicId: {t.id}</div>
                <button
                  type="button"
                  onClick={() => removeTopic(idx)}
                  className="text-xs text-red-600 hover:underline"
                >
                  削除
                </button>
              </div>

              <div className="grid gap-2 mt-2">
                <label className="text-sm">
                  タイトル
                  <input
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={t.title}
                    onChange={(e) => updateTopic(idx, { title: e.target.value })}
                  />
                </label>

                <label className="text-sm">
                  説明
                  <input
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={t.description}
                    onChange={(e) => updateTopic(idx, { description: e.target.value })}
                  />
                </label>

                <label className="text-sm">
                  viewCode（カリキュラム）
                  <input
                    className="mt-1 w-full border rounded px-2 py-1"
                    value={t.viewCode}
                    onChange={(e) => updateTopic(idx, { viewCode: e.target.value })}
                    placeholder="例: M1_A_micro_part1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t.viewCode && viewTitleMap.get(t.viewCode)
                      ? `title: ${viewTitleMap.get(t.viewCode)}`
                      : "viewCode を下の一覧から探してコピペできます"}
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-3 bg-white space-y-2">
        <div className="font-semibold">views.ndjson（検索して viewCode をコピー）</div>
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="view_code または title で検索"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="max-h-[420px] overflow-auto border rounded mt-2">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-left border-b">
                <th className="p-2 w-[280px]">view_code</th>
                <th className="p-2">title</th>
              </tr>
            </thead>
            <tbody>
              {filteredViews.map((v) => (
                <tr
                  key={v.code}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    // 選択中トピックにviewCodeを反映
                    updateTopic(activeTopicIdx, { viewCode: v.code });
                  }}
                >
                  <td className="p-2 font-mono">{v.code}</td>
                  <td className="p-2">{v.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-xs text-gray-500">
          ※ ここで見つけた view_code を上の各トピックの viewCode に貼り付けて保存してください。
        </div>
      </div>
    </div>
  );
}
