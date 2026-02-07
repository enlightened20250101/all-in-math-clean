"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/course/topics";
import type { UnitId } from "@/lib/course/topics";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";
import { loadCourseSettingsExtra, type CourseSettingsExtra } from "@/lib/course/settingsStorage";
import { getCourseElectiveOptions, isTopicIncludedByElectives, normalizeElectiveSelection } from "@/lib/course/electives";
import { useCourseIndex } from "@/lib/course/useCourseIndex";

type CatalogTopic = {
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

type TargetType =
  | "定期テスト"
  | "共通テスト"
  | "難関大"
  | "大学別"
  | "資格/検定"
  | "その他"
  | undefined;

type ProgressResponse = {
  ok: boolean;
  items: SrsRow[];
};

type GraphEdge = { from: string; to: string };
type GraphResponse = { ok: boolean; graph: { version: number; edges: GraphEdge[] } };

function masteryRank(s: SrsRow | null): number {
  // 小さいほど優先（未着手 → weak → normal → strong）
  if (!s) return 0;          // 未着手
  if (s.reps <= 0) return 1; // weak
  if (s.lapses >= 3) return 1;
  if (s.interval_days >= 14 && s.reps >= 3) return 3; // strong
  return 2; // normal
}

function rankByTargetType(rank: number, topic: CatalogTopic, targetType?: TargetType): number {
  if (!targetType) return rank;
  if (rank <= 1) return rank;
  const title = topic.title;
  if (targetType === "定期テスト") {
    if (title.includes("基本") || title.includes("入門")) return rank - 0.3;
  }
  if (targetType === "共通テスト") {
    if (title.includes("基本") || title.includes("標準")) return rank - 0.2;
  }
  if (targetType === "難関大" || targetType === "大学別") {
    if (title.includes("応用") || title.includes("発展") || title.includes("総合")) return rank - 0.2;
  }
  if (targetType === "資格/検定") {
    if (title.includes("基本")) return rank - 0.2;
  }
  return rank;
}

function loadExtra(): CourseSettingsExtra {
  return loadCourseSettingsExtra();
}

export default function RecommendedNextClient({
  courseId = "hs_ia",
  goal = 65,
}: {
  courseId?: string;
  goal?: number;
}) {
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<CatalogTopic[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [progress, setProgress] = useState<SrsRow[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [targetType, setTargetType] = useState<TargetType>(undefined);
  const [extra, setExtra] = useState<CourseSettingsExtra>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastLoadRef = useRef(0);
  const dataReadyRef = useRef(false);
  const fetchOptions = useMemo(() => ({ cooldownMs: 8000 }), []);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const MIN_RELOAD_MS = 10_000;

  const load = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadRef.current < MIN_RELOAD_MS) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    lastLoadRef.current = now;
    const shouldShowLoading = !dataReadyRef.current;
    setLoading(shouldShowLoading);
    if (shouldShowLoading) {
      setError(null);
      setNotice(null);
    }
    try {
      const [cRes, pRes, prRes] = await Promise.allSettled([
        cachedFetchJson(
          `course_catalog:${courseId}`,
          5 * 60_000,
          async () => {
            const res = await fetch(`/api/course/catalog?courseId=${encodeURIComponent(courseId)}`, {
              cache: "no-store",
            });
            const data: CatalogResponse = await res.json();
            if (!res.ok || !data.ok) throw new Error("catalog error");
            return data;
          },
          fetchOptions
        ),
        cachedFetchJson(
          `course_plan:${courseId}:${goal}`,
          60_000,
          async () => {
            const res = await fetch(`/api/course/plan?courseId=${encodeURIComponent(courseId)}&goal=${goal}`, {
              cache: "no-store",
            });
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
        const units = courseMap.get(courseId)?.units ?? [];
        const fallback = TOPICS.filter((t) => units.includes(t.unit)).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
        }));
        if (fallback.length) {
          setCatalog((prev) => (prev.length ? prev : fallback));
          setNotice("カタログ取得に失敗したため、既定の一覧から表示しています");
          dataReadyRef.current = true;
        } else {
          setCatalog((prev) => prev);
          setError("おすすめの取得に失敗しました");
        }
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
        setError("おすすめの取得に失敗しました");
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [courseId, goal, fetchOptions, courseMap]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const next = loadExtra();
    setExtra(next);
    setTargetType((next.targetType as TargetType) ?? undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (event: StorageEvent) => {
      if (event.key === "course_settings_extra_v1" || event.key === "course_settings_updated_at") {
        const next = loadExtra();
        setExtra(next);
        setTargetType((next.targetType as TargetType) ?? undefined);
      }
    };
    window.addEventListener("storage", onStorage);
    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("course-settings");
      bc.onmessage = () => {
        const next = loadExtra();
        setExtra(next);
        setTargetType((next.targetType as TargetType) ?? undefined);
      };
    }
    return () => {
      window.removeEventListener("storage", onStorage);
      if (bc) bc.close();
    };
  }, []);

  const progressMap = useMemo(() => {
    const m = new Map<string, SrsRow>();
    progress.forEach((r) => m.set(r.topic_id, r));
    return m;
  }, [progress]);

  const prereqMap = useMemo(() => {
    const m = new Map<string, string[]>();
    edges.forEach((edge) => {
      const list = m.get(edge.to) ?? [];
      if (!list.includes(edge.from)) list.push(edge.from);
      m.set(edge.to, list);
    });
    return m;
  }, [edges]);

  const topicMap = useMemo(() => {
    const m = new Map<string, CatalogTopic>();
    catalog.forEach((t) => m.set(t.id, t));
    return m;
  }, [catalog]);

  const topicUnitMap = useMemo(() => {
    return new Map<string, string>(TOPICS.map((t) => [t.id, t.unit]));
  }, []);

  const electiveCourseId = courseMap.get(courseId)?.baseCourseId ?? courseId;
  const electiveOptions = useMemo(() => getCourseElectiveOptions(electiveCourseId), [electiveCourseId]);
  const electiveSelection = useMemo(
    () => normalizeElectiveSelection(electiveCourseId, extra.electives?.[courseId]),
    [electiveCourseId, courseId, extra.electives]
  );

  const recommended = useMemo(() => {
    const baseOrder = order.length ? order : catalog.map((t) => t.id);
    const filteredOrder = electiveOptions.length
      ? baseOrder.filter((id) =>
          isTopicIncludedByElectives(electiveCourseId, TOPICS.find((t) => t.id === id), electiveSelection)
        )
      : baseOrder;
    const safeOrder = filteredOrder.length ? filteredOrder : baseOrder;
    const candidates = safeOrder
      .map((id) => ({ id, topic: topicMap.get(id) ?? null, s: progressMap.get(id) ?? null }))
      .filter((x) => x.topic);

    candidates.sort((a, b) => {
      const prereqPenaltyA = (prereqMap.get(a.id) ?? []).some(
        (pid) => masteryRank(progressMap.get(pid) ?? null) <= 1
      )
        ? 1
        : 0;
      const prereqPenaltyB = (prereqMap.get(b.id) ?? []).some(
        (pid) => masteryRank(progressMap.get(pid) ?? null) <= 1
      )
        ? 1
        : 0;
      const ra = rankByTargetType(masteryRank(a.s) + prereqPenaltyA, a.topic!, targetType);
      const rb = rankByTargetType(masteryRank(b.s) + prereqPenaltyB, b.topic!, targetType);
      if (ra !== rb) return ra - rb;
      return safeOrder.indexOf(a.id) - safeOrder.indexOf(b.id);
    });

    return candidates[0] ?? null;
  }, [
    order,
    catalog,
    topicMap,
    progressMap,
    targetType,
    prereqMap,
    electiveOptions.length,
    courseId,
    electiveSelection,
    electiveCourseId,
  ]);

  const recommendedHref = useMemo(() => {
    if (!recommended) return "";
    const unit = topicUnitMap.get(recommended.id);
    const params = new URLSearchParams();
    if (courseId) params.set("course", courseId);
    if (unit) params.set("unit", unit);
    return `/course/topics/${recommended.id}?${params.toString()}`;
  }, [recommended, topicUnitMap, courseId]);

  return (
    <div className="border rounded-[28px] p-4 sm:p-6 bg-white/95 shadow-sm ring-1 ring-sky-200/80 space-y-3">
      <div className="flex items-center gap-2 font-semibold text-[15px] sm:text-base">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
          NX
        </span>
        今日のおすすめ（新規学習）
      </div>
      {targetType ? (
        <div className="text-[10px] sm:text-xs text-slate-500">
          目標タイプ: {targetType} に合わせて優先度を微調整中
        </div>
      ) : null}

      {loading ? (
        <p className="text-[10px] sm:text-sm text-gray-600">読み込み中...</p>
      ) : error ? (
        <div className="rounded-[18px] border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[10px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          <div className="flex flex-wrap items-center gap-2">
            <span>{error}</span>
            <button
              type="button"
              onClick={load}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] text-amber-700 hover:bg-amber-100 transition active:scale-[0.98] active:shadow-inner"
            >
              再試行
            </button>
          </div>
          {lastUpdated ? (
            <div className="mt-1 text-[10px] text-amber-700/80">
              最終更新: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          ) : null}
        </div>
      ) : recommended ? (
        <>
          <div className="text-[10px] sm:text-sm text-gray-800">
            <span className="font-semibold">{recommended.topic!.title}</span>
          </div>
          <div className="text-[10px] sm:text-sm text-gray-600">{recommended.topic!.description}</div>

          <div className="grid gap-2 sm:flex sm:gap-2 pt-3">
            <Link
              href={recommendedHref || `/course/topics/${recommended.id}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[11px] sm:text-sm text-center w-full sm:w-auto hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
                TL
              </span>
              解説へ
            </Link>
            <Link
              href={`/course/practice/session?topic=${recommended.id}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-[11px] sm:text-sm text-center w-full sm:w-auto text-white hover:bg-blue-700 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                PR
              </span>
              演習へ
            </Link>
          </div>
        </>
      ) : (
        <p className="text-[10px] sm:text-sm text-gray-600">おすすめがありません（plan設定を確認）</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[10px] sm:text-xs text-gray-500 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>※ goal={goal} のプランを優先。取得できない場合はカタログ順で表示します</span>
          {lastUpdated ? (
            <span className="rounded-full border bg-white px-2 py-0.5">
              更新: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          ) : null}
          {notice ? <span className="text-amber-600">{notice}</span> : null}
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] sm:text-xs hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
}
