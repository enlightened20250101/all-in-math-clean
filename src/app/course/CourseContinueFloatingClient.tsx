"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/course/topics";
import { useCourseIndex } from "@/lib/course/useCourseIndex";
import { useUserCourses } from "@/lib/course/useUserCourses";

type LastTopic = {
  topicId: string;
  updatedAt: string;
  courseId?: string;
};

export default function CourseContinueFloatingClient() {
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const { courses: userCourses, loading: userCoursesLoading } = useUserCourses();
  const [lastTopic, setLastTopic] = useState<LastTopic | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("course_last_topic");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastTopic;
      if (parsed?.topicId) setLastTopic(parsed);
    } catch {
      setLastTopic(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readCurrent = () => {
      try {
        const raw = window.localStorage.getItem("course_roadmap_current");
        if (!raw) return;
        const parsed = JSON.parse(raw) as { courseId?: string } | null;
        if (parsed?.courseId) setCurrentCourseId(parsed.courseId);
      } catch {
        // ignore
      }
    };
    readCurrent();
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "course_roadmap_current") return;
      readCurrent();
    };
    const onCustom = () => readCurrent();
    window.addEventListener("storage", onStorage);
    window.addEventListener("course-roadmap-change", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("course-roadmap-change", onCustom as EventListener);
    };
  }, []);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const topic = useMemo(() => {
    const activeCourseId = currentCourseId ?? lastTopic?.courseId ?? null;
    const allowedUnits = activeCourseId ? courseMap.get(activeCourseId)?.units ?? [] : [];
    const last = lastTopic?.topicId ? TOPICS.find((t) => t.id === lastTopic.topicId) ?? null : null;
    if (last && (!activeCourseId || allowedUnits.includes(last.unit))) return last;
    if (activeCourseId && allowedUnits.length) {
      return TOPICS.find((t) => allowedUnits.includes(t.unit)) ?? null;
    }
    return last;
  }, [currentCourseId, lastTopic, courseMap]);

  const resumeLabel = useMemo(() => {
    if (!lastTopic?.updatedAt) return "";
    if (now == null) return "";
    const lastTime = new Date(lastTopic.updatedAt).getTime();
    if (!Number.isFinite(lastTime)) return "";
    const diffHours = Math.floor((now - lastTime) / (1000 * 60 * 60));
    return diffHours <= 24 ? "復習" : "学習";
  }, [lastTopic, now]);

  if (!userCoursesLoading && userCourses.length === 0) {
    return (
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
        <Link
          href="/course/settings?mode=create"
          className="group inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 py-3 text-[12px] sm:text-sm font-semibold text-slate-700 shadow-lg shadow-slate-200/40 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[10px] tracking-wider text-slate-600">
            NEW
          </span>
          <span className="flex flex-col leading-tight">
            <span>コースを作成する</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">学習プランを設定</span>
          </span>
        </Link>
      </div>
    );
  }

  if (!topic) return null;

  const activeCourseId = currentCourseId ?? lastTopic?.courseId ?? null;
  const courseLabel = activeCourseId ? courseMap.get(activeCourseId)?.title ?? null : null;
  const href =
    resumeLabel === "復習"
      ? `/course/practice/session?topic=${topic.id}`
      : `/course/topics/${topic.id}?unit=${topic.unit}`;

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40">
      <Link
        href={href}
        className="group inline-flex items-center gap-3 rounded-full border border-blue-300/70 bg-blue-600 px-4 py-3 text-[12px] sm:text-sm font-semibold text-white shadow-lg shadow-blue-200/40 hover:bg-blue-700 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        title={topic.title}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200/60 bg-white/90 text-[10px] tracking-wider text-blue-700">
          GO
        </span>
        <span className="flex flex-col leading-tight">
          <span>続きを学習する</span>
          <span className="text-[10px] sm:text-[11px] text-blue-100">
            {resumeLabel}・{topic.title}
            {courseLabel ? `（${courseLabel}）` : ""}
          </span>
        </span>
      </Link>
    </div>
  );
}
