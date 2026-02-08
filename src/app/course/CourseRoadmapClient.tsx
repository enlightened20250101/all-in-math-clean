"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOPICS } from "@/lib/course/topics";
import type { UnitId } from "@/lib/course/topics";
import { loadCourseSettingsExtra, type CourseSettingsExtra } from "@/lib/course/settingsStorage";
import { getCourseElectiveOptions, isTopicIncludedByElectives, normalizeElectiveSelection } from "@/lib/course/electives";
import { cachedFetchJson, invalidateCache } from "@/lib/course/clientFetchCache";
import { useCourseIndex } from "@/lib/course/useCourseIndex";
import { useUserCourses } from "@/lib/course/useUserCourses";
import { getTopicDifficulty, isTopicCore } from "@/lib/course/topicDifficulty";

type CatalogTopic = {
  id: string;
  title: string;
  description: string;
};

type Topic = {
  id: string;
  title: string;
  description: string;
};

type CatalogResponse = {
  ok: boolean;
  catalog: { courseId: string; title: string; topics: CatalogTopic[] };
};

type PlanResponse = {
  ok: boolean;
  plan: { courseId: string; goal: number; topicOrder: string[] };
};

type SrsRow = {
  topic_id: string;
  due_at: string;
  interval_days: number;
  reps: number;
  lapses: number;
  ef: number;
  updated_at: string;
};

type ProgressResponse = {
  ok: boolean;
  items: SrsRow[];
};

type GraphEdge = { from: string; to: string };
type GraphResponse = { ok: boolean; graph: { version: number; edges: GraphEdge[] } };

type Settings = {
  courseId: string;
  goal: number;
};

type TargetTheme = {
  label: string;
  tone: string;
  ring: string;
  chip: string;
  action: string;
};

const UNIT_LABELS: Record<UnitId, string> = {
  math1: "数学I",
  mathA: "数学A",
  math2: "数学II",
  mathB: "数学B",
  mathC: "数学C",
  math3: "数学III",
};
function masteryRank(s: SrsRow | null): number {
  if (!s) return 0;
  if (s.reps <= 0) return 1;
  if (s.lapses >= 3) return 1;
  if (s.interval_days >= 14 && s.reps >= 3) return 3;
  return 2;
}

function masteryLabel(s: SrsRow | null): string {
  const rank = masteryRank(s);
  if (rank === 0) return "未着手";
  if (rank === 1) return "要復習";
  if (rank === 2) return "進行中";
  return "定着";
}

function isDue(s: SrsRow | null): boolean {
  if (!s?.due_at) return false;
  return new Date(s.due_at).getTime() <= Date.now();
}

function buildDynamicOrder(options: {
  nodes: string[];
  edges: GraphEdge[];
  baseIndex: Map<string, number>;
  progressMap: Map<string, SrsRow>;
}): string[] {
  const { nodes, edges, baseIndex, progressMap } = options;
  const nodeSet = new Set(nodes);
  const indeg = new Map<string, number>();
  const next = new Map<string, string[]>();

  nodes.forEach((id) => {
    indeg.set(id, 0);
    next.set(id, []);
  });

  edges.forEach((e) => {
    if (!nodeSet.has(e.from) || !nodeSet.has(e.to)) return;
    next.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  });

  const rankOf = (id: string) => {
    const s = progressMap.get(id) ?? null;
    return masteryRank(s);
  };

  const pickNext = (queue: string[]) => {
    queue.sort((a, b) => {
      const da = isDue(progressMap.get(a) ?? null);
      const db = isDue(progressMap.get(b) ?? null);
      if (da !== db) return da ? -1 : 1;
      const ra = rankOf(a);
      const rb = rankOf(b);
      if (ra !== rb) return ra - rb;
      return (baseIndex.get(a) ?? 0) - (baseIndex.get(b) ?? 0);
    });
    return queue.shift();
  };

  const queue: string[] = [];
  nodes.forEach((id) => {
    if ((indeg.get(id) ?? 0) === 0) queue.push(id);
  });

  const ordered: string[] = [];
  while (queue.length) {
    const id = pickNext(queue);
    if (!id) break;
    ordered.push(id);
    next.get(id)!.forEach((to) => {
      const v = (indeg.get(to) ?? 0) - 1;
      indeg.set(to, v);
      if (v === 0) queue.push(to);
    });
  }

  if (ordered.length !== nodes.length) return nodes;
  return ordered;
}

function targetTheme(type?: string): TargetTheme {
  const key = (type ?? "").trim();
  if (key.includes("定期")) {
    return {
      label: "定期テスト",
      tone: "from-amber-50 via-white to-orange-50",
      ring: "ring-amber-200/70",
      chip: "border-amber-200 bg-amber-50 text-amber-700",
      action: "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200",
    };
  }
  if (key.includes("共通")) {
    return {
      label: "共通テスト",
      tone: "from-sky-50 via-white to-blue-50",
      ring: "ring-sky-200/80",
      chip: "border-sky-200 bg-sky-50 text-sky-700",
      action: "border-sky-200 bg-sky-100 text-sky-800 hover:bg-sky-200",
    };
  }
  if (key.includes("難関") || key.includes("大学別")) {
    return {
      label: "難関/大学別",
      tone: "from-slate-50 via-white to-indigo-50",
      ring: "ring-indigo-200/70",
      chip: "border-indigo-200 bg-indigo-50 text-indigo-700",
      action: "border-indigo-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    };
  }
  if (key.includes("資格")) {
    return {
      label: "資格/検定",
      tone: "from-emerald-50 via-white to-teal-50",
      ring: "ring-emerald-200/70",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
      action: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    };
  }
  return {
    label: "学習",
    tone: "from-slate-50 via-white to-sky-50",
    ring: "ring-sky-200/80",
    chip: "border-slate-200 bg-slate-50 text-slate-500",
    action: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
  };
}

export default function CourseRoadmapClient() {
  const router = useRouter();
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [settings, setSettings] = useState<Settings>({ courseId: "hs_ia", goal: 65 });
  const [extra, setExtra] = useState<CourseSettingsExtra>({});
  const [catalog, setCatalog] = useState<CatalogTopic[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [progress, setProgress] = useState<SrsRow[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [profileMasteredTopicIds, setProfileMasteredTopicIds] = useState<string[]>([]);
  const [lockedHintId, setLockedHintId] = useState<string | null>(null);
  const [roadmapCollapsed, setRoadmapCollapsed] = useState(false);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const { courses: userCourses, loading: userCoursesLoading, reload: reloadUserCourses } = useUserCourses();
  const safeUserCourses = useMemo(() => {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return userCourses.filter((course) => !!course.id && uuidRe.test(String(course.id)));
  }, [userCourses]);
  const activeUserCourses = useMemo(
    () => safeUserCourses.filter((course) => !course.isCompleted),
    [safeUserCourses]
  );
  const completedUserCourses = useMemo(
    () => safeUserCourses.filter((course) => course.isCompleted),
    [safeUserCourses]
  );
  const activeUserCourse = useMemo(
    () => activeUserCourses.find((course) => course.isActive) ?? null,
    [activeUserCourses]
  );
  useEffect(() => {
    if (!activeUserCourse) return;
    const next = {
      courseId: activeUserCourse.baseCourseId,
      goal: activeUserCourse.goal ?? settings.goal,
    };
    setSettings((prev) =>
      prev.courseId === next.courseId && prev.goal === next.goal ? prev : next
    );
  }, [activeUserCourse, settings.goal]);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const dataReadyRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const fetchOptions = useMemo(() => ({ cooldownMs: 8000 }), []);
  const MIN_RELOAD_MS = 10_000;

  const readStoredRoadmap = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("course_roadmap_current");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { courseId?: Settings["courseId"] } | null;
      if (parsed?.courseId) return parsed.courseId;
      return null;
    } catch {
      return null;
    }
  };

  const persistCurrentRoadmap = (courseId: Settings["courseId"]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "course_roadmap_current",
        JSON.stringify({ courseId, updatedAt: new Date().toISOString() })
      );
      window.dispatchEvent(new Event("course-roadmap-change"));
    } catch {
      // ignore
    }
  };

  // recent course list is managed in DB (user courses)

  useEffect(() => {
    if (!courseIndex.length) return;
    if (courseMap.has(settings.courseId)) return;
    const fallback = courseIndex[0]?.courseId ?? "hs_ia";
    setSettings((prev) => ({ ...prev, courseId: fallback }));
  }, [courseIndex, courseMap, settings.courseId]);

  useEffect(() => {
    if (!openMenuKey) return;
    const handle = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-roadmap-menu="true"]')) return;
      setOpenMenuKey(null);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [openMenuKey]);

  const load = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadRef.current < MIN_RELOAD_MS) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    const shouldShowLoading = !dataReadyRef.current;
    setLoading(shouldShowLoading);
    if (shouldShowLoading) setNotice(null);
    let nextSettings = settings;
    try {
      const settingsData = await cachedFetchJson(
        "course_settings",
        30_000,
        async () => {
          const settingsRes = await fetch("/api/course/settings", { cache: "no-store" });
          const data = await settingsRes.json().catch(() => null);
          if (!settingsRes.ok || !data?.ok) throw new Error(data?.error ?? "settings error");
          return data;
        },
        fetchOptions
      );
      if (settingsData?.ok) {
        const proposed = {
          courseId: settingsData.settings.courseId ?? "hs_ia",
          goal: settingsData.settings.goal ?? 65,
        };
        const storedCourseId = readStoredRoadmap();
        const allowedCourseIds = new Set(userCourses.map((course) => course.baseCourseId));
        const preferredCourseId =
          activeUserCourse?.baseCourseId ??
          (storedCourseId && allowedCourseIds.has(storedCourseId) ? storedCourseId : null);
        const resolvedCourseId =
          preferredCourseId && courseMap.has(preferredCourseId) ? preferredCourseId : proposed.courseId;
        nextSettings = { ...proposed, courseId: resolvedCourseId };
        setSettings((prev) =>
          prev.courseId === nextSettings.courseId && prev.goal === nextSettings.goal
            ? prev
            : nextSettings
        );
      }
    } catch (e) {
      if (!(e instanceof Error && e.message === "request cooldown")) {
        setNotice("設定の取得に失敗しました");
      }
    }

    const loadExtraWithDefaults = () => {
      const data = loadCourseSettingsExtra();
      return { level: data.level ?? 3, ...data };
    };
    setExtra(loadExtraWithDefaults());

    try {
      const [cRes, pRes, prRes] = await Promise.allSettled([
        cachedFetchJson(
          `course_catalog:${nextSettings.courseId}`,
          5 * 60_000,
          async () => {
            const res = await fetch(
              `/api/course/catalog?courseId=${encodeURIComponent(nextSettings.courseId)}`,
              { cache: "no-store" }
            );
            const data: CatalogResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error("catalog error");
            return data;
          },
          fetchOptions
        ),
        cachedFetchJson(
          `course_plan:${nextSettings.courseId}:${nextSettings.goal}`,
          60_000,
          async () => {
            const res = await fetch(
              `/api/course/plan?courseId=${encodeURIComponent(nextSettings.courseId)}&goal=${nextSettings.goal}`,
              { cache: "no-store" }
            );
            const data: PlanResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error("plan error");
            return data;
          },
          fetchOptions
        ),
        cachedFetchJson(
          "course_progress",
          10_000,
          async () => {
            const res = await fetch(`/api/course/progress`, { cache: "no-store" });
            const data: ProgressResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error("progress error");
            return data;
          },
          fetchOptions
        ),
      ]);

      if (cRes.status === "fulfilled") {
        const cData = cRes.value as CatalogResponse;
        setCatalog((prev) => (cData.catalog.topics?.length ? cData.catalog.topics : prev));
        setLastUpdated(Date.now());
        if (cData.catalog.topics?.length) dataReadyRef.current = true;
      } else {
        const units = courseMap.get(nextSettings.courseId)?.units ?? [];
        const fallback = TOPICS.filter((t) => units.includes(t.unit)).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
        }));
        setCatalog((prev) => (prev.length ? prev : fallback));
        setNotice("カタログ取得に失敗したため、既定の一覧から表示しています");
        if (fallback.length) dataReadyRef.current = true;
      }

      if (pRes.status === "fulfilled") {
        const pData = pRes.value as PlanResponse;
        setOrder((prev) => (pData.plan.topicOrder?.length ? pData.plan.topicOrder : prev));
        setLastUpdated(Date.now());
        if (pData.plan.topicOrder?.length) dataReadyRef.current = true;
      } else {
        setNotice((prev) => prev ?? "学習プランの取得に失敗しました");
      }

      if (prRes.status === "fulfilled") {
        const prData = prRes.value as ProgressResponse;
        setProgress((prev) => (prData.items?.length ? prData.items : prev));
        setLastUpdated(Date.now());
        if (prData.items?.length) dataReadyRef.current = true;
      } else {
        setNotice((prev) => prev ?? "進捗の取得に失敗しました");
      }

      try {
        const gData = await cachedFetchJson(
          "course_graph",
          5 * 60_000,
          async () => {
            const res = await fetch("/api/course/graph", { cache: "no-store" });
            const data: GraphResponse = await res
              .json()
              .catch(() => ({ ok: false, graph: { version: 1, edges: [] } }));
            if (!res.ok || !data.ok) throw new Error("graph error");
            return data;
          },
          fetchOptions
        );
        if (gData.ok) setEdges((prev) => (gData.graph.edges?.length ? gData.graph.edges : prev));
        if (gData.ok) setLastUpdated(Date.now());
      } catch {
        setNotice((prev) => prev ?? "依存関係の取得に失敗しました");
      }
    } catch (e) {
      console.error(e);
      if (!(e instanceof Error && e.message === "request cooldown")) {
        setNotice("ロードマップの取得に失敗しました");
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [settings, fetchOptions, courseMap, userCourses, activeUserCourse]);

  useEffect(() => {
    persistCurrentRoadmap(settings.courseId);
  }, [settings.courseId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("course_roadmap_branches");
      if (raw) setExpandedSections(JSON.parse(raw));
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "course_settings_extra_v1") {
        const data = loadCourseSettingsExtra();
        setExtra({ level: data.level ?? 3, ...data });
      }
      if (event.key === "course_settings_updated_at") {
        load();
      }
    };
    const handleFocus = () => {
      load();
      const data = loadCourseSettingsExtra();
      setExtra({ level: data.level ?? 3, ...data });
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        load();
        const data = loadCourseSettingsExtra();
        setExtra({ level: data.level ?? 3, ...data });
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("course-settings");
      bc.onmessage = () => {
        load();
        const data = loadCourseSettingsExtra();
        setExtra({ level: data.level ?? 3, ...data });
      };
    }
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (bc) bc.close();
    };
  }, [load]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("course_roadmap_branches", JSON.stringify(expandedSections));
    } catch {
      // noop
    }
  }, [expandedSections]);

  const topicMap = useMemo(() => {
    const m = new Map<string, CatalogTopic>();
    catalog.forEach((t) => m.set(t.id, t));
    return m;
  }, [catalog]);

  const topicUnitMap = useMemo(() => {
    return new Map<string, UnitId>(TOPICS.map((t) => [t.id, t.unit]));
  }, []);

  const topicInfoMap = useMemo(() => {
    return new Map<string, (typeof TOPICS)[number]>(TOPICS.map((t) => [t.id, t]));
  }, []);

  const topicMetaMap = useMemo(() => {
    return new Map<string, { section?: string }>(TOPICS.map((t) => [t.id, { section: t.section }]));
  }, []);

  const masteredSet = useMemo(() => {
    const set = new Set<string>();
    (activeUserCourse?.masteredTopicIds ?? []).forEach((id) => set.add(id));
    profileMasteredTopicIds.forEach((id) => set.add(id));
    return set;
  }, [activeUserCourse?.masteredTopicIds, profileMasteredTopicIds]);
  const progressMap = useMemo(() => {
    const m = new Map<string, SrsRow>();
    progress.forEach((r) => m.set(r.topic_id, r));
    if (masteredSet.size) {
      const now = new Date().toISOString();
      masteredSet.forEach((id) => {
        if (!m.has(id)) {
          m.set(id, {
            topic_id: id,
            due_at: now,
            interval_days: 30,
            reps: 4,
            lapses: 0,
            ef: 2.5,
            updated_at: now,
          });
        }
      });
    }
    return m;
  }, [progress, masteredSet]);

  const prereqMap = useMemo(() => {
    const m = new Map<string, string[]>();
    edges.forEach((edge) => {
      const list = m.get(edge.to) ?? [];
      if (!list.includes(edge.from)) list.push(edge.from);
      m.set(edge.to, list);
    });
    return m;
  }, [edges]);

  const nextMap = useMemo(() => {
    const m = new Map<string, string[]>();
    edges.forEach((edge) => {
      const list = m.get(edge.from) ?? [];
      if (!list.includes(edge.to)) list.push(edge.to);
      m.set(edge.from, list);
    });
    return m;
  }, [edges]);

  const lockedSet = useMemo(() => {
    const s = new Set<string>();
    prereqMap.forEach((prereqs, id) => {
      if (prereqs.some((pid) => masteryRank(progressMap.get(pid) ?? null) <= 1)) {
        s.add(id);
      }
    });
    return s;
  }, [prereqMap, progressMap]);

  const electiveCourseId = courseMap.get(settings.courseId)?.baseCourseId ?? settings.courseId;
  const electiveOptions = useMemo(() => getCourseElectiveOptions(electiveCourseId), [electiveCourseId]);
  const electiveSelection = useMemo(
    () => normalizeElectiveSelection(electiveCourseId, extra.electives?.[settings.courseId]),
    [electiveCourseId, settings.courseId, extra.electives]
  );
  const userLevel = activeUserCourse?.level ?? extra.level ?? 3;

  const orderedTopics = useMemo(() => {
    const baseOrder = order.length ? order : catalog.map((t) => t.id);
    const filteredOrder = electiveOptions.length
      ? baseOrder.filter((id) =>
          isTopicIncludedByElectives(electiveCourseId, topicInfoMap.get(id), electiveSelection)
        )
      : baseOrder;
    const skipThreshold = Math.max(0, userLevel - 2);
    const levelFiltered = filteredOrder.filter((id) => {
      const diff = getTopicDifficulty(id);
      if (isTopicCore(id)) return true;
      return diff > skipThreshold;
    });
    const nodes = levelFiltered.length ? levelFiltered : filteredOrder.length ? filteredOrder : baseOrder;
    const baseIndex = new Map(nodes.map((id, idx) => [id, idx]));
    const dynamicOrder =
      edges.length > 0
        ? buildDynamicOrder({
            nodes,
            edges,
            baseIndex,
            progressMap,
          })
        : nodes;
    return dynamicOrder
      .map((id) => topicMap.get(id))
      .filter((t): t is CatalogTopic => Boolean(t));
  }, [
    order,
    catalog,
    topicMap,
    edges,
    progressMap,
    electiveOptions.length,
    settings.courseId,
    topicInfoMap,
    electiveSelection,
    userLevel,
  ]);

  const currentTopic = useMemo<CatalogTopic | null>(() => {
    if (!orderedTopics.length) return null;
    for (const topic of orderedTopics) {
      const s = progressMap.get(topic.id) ?? null;
      if (masteryRank(s) <= 1) return topic;
    }
    return orderedTopics[0] ?? null;
  }, [orderedTopics, progressMap]);

  const grouped = useMemo(() => {
    const units = courseMap.get(settings.courseId)?.units ?? [];
    return units.map((unit) => {
      const topics = orderedTopics.filter((t) => topicUnitMap.get(t.id) === unit);
      const sections = topics.map((topic) => {
        const meta = topicMetaMap.get(topic.id);
        const section = meta?.section ?? "other";
        return {
          section,
          primary: topic,
          branches: [],
        };
      });
      return { unit, topics, sections };
    });
  }, [orderedTopics, settings.courseId, topicUnitMap, topicMetaMap]);

  const paceInfo = useMemo(() => {
    if (!extra.targetDate) return null;
    const target = new Date(extra.targetDate);
    if (Number.isNaN(target.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = orderedTopics.filter((t) => masteryRank(progressMap.get(t.id) ?? null) <= 1).length;
    if (diffDays <= 0) {
      return { label: "期限超過", detail: `未完了 ${remaining}単元` };
    }
    const weeks = Math.max(1, Math.ceil(diffDays / 7));
    const perWeek = Math.max(1, Math.ceil(remaining / weeks));
    return { label: `残り${diffDays}日`, detail: `週あたり目安 ${perWeek}単元` };
  }, [extra.targetDate, orderedTopics, progressMap]);

  const applyTodayFocus = useMemo(() => {
    if (!paceInfo) return null;
    const remaining = orderedTopics.filter((t) => masteryRank(progressMap.get(t.id) ?? null) <= 1);
    return remaining.slice(0, 3);
  }, [paceInfo, orderedTopics, progressMap]);

  const todayPracticeHref = useMemo(() => {
    if (!applyTodayFocus || !applyTodayFocus.length) return "";
    const first = applyTodayFocus[0];
    if (lockedSet.has(first.id)) return "";
    return `/course/practice/session?topic=${encodeURIComponent(first.id)}&mode=review&course=${encodeURIComponent(
      settings.courseId
    )}`;
  }, [applyTodayFocus, lockedSet, settings.courseId]);

  const todayQuickHref = useMemo(() => {
    if (!applyTodayFocus || !applyTodayFocus.length) return "";
    const first = applyTodayFocus[0];
    if (lockedSet.has(first.id)) return "";
    return `/course/practice/session?topic=${encodeURIComponent(first.id)}&mode=review&limit=3&course=${encodeURIComponent(
      settings.courseId
    )}`;
  }, [applyTodayFocus, lockedSet, settings.courseId]);

  const todayPrereqHref = useMemo(() => {
    if (!applyTodayFocus || !applyTodayFocus.length) return "";
    const first = applyTodayFocus[0];
    const prereqs = prereqMap.get(first.id) ?? [];
    if (!prereqs.length) return "";
    const pid = prereqs[0];
    const unit = topicUnitMap.get(pid);
    return `/course/topics/${pid}?course=${settings.courseId}&unit=${unit ?? ""}`;
  }, [applyTodayFocus, prereqMap, topicUnitMap, settings.courseId]);

  const miniMap = useMemo(() => {
    const focus = currentTopic;
    if (!focus) return null;
    const prereqs = (prereqMap.get(focus.id) ?? []).slice(0, 2);
    const nexts = (nextMap.get(focus.id) ?? []).slice(0, 2);
    return {
      focus,
      prereqs,
      nexts,
    };
  }, [currentTopic, prereqMap, nextMap]);


  const getStatusTone = useCallback(
    (id: string) => {
      const s = progressMap.get(id) ?? null;
      const rank = masteryRank(s);
      if (rank <= 1) return "border-rose-200 bg-rose-50 text-rose-700";
      if (rank === 2) return "border-amber-200 bg-amber-50 text-amber-700";
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    },
    [progressMap]
  );

  const getPriorityBadges = useCallback(
    (id: string) => {
      const s = progressMap.get(id) ?? null;
      const tags: Array<{ label: string; tone: string }> = [];
      if (isDue(s)) {
        tags.push({ label: "期限近", tone: "border-rose-200 bg-rose-50 text-rose-700" });
      }
      if (!s) {
        tags.push({ label: "未着手", tone: "border-slate-200 bg-slate-50 text-slate-500" });
      } else if (s.lapses >= 2 || s.reps <= 0) {
        tags.push({ label: "弱点", tone: "border-amber-200 bg-amber-50 text-amber-700" });
      }
      if (lockedSet.has(id)) {
        tags.push({ label: "前提あり", tone: "border-slate-200 bg-slate-100 text-slate-500" });
      }
      return tags.slice(0, 3);
    },
    [progressMap, lockedSet]
  );

  const metaLine = useMemo(() => {
    const parts: string[] = [];
    if (extra.targetType) parts.push(extra.targetType);
    if (extra.targetName) parts.push(extra.targetName);
    if (extra.targetDate) parts.push(`期限: ${extra.targetDate}`);
    if (extra.weeklyHours) parts.push(`週${extra.weeklyHours}h`);
    return parts.join(" / ");
  }, [extra]);

  const theme = useMemo(() => targetTheme(extra.targetType), [extra.targetType]);

  const sectionLabel = useCallback((label?: string) => {
    if (!label) return "";
    const key = label.toLowerCase().replace(/[-\s]+/g, "_");
    const map: Record<string, string> = {
      algebra: "代数",
      geometry: "幾何",
      trigonometry: "三角関数",
      trig: "三角関数",
      identity: "恒等式",
      inequality: "不等式",
      identity_inequality: "恒等式・不等式",
      calculus: "微積",
      differential: "微分",
      integral: "積分",
      vectors: "ベクトル",
      vector: "ベクトル",
      matrix: "行列",
      matrices: "行列",
      function: "関数",
      functions: "関数",
      graph: "グラフ",
      graphs: "グラフ",
      probability: "確率",
      stats: "統計",
      statistics: "統計",
      sequences: "数列",
      sequence: "数列",
      complex: "複素数",
      integers: "整数",
      integer: "整数",
      exponential: "指数",
      logarithm: "対数",
      log: "対数",
      set: "集合",
    };
    return map[key] ?? label;
  }, []);

  const toggleAllPanels = useCallback(() => {
    setRoadmapCollapsed((prev) => !prev);
  }, []);

  return (
    <div
      className={`border border-slate-400/80 rounded-[28px] p-4 sm:p-6 bg-gradient-to-br ${theme.tone} shadow-sm ring-1 ${theme.ring} space-y-4`}
    >
      <div className="flex flex-col gap-2 items-stretch">
        <button
          type="button"
          onClick={toggleAllPanels}
          className="group flex w-full items-center justify-between gap-3 text-[15px] sm:text-base font-semibold rounded-full px-3 py-2 hover:bg-white/70 transition"
          aria-label={roadmapCollapsed ? "ロードマップを展開" : "ロードマップを畳む"}
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            RM
          </span>
          学習ロードマップ
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-400/80 text-[10px] text-slate-500 transition group-hover:scale-105 ${
              roadmapCollapsed ? "rotate-0" : "rotate-180"
            }`}
          >
            ⌃
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500">
          <div className="relative" data-roadmap-menu="true">
            <button
              type="button"
              onClick={() => setOpenMenuKey((prev) => (prev === "course" ? null : "course"))}
              className="inline-flex items-center gap-2 rounded-full border border-slate-400/80 bg-white px-3 py-1.5 text-[10px] text-slate-700 shadow-sm hover:bg-slate-50 transition"
              aria-label="コースを選択"
            >
              コース選択
            </button>
            {openMenuKey === "course" ? (
              <div className="absolute left-0 top-10 z-10 w-[min(14rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[18px] border border-slate-400/80 bg-white p-2 shadow-lg sm:w-56 max-h-[60vh] overflow-auto sm:left-full sm:top-0 sm:ml-2">
                <div className="space-y-1 text-[10px] text-slate-600">
                  {activeUserCourses.length === 0 && !userCoursesLoading ? (
                    <div className="rounded-[12px] border border-dashed bg-slate-50 px-3 py-2 text-[10px] text-slate-500">
                      まだ学習中のコースがありません
                    </div>
                  ) : null}
                  {activeUserCourses.map((course) => {
                    const isActive = course.isActive;
                    const baseLabel = courseMap.get(course.baseCourseId)?.title ?? course.baseCourseId;
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            setOpenMenuKey(null);
                            return;
                          }
                          const uuidRe =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                          if (!course?.id || !uuidRe.test(String(course.id))) {
                            setNotice("コースIDが取得できません");
                            return;
                          }
                          setOpenMenuKey(null);
                          setNotice(null);
                          (async () => {
                            try {
                              const res = await fetch(
                                `/api/course/user-courses/${encodeURIComponent(course.id)}/activate`,
                                {
                                  method: "POST",
                                }
                              );
                              const data = await res.json().catch(() => null);
                              if (!res.ok || !data?.ok) {
                                setNotice(data?.error ?? "コース切替に失敗しました");
                                return;
                              }
                              if (typeof window !== "undefined") {
                                try {
                                  window.localStorage.setItem(
                                    "course_settings_updated_at",
                                    String(Date.now())
                                  );
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
                            } catch (e) {
                              console.error(e);
                              const message = e instanceof Error ? e.message : "コース切替に失敗しました";
                              setNotice(message);
                            } finally {
                              invalidateCache("course_settings");
                              lastLoadRef.current = 0;
                              dataReadyRef.current = false;
                              await reloadUserCourses();
                              load();
                            }
                          })();
                        }}
                        className={`flex w-full items-center justify-between rounded-[14px] border px-3 py-2 text-left transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold">{course.name}</span>
                          <span className={`text-[9px] ${isActive ? "text-white/70" : "text-slate-400"}`}>
                            {baseLabel}
                          </span>
                        </span>
                        {isActive ? <span className="text-[9px]">選択中</span> : null}
                      </button>
                    );
                  })}
                  {completedUserCourses.length ? (
                    <div className="mt-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] text-slate-500">
                      修了済みコース
                    </div>
                  ) : null}
                  {completedUserCourses.map((course) => {
                    const baseLabel = courseMap.get(course.baseCourseId)?.title ?? course.baseCourseId;
                    return (
                      <div
                        key={course.id}
                        className="flex w-full items-center justify-between rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-left text-[9px] text-slate-500"
                      >
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold">{course.name}</span>
                          <span className="text-[9px] text-slate-400">{baseLabel}</span>
                        </span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] text-emerald-700">
                          修了
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 border-t border-slate-200 pt-2">
                  <Link
                    href="/course/settings?mode=create"
                    className="flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[10px] text-slate-600 hover:bg-slate-50 transition"
                  >
                    新しくコースを作成
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <span className={`rounded-full border px-3 py-1 ${theme.chip}`}>目標: {settings.goal}点</span>
          {extra.targetType ? (
            <span className={`rounded-full border px-3 py-1 ${theme.chip}`}>{extra.targetType}</span>
          ) : null}
          {activeUserCourse && !activeUserCourse.isCompleted ? (
            <Link
              href={`/course/final?courseId=${encodeURIComponent(activeUserCourse.id)}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-400/80 bg-white px-3 py-1.5 text-[10px] text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              修了テストへ
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500">
        {metaLine ? <span>{metaLine}</span> : null}
        {lastUpdated ? (
          <span className="rounded-full border bg-white px-2 py-0.5">
            更新: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        ) : null}
        {notice ? (
          <button
            type="button"
            onClick={load}
            className="rounded-full border bg-white px-2 py-0.5 hover:bg-slate-50 transition"
          >
            再試行
          </button>
        ) : null}
      </div>

      {!userCoursesLoading && activeUserCourses.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white/90 px-4 py-6 text-center text-[10px] sm:text-sm text-slate-500">
          <div className="font-semibold text-slate-700">まだ学習中のコースがありません</div>
          <div className="mt-2">コースを作成するとロードマップが表示されます。</div>
          <div className="mt-4">
            <Link
              href="/course/settings?mode=create"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-[10px] sm:text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              コースを作成する
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="text-[10px] sm:text-sm text-slate-500">ロードマップを準備中...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[20px] bg-white/95 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">ロードマップ</div>
                <div className="mt-1 text-[11px] sm:text-sm font-semibold text-slate-800">
                  {activeUserCourse?.name ?? courseMap.get(settings.courseId)?.title ?? settings.courseId}
                </div>
                <div className="mt-1 text-[10px] text-slate-500">ユニットを縦並び表示</div>
              </div>
              <Link
                href="/course/settings"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] text-slate-600 hover:bg-slate-50 transition"
              >
                ロードマップ設定
              </Link>
            </div>

            {roadmapCollapsed ? (
              <div className="mt-4 rounded-[16px] border border-dashed bg-white/80 px-3 py-2 text-[10px] text-slate-500">
                折りたたみ中
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {grouped.map((group) => (
                  <div
                    key={group.unit}
                    className="rounded-[16px] bg-white/90 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-2 text-[11px] sm:text-sm font-semibold text-slate-700">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200/60 bg-slate-50 text-[9px] text-slate-500">
                        {UNIT_LABELS[group.unit]?.replace("数学", "").slice(0, 1) ?? "U"}
                      </span>
                      {UNIT_LABELS[group.unit]}
                    </div>
                    <div className="mt-3 relative space-y-4 pl-6">
                      <div className="absolute left-2.5 top-2 bottom-6 w-px bg-slate-200/70" />
                      <div className="absolute left-2.5 top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-slate-300" />
                      {group.sections.map((sectionItem, idx) => {
                        const topic = sectionItem.primary;
                        if (!topic) return null;
                        const isCurrent = !!currentTopic && topic.id === currentTopic.id;
                        const s = progressMap.get(topic.id) ?? null;
                        const rank = masteryRank(s);
                        const status = masteryLabel(s);
                        const isManualMastered = masteredSet.has(topic.id);
                        const prereqs = prereqMap.get(topic.id) ?? [];
                        const isLocked = prereqs.some((pid) => masteryRank(progressMap.get(pid) ?? null) <= 1);
                        const unit = group.unit;
                        const sidePrereqIds = prereqs
                          .filter(
                            (pid) =>
                              topicUnitMap.get(pid) !== unit &&
                              masteryRank(progressMap.get(pid) ?? null) <= 1
                          )
                          .slice(0, 2);
                        const sidePrereqs = sidePrereqIds
                          .map((pid) => topicMap.get(pid))
                          .filter(Boolean) as Topic[];
                        const statusTone =
                          isManualMastered
                            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                            :
                          status === "要復習"
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : status === "進行中"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : status === "定着"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500";
                        const href = `/course/topics/${topic.id}?course=${settings.courseId}&unit=${unit}`;
                        const key = `${group.unit}_${sectionItem.section}`;
                        const isExpanded = expandedSections[key] ?? false;
                        return (
                          <div key={topic.id} className="relative space-y-2">
                            <span
                                className={`absolute left-3 top-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full ${
                                isManualMastered
                                  ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]"
                                  : status === "要復習"
                                  ? "bg-rose-500 shadow-[0_0_0_8px_rgba(244,63,94,0.2)]"
                                  : status === "進行中"
                                  ? "bg-amber-400 shadow-[0_0_0_8px_rgba(251,191,36,0.2)]"
                                  : status === "定着"
                                  ? "bg-emerald-400 shadow-[0_0_0_8px_rgba(52,211,153,0.2)]"
                                  : "bg-sky-400 shadow-[0_0_0_8px_rgba(56,189,248,0.2)]"
                              } ${isCurrent ? "animate-pulse" : ""}`}
                            />
                            {idx < group.sections.length - 1 ? (
                              <span className="absolute left-3 top-8 h-6 w-px -translate-x-1/2 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100" />
                            ) : null}
                            <div className="flex items-start gap-2">
                              {sidePrereqs.length ? (
                                <div className="relative mt-2 flex flex-col items-center gap-2">
                                  <span className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-slate-300 sm:block" />
                                  <span className="absolute -right-1 top-1/2 hidden h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-slate-400 sm:block" />
                                  {sidePrereqs.map((sideTopic) => {
                                    const pUnit = topicUnitMap.get(sideTopic.id);
                                    return (
                                      <button
                                        key={sideTopic.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/course/topics/${sideTopic.id}?course=${settings.courseId}&unit=${pUnit ?? ""}`
                                          );
                                        }}
                                        className="h-[78px] w-[78px] rounded-[18px] border border-slate-200/70 bg-slate-50 px-2 py-2 text-[9px] text-slate-600 hover:bg-white transition shadow-sm"
                                      >
                                        <div className="text-[8px] text-slate-400">前提</div>
                                        <div className="mt-1 line-clamp-2 font-semibold text-slate-800">
                                          {sideTopic.title}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : null}
                              <div
                                role="link"
                                tabIndex={0}
                                onClick={() => {
                                  if (isLocked) {
                                    setLockedHintId((prev) => (prev === topic.id ? null : topic.id));
                                    return;
                                  }
                                  router.push(href);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key !== "Enter" && event.key !== " ") return;
                                  event.preventDefault();
                                  if (isLocked) {
                                    setLockedHintId((prev) => (prev === topic.id ? null : topic.id));
                                    return;
                                  }
                                  router.push(href);
                                }}
                                className={`relative w-[140px] sm:w-[160px] aspect-square rounded-[26px] border border-slate-200/60 bg-white px-3 py-2 transition hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 cursor-pointer ${
                                  isCurrent
                                    ? "border-blue-400 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.2)] scale-[1.02]"
                                    : isManualMastered
                                    ? "border-emerald-200 bg-emerald-50/80 shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
                                    : rank >= 3
                                    ? "border-emerald-200 bg-emerald-50/60"
                                    : isLocked
                                    ? "bg-slate-50/80"
                                    : "bg-white"
                                }`}
                              >
                                {isManualMastered ? (
                                  <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white shadow">
                                    ✓
                                  </span>
                                ) : null}
                                <div className="flex items-center justify-between text-[9px] text-slate-400">
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[8px]">
                                    {String(idx + 1).padStart(2, "0")}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {isCurrent ? (
                                      <span className="inline-flex h-2 w-2 rounded-full bg-blue-400" aria-label="current" />
                                    ) : null}
                                    {isLocked ? (
                                      <span className="inline-flex h-2 w-2 rounded-full bg-slate-400" aria-label="lock" />
                                    ) : null}
                                    <span className={`inline-flex h-2 w-2 rounded-full ${statusTone}`} aria-label={status} />
                                  </div>
                                </div>
                                <div className="mt-3 flex min-h-[72px] items-center justify-center text-center text-[11px] sm:text-sm font-semibold text-slate-900 line-clamp-3">
                                  {topic.title}
                                </div>
                              </div>
                            </div>
                            {isLocked && lockedHintId === topic.id ? (
                              <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-3 py-2 text-[10px] text-amber-800 shadow-sm">
                                <div className="font-semibold">前提が未完了です</div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {prereqs.slice(0, 3).map((pid) => {
                                    const p = topicMap.get(pid);
                                    const pUnit = topicUnitMap.get(pid);
                                    const pHref = `/course/topics/${pid}?course=${settings.courseId}&unit=${pUnit ?? ""}`;
                                    return (
                                      <Link
                                        key={pid}
                                        href={pHref}
                                        className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[9px] text-amber-800 hover:bg-amber-100 transition"
                                      >
                                        {p?.title ?? pid}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                            {idx < group.sections.length - 1 ? (
                              <div className="ml-6 flex items-center gap-2">
                                <span className="h-px w-6 bg-slate-200/60" />
                                <span className="relative h-6 w-2 rounded-full bg-slate-200/80">
                                  <span className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-400" />
                                </span>
                                <span className="h-px w-6 bg-slate-200/60" />
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="relative pl-2">
                  <span className="absolute left-0 top-4 h-2 w-2 rounded-full bg-slate-300" />
                  <div className="rounded-[20px] border border-dashed px-4 py-3 text-[10px] sm:text-xs text-slate-500 bg-white">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">GOAL</div>
                    <div className="mt-1 text-[11px] sm:text-sm font-semibold text-slate-800">ゴール地点</div>
                    <div className="mt-1">{extra.targetType ? extra.targetType : "目標を設定しよう"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-slate-500">
            <span className="rounded-full border bg-slate-50 px-3 py-1">
              現在地: {currentTopic ? currentTopic.title : "未設定"}
            </span>
            {paceInfo ? (
              <span className="rounded-full border bg-slate-50 px-3 py-1">
                {paceInfo.label} / {paceInfo.detail}
              </span>
            ) : null}
            {extra.weeklyHours ? (
              <span className="rounded-full border bg-slate-50 px-3 py-1">目安: 週{extra.weeklyHours}h</span>
            ) : null}
          </div>
          {miniMap ? (
            <div className="rounded-[20px] border border-dashed bg-white/80 px-4 py-3 text-[10px] sm:text-xs text-slate-600">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Mini Map</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {miniMap.prereqs.map((pid) => {
                  const p = topicMap.get(pid);
                  const unit = topicUnitMap.get(pid);
                  const href = `/course/topics/${pid}?course=${settings.courseId}&unit=${unit ?? ""}`;
                  return (
                    <Link
                      key={pid}
                      href={href}
                      className={`rounded-full border px-2.5 py-1 text-[10px] transition ${getStatusTone(
                        pid
                      )}`}
                    >
                      {p?.title ?? pid}
                    </Link>
                  );
                })}
                {miniMap.prereqs.length ? (
                  <span className="relative h-2 w-6 rounded-full bg-slate-200">
                    <span className="absolute left-1.5 right-2 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
                    <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-slate-400" />
                  </span>
                ) : null}
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] text-blue-800">
                  {miniMap.focus.title}
                </span>
                {miniMap.nexts.length ? (
                  <span className="relative h-2 w-6 rounded-full bg-slate-200">
                    <span className="absolute left-1.5 right-2 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-300" />
                    <span className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-slate-400" />
                  </span>
                ) : null}
                {miniMap.nexts.map((nid) => {
                  const n = topicMap.get(nid);
                  const unit = topicUnitMap.get(nid);
                  const href = `/course/topics/${nid}?course=${settings.courseId}&unit=${unit ?? ""}`;
                  return (
                    <Link
                      key={nid}
                      href={href}
                      className={`rounded-full border px-2.5 py-1 text-[10px] transition ${getStatusTone(
                        nid
                      )}`}
                    >
                      {n?.title ?? nid}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
          {applyTodayFocus && applyTodayFocus.length ? (
            <div className={`rounded-[20px] border border-dashed px-4 py-3 text-[10px] sm:text-xs ${theme.chip}`}>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Today</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {applyTodayFocus.map((t, idx) => {
                  const unit = topicUnitMap.get(t.id);
                  const href = `/course/topics/${t.id}?course=${settings.courseId}&unit=${unit ?? ""}`;
                  return (
                    <Link
                      key={t.id}
                      href={href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[10px] text-slate-700 hover:text-slate-900 hover:border-white transition"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white text-[9px]">
                        {idx + 1}
                      </span>
                      {t.title}
                    </Link>
                  );
                })}
              </div>
              {todayPracticeHref ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={todayPracticeHref}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] transition active:scale-[0.98] active:shadow-inner ${theme.action}`}
                  >
                    今日の演習へ
                  </Link>
                  {todayQuickHref ? (
                    <Link
                      href={todayQuickHref}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] text-slate-600 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner"
                    >
                      3問ショート
                    </Link>
                  ) : null}
                </div>
              ) : todayPrereqHref ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={todayPrereqHref}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] text-amber-800 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
                  >
                    前提から始める
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {notice ? <div className="text-[10px] sm:text-xs text-amber-600">{notice}</div> : null}
    </div>
  );
}
