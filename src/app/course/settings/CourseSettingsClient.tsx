"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadCourseSettingsExtra, saveCourseSettingsExtra, type CourseSettingsExtra } from "@/lib/course/settingsStorage";
import { getCourseElectiveOptions, normalizeElectiveSelection } from "@/lib/course/electives";
import { cachedFetchJson, invalidateCache } from "@/lib/course/clientFetchCache";
import { useCourseIndex } from "@/lib/course/useCourseIndex";
import type { UserCourse } from "@/lib/course/userCourses";
import { TOPICS } from "@/lib/course/topics";

type Settings = {
  courseId: string;
  goal: number;
};

const UNIT_LABELS: Record<string, string> = {
  math1: "数学I",
  mathA: "数学A",
  math2: "数学II",
  mathB: "数学B",
  mathC: "数学C",
  math3: "数学III",
};

export default function CourseSettingsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [settings, setSettings] = useState<Settings>({ courseId: "hs_ia", goal: 65 });
  const [extra, setExtra] = useState<CourseSettingsExtra>({});
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [courseName, setCourseName] = useState("");
  const [masteredTopicIds, setMasteredTopicIds] = useState<string[]>([]);
  const [masteredSearch, setMasteredSearch] = useState("");
  const [masteredOpen, setMasteredOpen] = useState(false);
  const [profileMasteredTopicIds, setProfileMasteredTopicIds] = useState<string[]>([]);
  const [catalogTopics, setCatalogTopics] = useState<{ id: string; title: string }[]>([]);
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [quickOpen, setQuickOpen] = useState(false);
  const modeRef = useRef<"edit" | "create">(mode);
  const createRequestedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);

  useEffect(() => {
    if (!courseIndex.length) return;
    if (courseMap.has(settings.courseId)) return;
    setSettings((prev) => ({ ...prev, courseId: courseIndex[0].courseId }));
  }, [courseIndex, courseMap, settings.courseId]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/profile/mastered", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) return;
        if (!active) return;
        setProfileMasteredTopicIds(Array.isArray(data.masteredTopicIds) ? data.masteredTopicIds : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const enterCreateMode = (reset = true) => {
    modeRef.current = "create";
    createRequestedRef.current = true;
    setMode("create");
    setActiveCourseId(null);
    setCourseName("");
    if (reset) {
      setExtra({ level: 3 });
      setMasteredTopicIds(profileMasteredTopicIds);
      if (courseIndex[0]?.courseId) {
        setSettings((prev) => ({ ...prev, courseId: courseIndex[0].courseId, goal: 65 }));
      }
    }
  };

  useEffect(() => {
    if (searchParams.get("mode") === "create") {
      enterCreateMode(true);
    } else {
      createRequestedRef.current = false;
    }
  }, [searchParams, courseIndex]);

  useEffect(() => {
    if (modeRef.current !== "create") return;
    if (!profileMasteredTopicIds.length) return;
    setMasteredTopicIds((prev) => (prev.length ? prev : profileMasteredTopicIds));
  }, [profileMasteredTopicIds]);

  const load = async () => {
    const now = Date.now();
    if (loadingRef.current && now - lastLoadRef.current < 1500) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    setLoading(true);
    setMsg(null);
    try {
      const coursesRes = await fetch("/api/course/user-courses", { cache: "no-store" });
      const coursesJson = await coursesRes.json().catch(() => null);
      if (coursesRes.ok && coursesJson?.ok) {
        const list: UserCourse[] = Array.isArray(coursesJson.courses) ? coursesJson.courses : [];
        setUserCourses(list);
        const active = list.find((c) => c.isActive) ?? null;
        if (active) {
          if (!createRequestedRef.current && modeRef.current !== "create") {
            setActiveCourseId(active.id);
            setCourseName(active.name);
            setMode("edit");
            setMasteredTopicIds(Array.isArray(active.masteredTopicIds) ? active.masteredTopicIds : []);
            setSettings((prev) =>
              prev.courseId === active.baseCourseId && prev.goal === active.goal
                ? prev
                : { courseId: active.baseCourseId, goal: active.goal }
            );
            setExtra((prev) => ({
              ...loadCourseSettingsExtra(),
              targetType: active.targetType ?? prev.targetType,
              targetName: active.targetName ?? prev.targetName,
              targetDate: active.targetDate ?? prev.targetDate,
              weeklyHours: active.weeklyHours ?? prev.weeklyHours,
              note: active.note ?? prev.note,
              electives: active.electives ?? prev.electives,
              level: typeof active.level === "number" ? active.level : prev.level ?? 3,
            }));
          }
          setLoading(false);
          loadingRef.current = false;
          return;
        }
      }

      const data = await cachedFetchJson(
        "course_settings",
        30_000,
        async () => {
          const res = await fetch("/api/course/settings", { cache: "no-store" });
          const json = await res.json();
          if (!res.ok || !json?.ok) throw new Error(json?.error ?? "settings error");
          return json;
        },
        { cooldownMs: 8000 }
      );
      if (data?.ok) {
        const next = {
          courseId: data.settings.courseId ?? "hs_ia",
          goal: data.settings.goal ?? 65,
        };
        setSettings((prev) =>
          prev.courseId === next.courseId && prev.goal === next.goal ? prev : next
        );
        setCourseName(data.settings.courseName ?? courseMap.get(next.courseId)?.title ?? "");
      }
      const extraData = loadCourseSettingsExtra();
      setExtra({ level: extraData.level ?? 3, ...extraData });
    } catch (e) {
      console.error(e);
      setMsg("読み込みに失敗しました");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const save = async (nextMode: "update" | "create") => {
    setSaving(true);
    setMsg(null);
    try {
      const returnTo = searchParams.get("from");
      const payload = {
        name: courseName || courseMap.get(settings.courseId)?.title || "新しいコース",
        baseCourseId: settings.courseId,
        goal: settings.goal,
        targetType: extra.targetType,
        targetName: extra.targetName,
        targetDate: extra.targetDate,
        weeklyHours: extra.weeklyHours,
        note: extra.note,
        electives: extra.electives,
        level: extra.level ?? 3,
        masteredTopicIds,
      };

      const isValidUuid =
        typeof activeCourseId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          activeCourseId
        );
      const canUpdate = !!activeCourseId && isValidUuid;
      let createdId: string | null = null;
      if (nextMode === "create" || !canUpdate || mode === "create") {
        const res = await fetch("/api/course/user-courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error ?? "create error");
        createdId = typeof data?.id === "string" ? data.id : null;
        createRequestedRef.current = false;
        setMode("edit");
      } else {
        const res = await fetch(`/api/course/user-courses/${activeCourseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.ok) throw new Error(data?.error ?? "save error");
      }

      const res = await fetch("/api/course/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const settingsData = await res.json().catch(() => null);
      if (!res.ok || !settingsData?.ok) throw new Error(settingsData?.error ?? "settings error");
      invalidateCache("course_settings");
      saveCourseSettingsExtra(extra);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem("course_settings_updated_at", String(Date.now()));
          if ("BroadcastChannel" in window) {
            const bc = new BroadcastChannel("course-settings");
            bc.postMessage({
              type: "updated",
              settings,
              extra,
              at: Date.now(),
            });
            bc.close();
          }
        } catch {
          // noop
        }
      }
      await load();
      setMsg(nextMode === "create" ? "新しいコースを作成しました。" : "保存しました。/course のおすすめに反映されます。");
      const destination = returnTo || "/course";
      if (destination) {
        router.push(destination);
      }
    } catch (e) {
      console.error(e);
      setMsg("保存に失敗しました（console確認）");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const msgTone = msg?.includes("失敗") ? "text-red-600" : "text-emerald-700";
  const targetTypes = ["定期テスト", "共通テスト", "難関大", "大学別", "資格/検定", "その他"];
  const electiveCourseId = courseMap.get(settings.courseId)?.baseCourseId ?? settings.courseId;
  const electiveOptions = useMemo(() => getCourseElectiveOptions(electiveCourseId), [electiveCourseId]);
  const electiveSelection = useMemo(
    () => normalizeElectiveSelection(electiveCourseId, extra.electives?.[settings.courseId]),
    [electiveCourseId, settings.courseId, extra.electives]
  );
  const level = extra.level ?? 3;
  const topicMetaMap = useMemo(() => new Map(TOPICS.map((t) => [t.id, t])), []);
  const filteredMasteredTopics = useMemo(() => {
    if (!masteredSearch.trim()) return catalogTopics;
    const q = masteredSearch.trim().toLowerCase();
    return catalogTopics.filter((t) => t.title.toLowerCase().includes(q));
  }, [catalogTopics, masteredSearch]);

  const toggleMasteredTopic = (id: string) => {
    setMasteredTopicIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const res = await fetch(`/api/course/catalog?courseId=${encodeURIComponent(settings.courseId)}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) return;
        if (!alive) return;
        const topics = Array.isArray(json.catalog?.topics) ? json.catalog.topics : [];
        setCatalogTopics(topics.map((t: any) => ({ id: t.id, title: t.title })));
      } catch {
        if (!alive) return;
        setCatalogTopics([]);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [settings.courseId]);

  const toggleElective = (id: string) => {
    setExtra((prev) => {
      const current = normalizeElectiveSelection(settings.courseId, prev.electives?.[settings.courseId]);
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      const safeNext = next.length ? next : current;
      return {
        ...prev,
        electives: {
          ...(prev.electives ?? {}),
          [settings.courseId]: safeNext,
        },
      };
    });
  };

  return (
    <div className="border rounded-[28px] p-4 sm:p-6 bg-white/95 space-y-3 sm:space-y-4 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold text-sm sm:text-base">目標スコア</div>
        <Link
          href="/course"
          className="inline-flex items-center gap-2 text-[10px] sm:text-sm text-blue-700 px-3 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full sm:w-auto"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            HM
          </span>
          コースTOPへ
        </Link>
      </div>

      {loading ? <div className="text-[10px] sm:text-sm text-gray-600">読み込み中...</div> : null}

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[10px] sm:text-sm text-slate-600">学習コース名</div>
            {mode === "create" ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] sm:text-xs text-emerald-700">
                新規コース作成
              </span>
            ) : null}
          </div>
          <input
            className="w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="例: 数列 完全攻略"
          />
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setQuickOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-sm text-slate-600 hover:bg-slate-50 transition"
            aria-label="クイック設定を展開"
          >
            クイック設定
            <span className={`text-[11px] transition ${quickOpen ? "rotate-180" : ""}`}>⌃</span>
          </button>
          {quickOpen ? (
            <div className="space-y-2 rounded-[16px] border border-slate-200 bg-slate-50/60 p-3">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border bg-slate-50 px-3 py-1 text-[10px] sm:text-xs text-slate-500">
            現在: {courseMap.get(settings.courseId)?.title ?? settings.courseId} / {settings.goal}点
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
            {courseIndex.map((opt) => (
              <button
                key={opt.courseId}
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, courseId: opt.courseId }))}
                className={`rounded-full border px-3 py-2 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner ${
                  settings.courseId === opt.courseId ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-gray-50"
                }`}
              >
                {opt.title}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {[55, 65, 80].map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, goal }))}
                className={`rounded-full border px-3 py-2 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner ${
                  settings.goal === goal ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
                }`}
              >
                {goal}点
              </button>
            ))}
          </div>
            </div>
          ) : null}
        </div>
        <label className="text-[10px] sm:text-sm">
          コース（表示・おすすめの基準）
          <select
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
            value={settings.courseId}
            onChange={(e) => setSettings({ ...settings, courseId: e.target.value })}
          >
            {courseIndex.map((opt) => (
              <option key={opt.courseId} value={opt.courseId}>
                {opt.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[10px] sm:text-sm">
          goal（共通テスト目標）
          <select
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
            value={settings.goal}
            onChange={(e) => setSettings({ ...settings, goal: Number(e.target.value) })}
          >
            <option value={55}>55点コース</option>
            <option value={65}>65点コース</option>
            <option value={80}>80点コース</option>
          </select>
        </label>
        <label className="text-[10px] sm:text-sm">
          学習レベル
          <select
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
            value={level}
            onChange={(e) => setExtra((prev) => ({ ...prev, level: Number(e.target.value) }))}
          >
            <option value={1}>レベル1（基礎）</option>
            <option value={2}>レベル2（標準）</option>
            <option value={3}>レベル3（やや応用）</option>
            <option value={4}>レベル4（難関）</option>
            <option value={5}>レベル5（最難関）</option>
          </select>
        </label>
        {electiveOptions.length ? (
          <div className="space-y-2">
            <div className="text-[10px] sm:text-sm text-slate-600">選択問題（共通テスト）</div>
            <div className="flex flex-wrap gap-2">
              {electiveOptions.map((opt) => {
                const active = electiveSelection.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleElective(opt.id)}
                    className={`rounded-full border px-3 py-2 text-[10px] sm:text-sm transition active:scale-[0.98] active:shadow-inner ${
                      active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500">
              ※ 選択した範囲だけがロードマップ・演習に表示されます。
            </div>
          </div>
        ) : null}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMasteredOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-sm text-slate-600 hover:bg-slate-50 transition"
            aria-label="学習済みトピックを展開"
          >
            学習済みトピック
            <span className={`text-[11px] transition ${masteredOpen ? "rotate-180" : ""}`}>⌃</span>
          </button>
          {masteredOpen ? (
            <div className="space-y-3 rounded-[16px] border border-slate-200 bg-slate-50/70 p-3">
              <input
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] sm:text-sm"
                placeholder="トピック名で検索"
                value={masteredSearch}
                onChange={(e) => setMasteredSearch(e.target.value)}
              />
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {filteredMasteredTopics.map((topic) => {
                  const meta = topicMetaMap.get(topic.id);
                  const unitLabel = meta?.unit ? UNIT_LABELS[meta.unit] ?? meta.unit : "その他";
                  const checked = masteredTopicIds.includes(topic.id);
                  return (
                    <label
                      key={topic.id}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] sm:text-sm transition ${
                        checked ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMasteredTopic(topic.id)}
                      />
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] text-slate-500">
                        {unitLabel}
                      </span>
                      <span className="text-slate-700">{topic.title}</span>
                    </label>
                  );
                })}
                {!filteredMasteredTopics.length ? (
                  <div className="text-[10px] text-slate-500">該当するトピックがありません。</div>
                ) : null}
              </div>
              <div className="text-[10px] text-slate-500">
                ※ チェックしたトピックは学習済みとしてロードマップに反映されます。
              </div>
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] sm:text-sm text-slate-600">ロードマップ設定（任意）</div>
          <label className="text-[10px] sm:text-sm">
            目標タイプ
            <select
              className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
              value={extra.targetType ?? ""}
              onChange={(e) => setExtra((prev) => ({ ...prev, targetType: e.target.value || undefined }))}
            >
              <option value="">未設定</option>
              {targetTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] sm:text-sm">
            目標名（任意）
            <input
              className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
              placeholder="例: 2学期中間 / 東大 / 数検2級"
              value={extra.targetName ?? ""}
              onChange={(e) => setExtra((prev) => ({ ...prev, targetName: e.target.value || undefined }))}
            />
          </label>
          <label className="text-[10px] sm:text-sm">
            期限（任意）
            <input
              type="date"
              className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
              value={extra.targetDate ?? ""}
              onChange={(e) => setExtra((prev) => ({ ...prev, targetDate: e.target.value || undefined }))}
            />
          </label>
          <label className="text-[10px] sm:text-sm">
            週あたり学習時間（任意）
            <input
              type="number"
              min={1}
              max={80}
              className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
              value={extra.weeklyHours ?? ""}
              onChange={(e) =>
                setExtra((prev) => ({
                  ...prev,
                  weeklyHours: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </label>
          <label className="text-[10px] sm:text-sm">
            メモ（任意）
            <textarea
              rows={2}
              className="mt-1 w-full border rounded-2xl px-3 py-2 text-[10px] sm:text-sm bg-white"
              placeholder="例: 今月は確率を重点的に"
              value={extra.note ?? ""}
              onChange={(e) => setExtra((prev) => ({ ...prev, note: e.target.value || undefined }))}
            />
          </label>
          <div className="text-[10px] sm:text-xs text-gray-500">
            ※ 任意項目は保存後、ロードマップ表示に反映されます。
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => save(mode === "create" ? "create" : "update")}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-[10px] sm:text-sm w-full sm:w-auto transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
            SV
          </span>
          {saving ? "保存中..." : mode === "create" ? "新規コースとして保存" : "更新して保存"}
        </button>
        {mode === "create" ? (
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] sm:text-xs text-amber-700">
            新規作成モード
          </div>
        ) : null}
      </div>

      {msg ? <div className={`text-[10px] sm:text-sm ${msgTone}`}>{msg}</div> : null}

      <div className="text-[10px] sm:text-xs text-gray-500">
        ※ 設定は /course と /course/topics に反映されます。
      </div>
    </div>
  );
}
