"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TOPICS } from "@/lib/course/topics";
import type { TopicId, UnitId } from "@/lib/course/topics";
import MathMarkdown from "@/components/MathMarkdown";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";
import { loadCourseSettingsExtra, type CourseSettingsExtra } from "@/lib/course/settingsStorage";
import { getCourseElectiveOptions, isTopicIncludedByElectives, normalizeElectiveSelection } from "@/lib/course/electives";
import { useCourseIndex } from "@/lib/course/useCourseIndex";

type CatalogTopic = {
  id: string;
  title: string;
  description: string;
  viewCode: string;
  skills: string[];
  firstSkillTitle?: string;
  templateCount?: number;
  difficulty?: number;
};

type CatalogResponse = {
  ok: boolean;
  catalog: {
    courseId: string;
    title: string;
    topics: CatalogTopic[];
  };
  error?: string;
};

type SrsRow = {
  topic_id: string;
  due_at: string;
  interval_days: number;
  reps: number;
  lapses: number;
  ef: number;
  last_quality: number | null;
  updated_at: string;
};

type ProgressResponse = {
  ok: boolean;
  items: SrsRow[];
  error?: string;
};

type GraphEdge = { from: string; to: string };
type GraphResponse = { ok: boolean; graph: { version: number; edges: GraphEdge[] } };

function isDue(dueAtIso: string): boolean {
  return new Date(dueAtIso).getTime() <= Date.now();
}

function masteryLabel(s: SrsRow | null): "weak" | "normal" | "strong" | "new" {
  if (!s) return "new";
  if (s.reps <= 0) return "weak";
  if (s.lapses >= 3) return "weak";
  if (s.interval_days >= 14 && s.reps >= 3) return "strong";
  return "normal";
}

function priorityScore(
  s: SrsRow | null,
  weights: { mastery: number; due: number; dueSoon: number }
): number {
  const mastery = masteryLabel(s);
  const due = s ? isDue(s.due_at) : false;
  const dueTime = s ? new Date(s.due_at).getTime() : 0;
  const daysToDue = s ? Math.ceil((dueTime - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const masteryWeight =
    mastery === "weak" ? -2 * weights.mastery : mastery === "new" ? -1 * weights.mastery : mastery === "normal" ? 0 : 0.5;
  const dueWeight = due ? -3 * weights.due : daysToDue <= 2 ? -1 * weights.dueSoon : 0;
  return masteryWeight + dueWeight;
}

function priorityLabel(s: SrsRow | null): "高" | "中" | "低" {
  if (!s) return "中";
  const due = isDue(s.due_at);
  const dueSoon = !due && new Date(s.due_at).getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 3;
  if (due || s.lapses >= 2) return "高";
  if (s.reps <= 0 || dueSoon) return "中";
  return "低";
}

function priorityTone(s: SrsRow | null): string {
  const label = priorityLabel(s);
  if (label === "高") return "border-rose-200 bg-rose-50 text-rose-700";
  if (label === "中") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "blue" | "gray" | "green" | "red" | "yellow" }) {
  const cls =
    tone === "blue" ? "bg-blue-100 text-blue-800 border-blue-300" :
    tone === "green" ? "bg-green-100 text-green-700 border-green-200" :
    tone === "red" ? "bg-red-100 text-red-800 border-red-300" :
    tone === "yellow" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
    "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[11px] border ${cls}`}>
      {children}
    </span>
  );
}

const UNIT_LABELS: Record<UnitId, string> = {
  math1: "数I",
  mathA: "数A",
  math2: "数II",
  mathB: "数B",
  mathC: "数C",
  math3: "数III",
};

const UNIT_SET = new Set(Object.keys(UNIT_LABELS) as UnitId[]);

export default function TopicsClient() {
  const router = useRouter();
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [loading, setLoading] = useState(false);
  const [catalogTopics, setCatalogTopics] = useState<CatalogTopic[]>([]);
  const [rows, setRows] = useState<SrsRow[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string>("hs_ia");
  const [unit, setUnit] = useState<UnitId>("math1");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "new" | "weak">("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [sortBy, setSortBy] = useState<"default" | "count" | "difficulty" | "new" | "priority">("default");
  const [listMode, setListMode] = useState<"section" | "global">("section");
  const [priorityMode, setPriorityMode] = useState<"balanced" | "due" | "weak">("balanced");
  const [topOnly, setTopOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showQuick, setShowQuick] = useState(true);
  const [showJump, setShowJump] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showMiniFlow, setShowMiniFlow] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("");
  const [progressLoading, setProgressLoading] = useState(false);
  const [extra, setExtra] = useState<CourseSettingsExtra>({});
  const [flashClear, setFlashClear] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const dataReadyRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const MIN_RELOAD_MS = 10_000;

  const sp = useSearchParams();
  const spCourse = sp.get("course") ?? "";
  const spUnit = sp.get("unit") ?? "";
  const refreshKey = sp.get("r") ?? "";

  const activeCourse = courseMap.get(courseId) ?? courseIndex[0];

  useEffect(() => {
    if (!courseIndex.length) return;
    if (courseMap.has(courseId)) return;
    const fallbackCourse = courseIndex[0];
    setCourseId(fallbackCourse.courseId);
    if (fallbackCourse.units?.[0]) setUnit(fallbackCourse.units[0]);
  }, [courseIndex, courseMap, courseId]);

  const updateUrl = useCallback(
    (nextCourse: string, nextUnit: UnitId) => {
      const params = new URLSearchParams();
      params.set("course", nextCourse);
      params.set("unit", nextUnit);
      router.replace(`/course/topics?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const load = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadRef.current < MIN_RELOAD_MS) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    const shouldShowLoading = !dataReadyRef.current;
    setLoading(shouldShowLoading);
    setProgressLoading(shouldShowLoading);
    if (shouldShowLoading) setError(null);
    try {
      const [catRes, progRes] = await Promise.allSettled([
        cachedFetchJson(
          `course_catalog:${courseId}`,
          5 * 60_000,
          async () => {
            const res = await fetch(`/api/course/catalog?courseId=${encodeURIComponent(courseId)}`, {
              cache: "no-store",
            });
            const data: CatalogResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error(data.error ?? "catalog error");
            return data;
          },
          { cooldownMs: 8000 }
        ),
        cachedFetchJson(
          "course_progress",
          10_000,
          async () => {
            const res = await fetch("/api/course/progress", { cache: "no-store" });
            const data: ProgressResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error(data?.error ?? "progress error");
            return data;
          },
          { cooldownMs: 8000 }
        ),
      ]);

      if (catRes.status === "fulfilled") {
        const catData = catRes.value as CatalogResponse;
        setCatalogTopics((prev) => (catData.catalog.topics?.length ? catData.catalog.topics : prev));
        setLastUpdated(Date.now());
        if (catData.catalog.topics?.length) dataReadyRef.current = true;
      } else {
        throw new Error("catalog error");
      }

      if (progRes.status === "fulfilled") {
        const progData = progRes.value as ProgressResponse;
        setRows((prev) => (progData.items?.length ? progData.items : prev));
        setLastUpdated(Date.now());
        if (progData.items?.length) dataReadyRef.current = true;
      } else {
        setError("進捗の取得に失敗しました（一覧は表示しています）");
      }

      try {
        const gData = await cachedFetchJson(
          "course_graph",
          5 * 60_000,
          async () => {
            const gRes = await fetch("/api/course/graph", { cache: "no-store" });
            const data: GraphResponse = await gRes
              .json()
              .catch(() => ({ ok: false, graph: { version: 1, edges: [] } }));
            if (!gRes.ok || !data.ok) throw new Error("graph error");
            return data;
          },
          { cooldownMs: 8000 }
        );
        if (gData.ok) setEdges((prev) => (gData.graph.edges?.length ? gData.graph.edges : prev));
        if (gData.ok) setLastUpdated(Date.now());
      } catch {
        // keep previous edges on failure
      }
    } catch (e: any) {
      console.error(e);
      const fallbackUnits = activeCourse?.units ?? ["math1"];
      const fallbackTopics = TOPICS
        .filter((t) => fallbackUnits.includes(t.unit))
        .map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          viewCode: "",
          skills: [],
        }));
      setCatalogTopics((prev) => (prev.length ? prev : fallbackTopics));
      if (fallbackTopics.length) dataReadyRef.current = true;
      if (!(e instanceof Error && e.message === "request cooldown")) {
        setError("トピック一覧の取得に失敗しました");
        setToast("暫定データで表示しています");
      }
      setRows((prev) => prev);
    } finally {
      setLoading(false);
      setProgressLoading(false);
      loadingRef.current = false;
    }
  }, [courseId, activeCourse]);

  useEffect(() => {
    load();
  }, [refreshKey, load]);

  useEffect(() => {
    setExtra(loadCourseSettingsExtra());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === "course_settings_extra_v1" || event.key === "course_settings_updated_at") {
        setExtra(loadCourseSettingsExtra());
      }
    };
    window.addEventListener("storage", onStorage);
    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("course-settings");
      bc.onmessage = () => setExtra(loadCourseSettingsExtra());
    }
    return () => {
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const nextCourse = courseMap.has(spCourse) ? spCourse : courseId;
    const nextCourseObj = courseMap.get(nextCourse) ?? courseIndex[0];
    let nextUnit = unit;
    if (
      spUnit &&
      UNIT_SET.has(spUnit as UnitId) &&
      nextCourseObj?.units?.includes(spUnit as UnitId)
    ) {
      nextUnit = spUnit as UnitId;
    } else if (spCourse && nextCourseObj?.units?.length) {
      nextUnit = nextCourseObj.units[0];
    }

    if (nextCourse !== courseId) setCourseId(nextCourse);
    if (nextUnit !== unit) setUnit(nextUnit);
  }, [spCourse, spUnit, courseId, unit, courseIndex, courseMap]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    const savedView = window.localStorage.getItem(`${prefix}view`);
    if (savedView === "cards" || savedView === "list") {
      setViewMode(savedView);
    }
    const savedList = window.localStorage.getItem(`${prefix}list_mode`);
    if (savedList === "section" || savedList === "global") {
      setListMode(savedList);
    }
    const savedPriority = window.localStorage.getItem(`${prefix}priority_mode`);
    if (savedPriority === "balanced" || savedPriority === "due" || savedPriority === "weak") {
      setPriorityMode(savedPriority);
    }
    const savedTop = window.localStorage.getItem(`${prefix}top_only`);
    if (savedTop === "on") setTopOnly(true);
    const savedQuery = window.localStorage.getItem(`${prefix}query`);
    if (savedQuery != null) setQuery(savedQuery);
    const savedMiniFlow = window.localStorage.getItem(`${prefix}mini_flow`);
    if (savedMiniFlow === "off") setShowMiniFlow(false);
    if (!savedMiniFlow && window.innerWidth < 640) setShowMiniFlow(false);
    const savedFilter = window.localStorage.getItem(`${prefix}filter`);
    if (savedFilter === "all" || savedFilter === "due" || savedFilter === "new" || savedFilter === "weak") {
      setFilter(savedFilter);
    }
    const savedSort = window.localStorage.getItem(`${prefix}sort`);
    if (savedSort === "default" || savedSort === "count" || savedSort === "difficulty" || savedSort === "new" || savedSort === "priority") {
      setSortBy(savedSort);
    }
    try {
      const savedSections = window.localStorage.getItem(`${prefix}sections`);
      if (savedSections) {
        const parsed = JSON.parse(savedSections) as Record<string, boolean>;
        if (parsed && typeof parsed === "object") setExpandedSections(parsed);
      }
    } catch {
      // ignore
    }

  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}view`, viewMode);
  }, [courseId, viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}list_mode`, listMode);
  }, [courseId, listMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}priority_mode`, priorityMode);
  }, [courseId, priorityMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}top_only`, topOnly ? "on" : "off");
  }, [courseId, topOnly]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}query`, query);
  }, [courseId, query]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}filter`, filter);
  }, [courseId, filter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}sort`, sortBy);
  }, [courseId, sortBy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    try {
      window.localStorage.setItem(`${prefix}sections`, JSON.stringify(expandedSections));
    } catch {
      // ignore
    }
  }, [courseId, expandedSections]);

  const priorityWeights = useMemo(() => {
    if (priorityMode === "due") return { mastery: 0.6, due: 1.4, dueSoon: 1.1 };
    if (priorityMode === "weak") return { mastery: 1.4, due: 0.8, dueSoon: 0.6 };
    return { mastery: 1, due: 1, dueSoon: 1 };
  }, [priorityMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    const saved = window.localStorage.getItem(`${prefix}descriptions`);
    if (saved === "show") setShowDescriptions(true);
    if (saved === "hide") setShowDescriptions(false);
  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}descriptions`, showDescriptions ? "show" : "hide");
  }, [courseId, showDescriptions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    const saved = window.localStorage.getItem(`${prefix}quick`);
    if (saved === "show") setShowQuick(true);
    if (saved === "hide") setShowQuick(false);
  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}quick`, showQuick ? "show" : "hide");
  }, [courseId, showQuick]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    const saved = window.localStorage.getItem(`${prefix}controls`);
    if (saved === "show") setShowControls(true);
    if (saved === "hide") setShowControls(false);
    if (!saved && window.innerWidth < 640) setShowControls(false);
  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}controls`, showControls ? "show" : "hide");
  }, [courseId, showControls]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    const saved = window.localStorage.getItem(`${prefix}jump`);
    if (saved === "show") setShowJump(true);
    if (saved === "hide") setShowJump(false);
    if (!saved && window.innerWidth < 640) setShowJump(false);
  }, [courseId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}jump`, showJump ? "show" : "hide");
  }, [courseId, showJump]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefix = `course_topics_${courseId}_`;
    window.localStorage.setItem(`${prefix}mini_flow`, showMiniFlow ? "on" : "off");
  }, [courseId, showMiniFlow]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const input = document.getElementById("course-topics-search") as HTMLInputElement | null;
    if (!input) return;
    const updatePlaceholder = () => {
      const mobile = input.getAttribute("data-placeholder-mobile");
      if (window.innerWidth < 640 && mobile) {
        input.setAttribute("placeholder", mobile);
      } else {
        input.setAttribute("placeholder", "検索（例: 三角関数 / 微分 / 確率）");
      }
    };
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.focus();
      }
    };
    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("resize", updatePlaceholder);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  useEffect(() => {
    if (spCourse) return;
    let ignore = false;
    const loadSettings = async () => {
      try {
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
        if (!data?.settings?.courseId) return;
        const nextCourse = courseMap.has(data.settings.courseId) ? data.settings.courseId : null;
        if (!nextCourse) return;
        if (ignore) return;
        const nextCourseObj = courseMap.get(nextCourse) ?? courseIndex[0];
        const nextUnit = nextCourseObj?.units?.[0] ?? unit;
        setCourseId(nextCourse);
        setUnit(nextUnit);
        updateUrl(nextCourse, nextUnit);
      } catch (e) {
        console.error(e);
      }
    };
    loadSettings();
    return () => {
      ignore = true;
    };
  }, [spCourse, updateUrl, courseIndex, courseMap, unit]);

  useEffect(() => {
    if (!flashClear) return;
    const timer = window.setTimeout(() => setFlashClear(false), 700);
    return () => window.clearTimeout(timer);
  }, [flashClear]);

  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(null), 1800);
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [toast]);

  const mapByTopic = useMemo(() => {
    const m = new Map<string, SrsRow>();
    rows.forEach((r) => m.set(r.topic_id, r));
    return m;
  }, [rows]);

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
      const blocked = prereqs.some((pid) => {
        const status = masteryLabel(mapByTopic.get(pid) ?? null);
        return status === "new" || status === "weak";
      });
      if (blocked) s.add(id);
    });
    return s;
  }, [prereqMap, mapByTopic]);

  const metaByTopicId = useMemo(() => {
    return new Map<TopicId, (typeof TOPICS)[number]>(TOPICS.map((t) => [t.id, t]));
  }, []);

  const electiveCourseId = courseMap.get(courseId)?.baseCourseId ?? courseId;
  const electiveOptions = useMemo(() => getCourseElectiveOptions(electiveCourseId), [electiveCourseId]);
  const electiveSelection = useMemo(
    () => normalizeElectiveSelection(electiveCourseId, extra.electives?.[courseId]),
    [electiveCourseId, courseId, extra.electives]
  );

  const filteredCatalogTopics = useMemo(() => {
    if (!electiveOptions.length) return catalogTopics;
    return catalogTopics.filter((topic) =>
      isTopicIncludedByElectives(electiveCourseId, metaByTopicId.get(topic.id as TopicId), electiveSelection)
    );
  }, [catalogTopics, electiveOptions.length, electiveCourseId, metaByTopicId, electiveSelection]);

  const summary = useMemo(() => {
    let total = 0;
    let due = 0;
    let newly = 0;
    let weak = 0;
    filteredCatalogTopics.forEach((topic) => {
      const meta = metaByTopicId.get(topic.id as TopicId);
      const metaUnit = meta?.unit ?? "math1";
      if (metaUnit !== unit) return;
      total += 1;
      const s = mapByTopic.get(topic.id) ?? null;
      const isDueNow = s ? isDue(s.due_at) : false;
      const mastery = masteryLabel(s);
      if (isDueNow) due += 1;
      if (mastery === "new") newly += 1;
      if (mastery === "weak") weak += 1;
    });
    return { total, due, newly, weak };
  }, [filteredCatalogTopics, mapByTopic, metaByTopicId, unit]);

  const filterLabel =
    filter === "all" ? "" : filter === "due" ? "復習のみ" : filter === "new" ? "未着手のみ" : "弱点のみ";

  const sectionLabels: Record<string, string> = {
    algebra: "数と式",
    calculus: "微分積分",
    quadratic: "二次関数",
    trigonometry: "三角比",
    geometry: "図形と計量",
    data: "データの分析",
    logic: "集合と論理",
    integer: "整数の性質",
    combinatorics: "場合の数",
    probability: "確率",
    geometry_hs: "図形の性質",
    exp_log: "指数・対数",
    identity_inequality: "恒等式・不等式",
    polynomial: "多項式",
    sequence: "数列",
    statistics: "統計",
    coordinate: "座標",
    vector: "ベクトル",
    complex: "複素数",
    conic: "二次曲線",
    other: "その他",
  };

  const activeUnits = activeCourse?.units ?? [];

  useEffect(() => {
    if (!activeUnits.length) return;
    if (!activeUnits.includes(unit)) {
      setUnit(activeUnits[0]);
    }
  }, [activeUnits, unit]);

  const grouped = useMemo(() => {
    const groups: Array<{ section: string; topics: CatalogTopic[] }> = [];
    const bySection = new Map<string, CatalogTopic[]>();
    const q = query.trim().toLowerCase();
    filteredCatalogTopics.forEach((topic) => {
      const meta = metaByTopicId.get(topic.id as TopicId);
      const metaUnit = meta?.unit ?? "math1";
      if (metaUnit !== unit) return;
      if (q) {
        const hay = `${topic.title} ${topic.description}`.toLowerCase();
        if (!hay.includes(q)) return;
      }
      const section = meta?.section ?? "other";
      const s = mapByTopic.get(topic.id) ?? null;
      const due = s ? isDue(s.due_at) : false;
      const mastery = masteryLabel(s);
      if (filter === "due" && !due) return;
      if (filter === "new" && mastery !== "new") return;
      if (filter === "weak" && mastery !== "weak") return;
      if (!bySection.has(section)) {
        bySection.set(section, []);
        groups.push({ section, topics: bySection.get(section)! });
      }
      bySection.get(section)!.push(topic);
    });
    groups.forEach((g) => {
      g.topics.sort((a, b) => {
        if (sortBy === "count") {
          return (b.templateCount ?? 0) - (a.templateCount ?? 0) || a.title.localeCompare(b.title, "ja");
        }
        if (sortBy === "difficulty") {
          return (b.difficulty ?? 1) - (a.difficulty ?? 1) || a.title.localeCompare(b.title, "ja");
        }
        if (sortBy === "priority") {
          return (
            priorityScore(mapByTopic.get(a.id) ?? null, priorityWeights) -
            priorityScore(mapByTopic.get(b.id) ?? null, priorityWeights)
          );
        }
        if (sortBy === "new") {
          const ma = masteryLabel(mapByTopic.get(a.id) ?? null);
          const mb = masteryLabel(mapByTopic.get(b.id) ?? null);
          const rank = (m: ReturnType<typeof masteryLabel>) => (m === "new" ? 0 : m === "weak" ? 1 : m === "normal" ? 2 : 3);
          return rank(ma) - rank(mb) || a.title.localeCompare(b.title, "ja");
        }

        const sa = mapByTopic.get(a.id) ?? null;
        const sb = mapByTopic.get(b.id) ?? null;
        const pa = priorityScore(sa, priorityWeights);
        const pb = priorityScore(sb, priorityWeights);
        if (pa !== pb) return pa - pb;
        return a.title.localeCompare(b.title, "ja");
      });
    });
    return groups;
  }, [filteredCatalogTopics, metaByTopicId, unit, query, filter, mapByTopic, sortBy, priorityWeights]);

  const flatTopics = useMemo(() => {
    const all: CatalogTopic[] = [];
    grouped.forEach((g) => all.push(...g.topics));
    return topOnly ? all.slice(0, 10) : all;
  }, [grouped, topOnly]);

  const filteredCount = useMemo(() => {
    return grouped.reduce((acc, g) => acc + g.topics.length, 0);
  }, [grouped]);

  const totalVisibleCount = useMemo(() => {
    if (listMode === "global") return flatTopics.length;
    return filteredCount;
  }, [filteredCount, flatTopics, listMode]);

  const quickTargets = useMemo(() => {
    let weak: string | null = null;
    let fresh: string | null = null;
    for (const topic of flatTopics) {
      const s = mapByTopic.get(topic.id) ?? null;
      const label = masteryLabel(s);
      if (!weak && label === "weak") weak = topic.id;
      if (!fresh && label === "new") fresh = topic.id;
      if (weak && fresh) break;
    }
    return { weak, fresh };
  }, [flatTopics, mapByTopic]);

  const sectionKeys = useMemo(() => grouped.map((g) => g.section), [grouped]);
  const allSectionsCollapsed = useMemo(
    () => sectionKeys.length > 0 && sectionKeys.every((k) => expandedSections[k] === false),
    [sectionKeys, expandedSections]
  );
  const allSectionsExpanded = useMemo(
    () => sectionKeys.length > 0 && sectionKeys.every((k) => expandedSections[k] !== false),
    [sectionKeys, expandedSections]
  );

  useEffect(() => {
    setExpandedSections((prev) => {
      const next: Record<string, boolean> = { ...prev };
      const q = query.trim();
      const forceOpen = q.length > 0 || filter !== "all";
      grouped.forEach((g) => {
        if (next[g.section] === undefined) {
          next[g.section] = forceOpen ? true : g.topics.length <= 12;
        } else if (forceOpen) {
          next[g.section] = true;
        }
      });
      return next;
    });
  }, [grouped, query, filter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids = grouped.map((g) => `section-${g.section}`);
    if (!ids.length) return;

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const nextId = visible[0].target.id.replace("section-", "");
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => setActiveSection(nextId));
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 1] }
    );

    targets.forEach((t) => observer.observe(t));
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [grouped]);

  if (loading && filteredCatalogTopics.length === 0) {
    return <p>読み込み中...</p>;
  }

  const handleCardClick = (topicId: string) => {
    const topicHref = `/course/topics/${topicId}?course=${courseId}&unit=${unit}`;
    router.push(topicHref);
  };

  return (
    <div className="space-y-4 sm:space-y-5 course-topics math-prose">
      {error ? (
        <div className="rounded-[22px] border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-[11px] sm:text-sm text-rose-800 shadow-sm ring-1 ring-rose-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-[10px] sm:text-xs text-rose-700 hover:bg-rose-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-rose-700/80">
            取得できない場合は暫定データで表示します。
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed top-20 right-4 z-50 w-[90%] max-w-xs rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-lg sm:right-6">
          <div className="flex items-center justify-between gap-2">
            <span className="text-center w-full">{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] text-slate-500 hover:bg-slate-50"
              aria-label="通知を閉じる"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}
      <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-20 -right-10 h-44 w-44 rounded-full bg-white/6 blur-2xl" />
        <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">Course Library</div>
              <div className="mt-2 flex items-center gap-2 text-xl sm:text-2xl font-semibold tracking-tight">
                トピック一覧
                <span
                  className="hidden sm:inline-flex text-[10px] sm:text-xs text-white/80 rounded-full border border-white/30 bg-white/10 px-2 py-0.5"
                  title="検索にフォーカス"
                >
                  ⌘/Ctrl+K
                </span>
              </div>
              <div className="mt-1 text-sm text-white/90">
                復習と新規のバランスを保ちながら進めましょう
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-white/90 max-w-full">
                <span className="rounded-full border border-indigo-200/60 bg-indigo-300/10 px-3 py-1 text-indigo-50 max-w-[220px] sm:max-w-none truncate">
                  {activeCourse?.title ?? courseId}
                </span>
                <span className="rounded-full border border-cyan-200/60 bg-cyan-300/10 px-3 py-1 text-cyan-50 max-w-[120px] sm:max-w-none truncate">
                  {UNIT_LABELS[unit]}
                </span>
                <span className="rounded-full border border-amber-200/60 bg-amber-300/10 px-3 py-1 text-amber-50 max-w-[220px] sm:max-w-none truncate">
                  {filterLabel ? `絞込: ${filterLabel}` : "絞込: なし"}
                </span>
                {query ? (
                  <span
                    className="rounded-full border border-sky-200/60 bg-sky-300/15 px-2.5 py-1 text-sky-50 max-w-[260px] sm:max-w-[360px]"
                    title={`検索中: ${query}（${filteredCount}件）`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="truncate">
                        検索: {filteredCount}件
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setFilter("all");
                          setFlashClear(true);
                          setToast("条件をリセットしました");
                          const input = document.getElementById("course-topics-search") as HTMLInputElement | null;
                          input?.focus();
                        }}
                        className="inline-flex h-6 w-6 sm:h-5 sm:w-5 items-center justify-center rounded-full border border-sky-200/60 bg-sky-300/20 text-[11px] text-sky-50 hover:bg-sky-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                        aria-label="検索を解除"
                        title="検索を解除"
                      >
                        ×
                      </button>
                    </span>
                  </span>
                ) : null}
                {lastUpdated ? (
                  <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-white/90">
                    更新: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_30px_-25px_rgba(16,185,129,0.6)]">
                <div className="text-[10px] text-white/70">全トピック</div>
                <div className="text-lg font-semibold">{summary.total}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_30px_-25px_rgba(56,189,248,0.6)]">
                <div className="text-[10px] text-white/70">復習</div>
                <div className="text-lg font-semibold text-cyan-100">{summary.due}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_30px_-25px_rgba(245,158,11,0.6)]">
                <div className="text-[10px] text-white/70">未着手</div>
                <div className="text-lg font-semibold text-amber-100">{summary.newly}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_10px_30px_-25px_rgba(244,63,94,0.6)]">
                <div className="text-[10px] text-white/70">弱点</div>
                <div className="text-lg font-semibold text-rose-100">{summary.weak}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap -mx-1 px-1 pb-1">
              {courseIndex.map((c) => (
                <Link
                  key={c.courseId}
                  href={`/course/topics?course=${c.courseId}&unit=${c.units?.[0] ?? "math1"}`}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm border transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${
                    courseId === c.courseId
                      ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                      : "bg-white/70 text-slate-600 border-slate-200 hover:bg-white"
                  }`}
                >
                  {c.title}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap -mx-1 px-1 pb-1">
              {(activeCourse?.units ?? []).map((u) => (
                <Link
                  key={u}
                  href={`/course/topics?course=${courseId}&unit=${u}`}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm border transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${
                    unit === u
                      ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                      : "bg-white/70 text-slate-600 border-slate-200 hover:bg-white"
                  }`}
                >
                  {UNIT_LABELS[u]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/95 p-4 sm:p-5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/70 backdrop-blur md:flex-row md:items-center lg:items-start lg:gap-4">
        <div className="flex flex-wrap items-center gap-2 lg:max-w-[45%]">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-700 hover:bg-white transition active:scale-[0.98] active:shadow-inner"
            disabled={loading}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-500" : "bg-emerald-500"}`} />
            {loading ? "更新中..." : "更新"}
          </button>
          {lastUpdated ? (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] sm:text-xs text-slate-500">
              更新: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          ) : null}
          {error ? (
            <span className="text-xs sm:text-sm text-red-600">
              {error}
              {error.includes("進捗") ? (
                <span className="ml-2 text-[10px] sm:text-xs text-amber-700">
                  ※ログインしていない場合は進捗が表示されません
                </span>
              ) : null}
              {!error.includes("進捗") ? (
                <span className="ml-2 text-[10px] sm:text-xs text-slate-500">
                  ※一覧は既定データで表示中
                </span>
              ) : null}
            </span>
          ) : null}
          {progressLoading ? <span className="text-xs text-gray-500">進捗読込中...</span> : null}
          {filter !== "all" || query ? (
            <span className="text-xs text-gray-500">ヒット {filteredCount}件</span>
          ) : (
            <span className="text-xs text-gray-500">表示 {totalVisibleCount}件</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 md:ml-auto lg:max-w-[55%] lg:justify-end">
          <button
            type="button"
            onClick={() => setShowControls((v) => !v)}
            className="sm:hidden px-3 py-2 text-xs border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner w-full"
          >
            {showControls ? "表示・検索を閉じる" : "表示・検索を開く"}
          </button>
          <div className={`flex flex-wrap items-center gap-2 w-full sm:w-auto ${showControls ? "flex" : "hidden"} sm:flex`}>
            <div className="flex items-center gap-1 border rounded-full overflow-hidden bg-white w-full sm:w-auto">
              <Link
                href={quickTargets.weak ? `/course/practice/session?topic=${quickTargets.weak}&mode=review&limit=3` : "#"}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${
                  quickTargets.weak ? "bg-rose-50 text-rose-700 hover:bg-rose-100" : "bg-white text-slate-300 cursor-not-allowed"
                }`}
                aria-disabled={!quickTargets.weak}
                onClick={(e) => {
                  if (!quickTargets.weak) e.preventDefault();
                }}
              >
                弱点3問
              </Link>
              <Link
                href={quickTargets.fresh ? `/course/practice/session?topic=${quickTargets.fresh}&limit=3` : "#"}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${
                  quickTargets.fresh ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-white text-slate-300 cursor-not-allowed"
                }`}
                aria-disabled={!quickTargets.fresh}
                onClick={(e) => {
                  if (!quickTargets.fresh) e.preventDefault();
                }}
              >
                新規3問
              </Link>
            </div>
            <div className="flex items-center gap-1 border rounded-full overflow-hidden bg-white w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${viewMode === "cards" ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                カード
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${viewMode === "list" ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                リスト
              </button>
            </div>
            {listMode === "section" ? (
              <div className="flex items-center gap-1 border rounded-full overflow-hidden bg-white w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    sectionKeys.forEach((k) => {
                      next[k] = false;
                    });
                    setExpandedSections(next);
                  }}
                  className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${
                    allSectionsCollapsed ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  すべて畳む
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next: Record<string, boolean> = {};
                    sectionKeys.forEach((k) => {
                      next[k] = true;
                    });
                    setExpandedSections(next);
                  }}
                  className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${
                    allSectionsExpanded ? "bg-slate-900 text-white" : "bg-white"
                  }`}
                >
                  すべて展開
                </button>
              </div>
            ) : null}
            <div className="flex items-center gap-1 border rounded-full overflow-hidden bg-white w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setListMode("section")}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${listMode === "section" ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                セクション
              </button>
              <button
                type="button"
                onClick={() => setListMode("global")}
                className={`px-3 py-2 sm:py-1 text-xs transition w-full sm:w-auto ${listMode === "global" ? "bg-slate-900 text-white" : "bg-white"}`}
              >
                全体
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDescriptions((v) => !v)}
              className={`px-3 py-2 sm:py-1 text-xs border rounded-full transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto ${showDescriptions ? "bg-slate-100" : "bg-white"}`}
            >
              説明{showDescriptions ? "表示" : "非表示"}
            </button>
            <button
              type="button"
              onClick={() => setShowMiniFlow((v) => !v)}
              className={`px-3 py-2 sm:py-1 text-xs border rounded-full transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto ${showMiniFlow ? "bg-slate-100" : "bg-white"}`}
            >
              関係図{showMiniFlow ? "表示" : "非表示"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                  setFlashClear(true);
                  setToast("条件をリセットしました");
                }}
                className={`px-3 py-2 sm:py-1 text-xs border rounded-full transition active:scale-[0.98] active:shadow-inner ${
                  filter !== "all" || query
                    ? `bg-white hover:bg-white ${flashClear ? "ring-2 ring-sky-200" : ""}`
                    : "bg-slate-50 text-slate-400 cursor-default"
                }`}
                disabled={filter === "all" && !query}
              >
                条件クリア
              </button>
              <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">
                検索結果: {filteredCount}件
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 min-w-[220px] sm:flex-row sm:items-center sm:flex-wrap w-full">
              <div className="text-[10px] text-gray-500 sm:hidden">
                検索結果: {filteredCount}件
              </div>
              <span className="hidden text-xs text-gray-500 w-full sm:block sm:w-auto">検索</span>
              <div className="grid w-full grid-cols-2 gap-1 sm:gap-2 sm:flex sm:items-center sm:w-auto">
                <div className="relative col-span-2 sm:col-span-1 w-full sm:w-56">
                  <span className="sm:hidden text-[10px] text-slate-400 mb-1 block">検索</span>
                  <input
                    id="course-topics-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                    placeholder={`検索（例: 三角関数 / 微分 / 確率）`}
                    data-placeholder-mobile="検索（例: 三角関数）"
                    className="border rounded-2xl px-3 py-2 sm:py-2 text-[11px] sm:text-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border text-sm transition ${
                      query ? "bg-white hover:bg-slate-50" : "bg-slate-50 text-slate-400 cursor-default"
                    }`}
                    title="検索をクリア"
                    aria-label="検索をクリア"
                    disabled={!query}
                  >
                    ×
                  </button>
                </div>
                {query ? (
                  <span className="col-span-2 sm:col-span-1 text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                    検索中
                  </span>
                ) : null}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border rounded-2xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-sm w-full sm:w-auto min-w-[120px] bg-white col-span-1"
                >
                  <option value="all">すべて</option>
                  <option value="due">復習のみ</option>
                  <option value="new">未着手</option>
                  <option value="weak">弱点</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded-2xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-sm w-full sm:w-auto min-w-[120px] bg-white col-span-1"
                >
                  <option value="default">おすすめ順</option>
                  <option value="count">問題数が多い順</option>
                  <option value="difficulty">難易度が高い順</option>
                  <option value="new">未着手優先</option>
                  <option value="priority">優先度順</option>
                </select>
                <select
                  value={priorityMode}
                  onChange={(e) => setPriorityMode(e.target.value as any)}
                  className="border rounded-2xl px-2 py-1.5 sm:py-2 text-[11px] sm:text-sm w-full sm:w-auto min-w-[120px] bg-white col-span-1"
                >
                  <option value="balanced">優先度: バランス</option>
                  <option value="due">優先度: 期限重視</option>
                  <option value="weak">優先度: 弱点重視</option>
                </select>
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                検索結果: {filteredCount}件
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/95 p-4 shadow-[0_14px_40px_-34px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 backdrop-blur space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-gray-500">クイック操作</div>
            <div className="text-[10px] text-slate-400">よく使う絞り込みとショートカット</div>
          </div>
          <button
            type="button"
            onClick={() => setShowQuick((prev) => !prev)}
            className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 text-[10px] sm:text-xs transition active:scale-[0.98] active:shadow-inner"
            title={showQuick ? "クイックを隠す" : "クイックを表示"}
            aria-label={showQuick ? "クイックを隠す" : "クイックを表示"}
          >
            {showQuick ? "閉じる" : "開く"}
          </button>
        </div>
        {showQuick ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFilter("due")}
                className={`px-3 py-2 border rounded-full text-[10px] sm:text-[11px] min-w-[52px] text-center transition active:scale-[0.98] active:shadow-inner ${
                  filter === "due" ? "bg-blue-50 text-blue-800 border-blue-300" : "bg-white"
                }`}
              >
                復習
              </button>
              <button
                type="button"
                onClick={() => setFilter("weak")}
                className={`px-3 py-2 border rounded-full text-[10px] sm:text-[11px] min-w-[52px] text-center transition active:scale-[0.98] active:shadow-inner ${
                  filter === "weak" ? "bg-red-100 text-red-800 border-red-300" : "bg-white"
                }`}
              >
                弱点
              </button>
              <button
                type="button"
                onClick={() => setFilter("new")}
                className={`px-3 py-2 border rounded-full text-[10px] sm:text-[11px] min-w-[52px] text-center transition active:scale-[0.98] active:shadow-inner ${
                  filter === "new" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-white"
                }`}
              >
                未着手
              </button>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-2 border rounded-full text-[10px] sm:text-[11px] min-w-[52px] text-center transition active:scale-[0.98] active:shadow-inner ${
                  filter === "all" ? "bg-gray-100" : "bg-white"
                }`}
              >
                すべて
              </button>
            </div>
            <div>
              <div className="text-[11px] text-gray-500 mb-2">ショートカット</div>
              <div className="grid grid-cols-3 gap-2 text-xs sm:flex sm:flex-wrap sm:gap-2">
                <Link href={`/course/topics?course=hs_ia&unit=math1`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数I
                </Link>
                <Link href={`/course/topics?course=hs_ia&unit=mathA`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数A
                </Link>
                <Link href={`/course/topics?course=hs_iib&unit=math2`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数II
                </Link>
                <Link href={`/course/topics?course=hs_iib&unit=mathB`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数B
                </Link>
                <Link href={`/course/topics?course=hs_iic&unit=mathC`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数C
                </Link>
                <Link href={`/course/topics?course=hs_iii&unit=math3`} className="px-3 py-2 border rounded-full bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner text-center">
                  数III
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {grouped.length > 1 && listMode === "section" ? (
        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/95 p-4 sm:p-5 shadow-[0_16px_45px_-36px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-gray-500">ジャンプ</div>
            <button
              type="button"
              onClick={() => setShowJump((prev) => !prev)}
              className="sm:hidden px-2.5 py-1.5 border rounded-full text-[11px] bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner"
              title={showJump ? "ジャンプを隠す" : "ジャンプを表示"}
              aria-label={showJump ? "ジャンプを隠す" : "ジャンプを表示"}
            >
              {showJump ? "閉じる" : "開く"}
            </button>
          </div>
          {showJump ? (
            <div className="mt-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 sm:grid sm:grid-cols-2 sm:gap-2 sm:whitespace-normal lg:grid-cols-3">
              {grouped.map((group) => {
                const stats = group.topics.reduce(
                  (acc, topic) => {
                    const s = mapByTopic.get(topic.id) ?? null;
                    const due = s ? isDue(s.due_at) : false;
                    const mastery = masteryLabel(s);
                    if (due) acc.due += 1;
                    if (mastery === "weak") acc.weak += 1;
                    return acc;
                  },
                  { due: 0, weak: 0 }
                );
                return (
                  <a
                    key={group.section}
                    href={`#section-${group.section}`}
                    aria-current={activeSection === group.section ? "location" : undefined}
                    className={`shrink-0 px-3 py-2 border rounded-2xl hover:bg-gray-50 min-h-[44px] transition active:scale-[0.98] active:shadow-inner ${
                      activeSection === group.section ? "bg-slate-900 text-white border-slate-900" : "bg-white"
                    }`}
                  >
                    <div>
                      <div className="truncate leading-tight sm:leading-normal">
                        {sectionLabels[group.section] ?? sectionLabels.other}
                      </div>
                      {stats.due > 0 || stats.weak > 0 ? (
                        <div className="mt-0 leading-tight text-[9px] text-gray-400">
                          {stats.due > 0 ? <span className="text-gray-500">復{stats.due}</span> : null}
                          {stats.due > 0 && stats.weak > 0 ? <span className="mx-1 text-gray-300">/</span> : null}
                          {stats.weak > 0 ? <span className="text-gray-500">弱{stats.weak}</span> : null}
                        </div>
                      ) : null}
                    </div>
                  </a>
                );
              })}
            </div>
          ) : null}
          {showJump ? (
            <div className="mt-1 text-[10px] text-slate-400 sm:hidden">横にスクロールできます</div>
          ) : null}
          {filterLabel || query ? (
            <div className="mt-2 text-xs text-gray-500">
              {filterLabel ? <span>絞り込み: {filterLabel}</span> : null}
              {filterLabel && query ? <span className="mx-2 text-gray-300">/</span> : null}
              {query ? <span>検索: {query}</span> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4">
        {grouped.length === 0 ? (
          <p className="text-[11px] sm:text-sm text-gray-600">該当するトピックがありません。</p>
        ) : null}
        {listMode === "global" ? (
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/95 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.28)] ring-1 ring-slate-200/70">
            <div className="px-4 py-3 border-b bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">全体おすすめ</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>全{flatTopics.length}件</span>
                  <button
                    type="button"
                    onClick={() => setTopOnly((v) => !v)}
                    className="rounded-full border px-3 py-1 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner"
                  >
                    {topOnly ? "上位10件のみ" : "全件表示"}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 py-4">
              {viewMode === "cards" ? (
                <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {flatTopics.map((topic) => {
                    const s = mapByTopic.get(topic.id) ?? null;
                    const due = s ? isDue(s.due_at) : false;
                    const mastery = masteryLabel(s);
                    const topicHref = `/course/topics/${topic.id}?course=${courseId}&unit=${unit}`;
                    const templateCount = topic.templateCount;
                    const difficulty = topic.difficulty ?? 1;
                    const estimateMin = templateCount != null ? Math.max(5, Math.round(templateCount / 3)) : null;
                    const priorityLabelValue = priorityLabel(s);

                    return (
                      <div
                        key={topic.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => handleCardClick(topic.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(topic.id);
                          }
                        }}
                        className={`group relative border rounded-[22px] p-3 sm:p-5 bg-white/95 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                          due ? "ring-1 ring-blue-200 bg-blue-100/50" : "border-slate-200/80"
                        }`}
                      >
                        <div>
                          <Link href={topicHref} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            <MathMarkdown
                              content={topic.title}
                              className="prose prose-sm max-w-none font-semibold prose-p:my-0 text-[12px] sm:text-base leading-snug sm:leading-normal course-topic-title"
                            />
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-0.5 sm:gap-1 sm:max-w-[95%]">
                            {progressLoading && !s ? <Badge tone="gray">読込中</Badge> : null}
                            {due ? <Badge tone="blue">復習</Badge> : null}
                            {mastery === "weak" ? <Badge tone="red">弱</Badge> : null}
                            {mastery === "new" ? <Badge tone="yellow">未着手</Badge> : null}
                            {mastery === "normal" ? <Badge tone="gray"><span className="hidden sm:inline">普通</span><span className="sm:hidden">普</span></Badge> : null}
                            {mastery === "strong" ? <Badge tone="green"><span className="hidden sm:inline">強</span><span className="sm:hidden">強</span></Badge> : null}
                            {lockedSet.has(topic.id) ? <Badge tone="yellow">前提未達</Badge> : null}
                            <span className="inline-flex sm:hidden rounded-full border px-1.5 py-0.5 text-[9px] text-gray-500">
                              難 {"★".repeat(difficulty)}
                            </span>
                            <span
                              className={`hidden sm:inline-flex rounded-full border px-1.5 py-0.5 text-[9px] sm:text-[11px] ${priorityTone(s)}`}
                              title="優先度は、期限・未着手・弱点の重みづけで決まります"
                            >
                              優先度 {priorityLabelValue}
                            </span>
                          </div>
                          {showDescriptions ? (
                            <MathMarkdown
                              content={topic.description}
                              className="prose prose-sm max-w-none text-gray-700 mt-0.5 sm:mt-1 mb-0 prose-p:my-0 leading-snug course-topic-desc line-clamp-1 sm:line-clamp-2"
                            />
                          ) : null}
                        </div>

                        <div className="mt-2 hidden sm:flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                          <span className="rounded-full border px-2 py-0.5">
                            難 {"★".repeat(difficulty)}
                          </span>
                          {templateCount != null ? (
                            <span className="rounded-full border px-2 py-0.5">問題数 {templateCount}</span>
                          ) : null}
                          {estimateMin != null ? (
                            <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">
                              目安 {estimateMin}分
                            </span>
                          ) : null}
                          {lockedSet.has(topic.id) ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(prereqMap.get(topic.id) ?? []).slice(0, 2).map((pid) => {
                                const meta = metaByTopicId.get(pid as TopicId);
                                if (!meta) return null;
                                const href = `/course/topics/${pid}?course=${courseId}&unit=${meta.unit}`;
                                return (
                                  <Link
                                    key={pid}
                                    href={href}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 hover:bg-amber-100 transition"
                                  >
                                    前提: {meta.title}
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        {showMiniFlow ? (
                          <div className="mt-3">
                            <div className="relative rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-[10px] text-slate-600">
                            <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-sky-200 to-emerald-200/60" />
                            <div className="relative space-y-2 pl-4">
                              {(prereqMap.get(topic.id) ?? []).slice(0, 1).map((pid) => {
                                const meta = metaByTopicId.get(pid as TopicId);
                                if (!meta) return null;
                                return (
                                  <div key={pid} className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                                    <span className="truncate">前提: {meta.title}</span>
                                  </div>
                                );
                              })}
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    due
                                      ? "bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.2)]"
                                      : mastery === "weak"
                                      ? "bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.2)]"
                                      : mastery === "new"
                                      ? "bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.2)]"
                                      : "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.2)]"
                                  }`}
                                />
                                <span className="truncate">現在: {topic.title}</span>
                              </div>
                              {(nextMap.get(topic.id) ?? []).slice(0, 1).map((nid) => {
                                const meta = metaByTopicId.get(nid as TopicId);
                                if (!meta) return null;
                                return (
                                  <div key={nid} className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                    <span className="truncate">次へ: {meta.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        ) : null}

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                          {due ? (
                            <Link
                              href={`/course/practice/session?topic=${topic.id}&mode=review`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] sm:text-xs hover:bg-blue-700 text-center ring-1 ring-blue-300 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                            >
                              復習へ
                            </Link>
                          ) : null}
                          <Link
                            href={`/course/practice/session?topic=${topic.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs hover:bg-slate-800 text-center w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                          >
                            演習へ
                            {lockedSet.has(topic.id) ? (
                              <span className="ml-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-800">
                                前提あり
                              </span>
                            ) : null}
                          </Link>
                          {lockedSet.has(topic.id) ? (
                            <span className="sm:col-span-2 text-[10px] text-amber-700">
                              前提未達のため、先に前提トピックの確認がおすすめです。
                            </span>
                          ) : null}
                          <Link
                            href={topicHref}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2.5 rounded-full border border-slate-200 bg-white/90 text-[11px] sm:text-xs hover:bg-slate-50 hover:border-slate-300 text-center w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner sm:col-auto col-span-2"
                          >
                            解説へ
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-slate-200/70">
                  {flatTopics.map((topic) => {
                    const s = mapByTopic.get(topic.id) ?? null;
                    const due = s ? isDue(s.due_at) : false;
                    const mastery = masteryLabel(s);
                    const topicHref = `/course/topics/${topic.id}?course=${courseId}&unit=${unit}`;
                    const templateCount = topic.templateCount;
                    const difficulty = topic.difficulty ?? 1;
                    const estimateMin = templateCount != null ? Math.max(5, Math.round(templateCount / 3)) : null;
                    const priorityLabelValue = priorityLabel(s);

                    return (
                      <div
                        key={topic.id}
                        role="link"
                        tabIndex={0}
                        onClick={() => handleCardClick(topic.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(topic.id);
                          }
                        }}
                        className={`group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] active:shadow-inner sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-3 sm:shadow-none ${
                          due ? "ring-1 ring-blue-200 bg-blue-100/40" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <Link href={topicHref} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            <MathMarkdown
                              content={topic.title}
                              className="prose prose-sm max-w-none font-semibold prose-p:my-0 text-[12px] sm:text-base leading-snug sm:leading-normal course-topic-title"
                            />
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                            {progressLoading && !s ? <Badge tone="gray">読込中</Badge> : null}
                            {due ? <Badge tone="blue">復習</Badge> : null}
                            {mastery === "weak" ? <Badge tone="red">弱</Badge> : null}
                            {mastery === "new" ? <Badge tone="yellow">未着手</Badge> : null}
                            {mastery === "normal" ? <Badge tone="gray"><span className="hidden sm:inline">普通</span><span className="sm:hidden">普</span></Badge> : null}
                            {mastery === "strong" ? <Badge tone="green"><span className="hidden sm:inline">強</span><span className="sm:hidden">強</span></Badge> : null}
                            {lockedSet.has(topic.id) ? <Badge tone="yellow">前提未達</Badge> : null}
                            <span
                              className={`hidden sm:inline-flex rounded-full border px-1.5 py-0.5 text-[9px] sm:text-[11px] ${priorityTone(s)}`}
                              title="優先度は、期限・未着手・弱点の重みづけで決まります"
                            >
                              優先度 {priorityLabelValue}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                            <span className="rounded-full border px-2 py-0.5">
                              難 {"★".repeat(difficulty)}
                            </span>
                            {templateCount != null ? (
                              <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">問題数 {templateCount}</span>
                            ) : null}
                            {estimateMin != null ? (
                              <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">
                                目安 {estimateMin}分
                              </span>
                            ) : null}
                          </div>
                          {showDescriptions ? (
                            <MathMarkdown
                              content={topic.description}
                              className="prose prose-sm max-w-none text-gray-700 mt-0.5 sm:mt-1 mb-0 prose-p:my-0 leading-snug course-topic-desc line-clamp-1 sm:line-clamp-3"
                            />
                          ) : null}
                        </div>
                        <div className="grid gap-2 sm:mt-0 sm:flex sm:flex-wrap sm:gap-2 sm:shrink-0">
                          {due ? (
                            <Link
                              href={`/course/practice/session?topic=${topic.id}&mode=review`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-4 py-2.5 rounded-full bg-blue-600 text-white text-[11px] sm:text-xs hover:bg-blue-700 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                            >
                              復習
                            </Link>
                          ) : null}
                          <Link
                            href={`/course/practice/session?topic=${topic.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs hover:bg-slate-800 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                          >
                            演習
                            {lockedSet.has(topic.id) ? (
                              <span className="ml-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-800">
                                前提あり
                              </span>
                            ) : null}
                          </Link>
                          {lockedSet.has(topic.id) ? (
                            <span className="text-[10px] text-amber-700 sm:order-last">
                              前提未達のため、先に前提トピックの確認がおすすめです。
                            </span>
                          ) : null}
                          <Link
                            href={topicHref}
                            onClick={(e) => e.stopPropagation()}
                            className="px-4 py-2.5 rounded-full border border-slate-200 bg-white/90 text-[11px] sm:text-xs hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                          >
                            解説
                          </Link>
                          {lockedSet.has(topic.id) ? (
                            <div className="sm:hidden flex flex-wrap gap-1.5">
                              {(prereqMap.get(topic.id) ?? []).slice(0, 2).map((pid) => {
                                const meta = metaByTopicId.get(pid as TopicId);
                                if (!meta) return null;
                                const href = `/course/topics/${pid}?course=${courseId}&unit=${meta.unit}`;
                                return (
                                  <Link
                                    key={pid}
                                    href={href}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 hover:bg-amber-100 transition"
                                  >
                                    前提: {meta.title}
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
        {listMode === "section" ? grouped.map((group) => {
          const sectionName = sectionLabels[group.section] ?? sectionLabels.other;
          const unitLabel = UNIT_LABELS[unit];
          const expanded = expandedSections[group.section] ?? true;
          const sectionStats = group.topics.reduce(
            (acc, topic) => {
              const s = mapByTopic.get(topic.id) ?? null;
              const due = s ? isDue(s.due_at) : false;
              const mastery = masteryLabel(s);
              if (due) acc.due += 1;
              if (mastery === "new") acc.newly += 1;
              if (mastery === "weak") acc.weak += 1;
              return acc;
            },
            { due: 0, newly: 0, weak: 0 }
          );
          const hasStatus = sectionStats.due > 0 || sectionStats.weak > 0 || sectionStats.newly > 0;
          return (
            <div
              key={group.section}
              id={`section-${group.section}`}
              className={`rounded-[24px] border border-slate-200/80 bg-slate-50/95 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 scroll-mt-24 ${
                expanded ? "ring-2 ring-sky-200/80" : ""
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [group.section]: !expanded,
                  }))
                }
                aria-expanded={expanded}
                aria-controls={`section-panel-${group.section}`}
                className={`relative w-full px-4 sm:px-5 py-4 text-left sticky top-0 z-10 border-b backdrop-blur rounded-t-[24px] transition before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 before:rounded-l-[24px] ${
                  expanded
                    ? "bg-sky-50/80 before:bg-sky-400/80"
                    : "bg-white/90 hover:bg-slate-50 before:bg-slate-200/80"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] sm:text-lg font-semibold tracking-tight">{sectionName}</span>
                        <span className="text-[11px] text-gray-400">({unitLabel})</span>
                      </div>
                      {hasStatus ? (
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
                          {sectionStats.due > 0 ? <Badge tone="blue">復習 {sectionStats.due}</Badge> : null}
                          {sectionStats.weak > 0 ? <Badge tone="red">弱 {sectionStats.weak}</Badge> : null}
                          {sectionStats.newly > 0 ? <Badge tone="yellow">未着手 {sectionStats.newly}</Badge> : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 sm:text-[11px] sm:text-right">
                    <div>
                      {group.topics.length}{filter !== "all" ? "（絞込中）" : ""}
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold ${
                        expanded
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-white text-slate-500"
                      }`}
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition ${
                          expanded
                            ? "border-sky-200 bg-sky-100 text-sky-600 rotate-90"
                            : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        ›
                      </span>
                      {expanded ? "展開中" : "折り畳み"}
                    </span>
                  </div>
                </div>
              </button>
              {expanded ? (
                <div id={`section-panel-${group.section}`} className="px-4 sm:px-5 pb-6">
                  {viewMode === "cards" ? (
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {group.topics.map((topic) => {
                        const s = mapByTopic.get(topic.id) ?? null;
                        const due = s ? isDue(s.due_at) : false;
                        const mastery = masteryLabel(s);
                        const topicHref = `/course/topics/${topic.id}?course=${courseId}&unit=${unit}`;
                        const templateCount = topic.templateCount;
                        const difficulty = topic.difficulty ?? 1;
                        const estimateMin =
                          templateCount != null ? Math.max(5, Math.round(templateCount / 3)) : null;
                        const priorityLabelValue = priorityLabel(s);

                        return (
                          <div
                            key={topic.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => handleCardClick(topic.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleCardClick(topic.id);
                              }
                            }}
                            className={`group relative border rounded-[22px] p-3 sm:p-5 bg-white/95 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${
                              due ? "ring-1 ring-blue-200 bg-blue-100/50" : "border-slate-200/80"
                            }`}
                          >
                            <div>
                              <Link href={topicHref} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                            <MathMarkdown
                              content={topic.title}
                              className="prose prose-sm max-w-none font-semibold prose-p:my-0 text-[12px] sm:text-base leading-snug sm:leading-normal course-topic-title"
                            />
                              </Link>
                                <div className="mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                                  {progressLoading && !s ? <Badge tone="gray">読込中</Badge> : null}
                                  {due ? <Badge tone="blue">復習</Badge> : null}
                                  {mastery === "weak" ? <Badge tone="red">弱</Badge> : null}
                                  {mastery === "new" ? <Badge tone="yellow">未着手</Badge> : null}
                                  {mastery === "normal" ? <Badge tone="gray"><span className="hidden sm:inline">普通</span><span className="sm:hidden">普</span></Badge> : null}
                                  {mastery === "strong" ? <Badge tone="green"><span className="hidden sm:inline">強</span><span className="sm:hidden">強</span></Badge> : null}
                                  <span className="inline-flex sm:hidden rounded-full border px-1.5 py-0.5 text-[9px] text-gray-500">
                                    難 {"★".repeat(difficulty)}
                                  </span>
                                  <span
                                    className={`hidden sm:inline-flex rounded-full border px-1.5 py-0.5 text-[9px] sm:text-[11px] ${priorityTone(s)}`}
                                    title="優先度は、期限・未着手・弱点の重みづけで決まります"
                                  >
                                    優先度 {priorityLabelValue}
                                  </span>
                                </div>
                              {showDescriptions ? (
                                <MathMarkdown
                                  content={topic.description}
                                  className="prose prose-sm max-w-none text-gray-700 mt-0.5 sm:mt-1 mb-0 prose-p:my-0 leading-snug course-topic-desc line-clamp-1 sm:line-clamp-2"
                                />
                              ) : null}
                            </div>

                          <div className="mt-2 hidden sm:flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                            {templateCount != null ? (
                              <span className="rounded-full border px-2 py-0.5">問題数 {templateCount}</span>
                            ) : null}
                            <span className="rounded-full border px-2 py-0.5">
                              難易度 {"★".repeat(difficulty)}
                            </span>
                            {estimateMin != null ? (
                              <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">
                                目安 {estimateMin}分
                              </span>
                            ) : null}
                          </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                          {due ? (
                          <Link
                            href={`/course/practice/session?topic=${topic.id}&mode=review`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs hover:bg-blue-700 text-center ring-1 ring-blue-300 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                          >
                            復習へ
                          </Link>
                          ) : null}
                          <Link
                            href={`/course/practice/session?topic=${topic.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2 rounded-full bg-slate-900 text-white text-[10px] sm:text-xs hover:bg-slate-800 text-center w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                          >
                            演習へ
                          </Link>
                          <Link
                            href={topicHref}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2 rounded-full border border-slate-200 bg-white/90 text-[10px] sm:text-xs hover:bg-slate-50 hover:border-slate-300 text-center w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner sm:col-auto col-span-2"
                          >
                            詳細
                          </Link>
                        </div>

                            <details className="mt-3 border-t pt-2 text-xs text-gray-600 hidden sm:block">
                              <summary className="cursor-pointer select-none text-gray-500">メタ情報</summary>
                              <div className="mt-2 space-y-1">
                                {topic.viewCode ? <div>viewCode: {topic.viewCode}</div> : null}
                                {topic.firstSkillTitle ? <div>最初のスキル: {topic.firstSkillTitle}</div> : null}
                                {s ? (
                                  <div className="grid gap-1 sm:grid-cols-2">
                                    <div>間隔: {s.interval_days}日</div>
                                    <div>reps: {s.reps}</div>
                                    <div>lapses: {s.lapses}</div>
                                    <div>EF: {Number(s.ef).toFixed(2)}</div>
                                  </div>
                                ) : (
                                  <div>まだ学習履歴がありません</div>
                                )}
                              </div>
                            </details>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-slate-200/70">
                      {group.topics.map((topic) => {
                        const s = mapByTopic.get(topic.id) ?? null;
                        const due = s ? isDue(s.due_at) : false;
                        const mastery = masteryLabel(s);
                        const topicHref = `/course/topics/${topic.id}?course=${courseId}&unit=${unit}`;
                        const templateCount = topic.templateCount;
                        const difficulty = topic.difficulty ?? 1;
                        const estimateMin =
                          templateCount != null ? Math.max(5, Math.round(templateCount / 3)) : null;

                        return (
                          <div
                            key={topic.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => handleCardClick(topic.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleCardClick(topic.id);
                              }
                            }}
                            className={`group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] active:shadow-inner sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-3 sm:shadow-none ${
                              due ? "ring-1 ring-blue-200 bg-blue-100/40" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <Link href={topicHref} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                              <MathMarkdown
                                content={topic.title}
                                className="prose prose-sm max-w-none font-semibold prose-p:my-0 text-[13px] sm:text-base leading-snug sm:leading-normal course-topic-title"
                              />
                              </Link>
                                <div className="mt-1 flex flex-wrap gap-0.5 sm:gap-1">
                                  {progressLoading && !s ? <Badge tone="gray">読込中</Badge> : null}
                                  {due ? <Badge tone="blue">復習</Badge> : null}
                                  {mastery === "weak" ? <Badge tone="red">弱</Badge> : null}
                                  {mastery === "new" ? <Badge tone="yellow">未着手</Badge> : null}
                                  {mastery === "normal" ? <Badge tone="gray"><span className="hidden sm:inline">普通</span><span className="sm:hidden">普</span></Badge> : null}
                                  {mastery === "strong" ? <Badge tone="green"><span className="hidden sm:inline">強</span><span className="sm:hidden">強</span></Badge> : null}
                                </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-500">
                                {templateCount != null ? (
                                  <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">問題数 {templateCount}</span>
                                ) : null}
                                <span className="rounded-full border px-2 py-0.5">
                                  難易度 {"★".repeat(difficulty)}
                                </span>
                                {estimateMin != null ? (
                                  <span className="hidden sm:inline-flex rounded-full border px-2 py-0.5">
                                    目安 {estimateMin}分
                                  </span>
                                ) : null}
                              </div>
                              {showDescriptions ? (
                                <MathMarkdown
                                  content={topic.description}
                                  className="prose prose-sm max-w-none text-gray-700 mt-0.5 sm:mt-1 mb-0 prose-p:my-0 leading-snug course-topic-desc line-clamp-1 sm:line-clamp-2"
                                />
                              ) : null}
                            </div>
                            <div className="grid gap-2 sm:mt-0 sm:flex sm:flex-wrap sm:gap-2 sm:shrink-0">
                              {due ? (
                                <Link
                                  href={`/course/practice/session?topic=${topic.id}&mode=review`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-2 rounded-full bg-blue-600 text-white text-[10px] sm:text-xs hover:bg-blue-700 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                                >
                                  復習
                                </Link>
                              ) : null}
                              <Link
                                href={`/course/practice/session?topic=${topic.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-2 rounded-full bg-slate-900 text-white text-[10px] sm:text-xs hover:bg-slate-800 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                              >
                                演習
                              </Link>
                              <Link
                                href={topicHref}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-2 rounded-full border border-slate-200 bg-white/90 text-[10px] sm:text-xs hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto transition active:scale-[0.97] active:shadow-inner"
                              >
                                解説
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        }) : null}
      </div>
    </div>
  );
}
