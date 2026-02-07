"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";
import { useCourseIndex } from "@/lib/course/useCourseIndex";

type Settings = {
  courseId: string;
};

export default function CourseHomeLinksClient() {
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [courseId, setCourseId] = useState<Settings["courseId"]>("hs_ia");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
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
        if (ignore) return;
        setCourseId((prev) => (prev === data.settings.courseId ? prev : data.settings.courseId));
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const topicsHref = useMemo(() => {
    const unit = courseMap.get(courseId)?.units?.[0] ?? "math1";
    const params = new URLSearchParams({ course: courseId, unit });
    return `/course/topics?${params.toString()}`;
  }, [courseId, courseMap]);

  return (
    <div className="space-y-4">
      <Link
        href={topicsHref}
        className="group border rounded-[28px] p-4 sm:p-6 bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-0.5 transition block active:scale-[0.99] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-slate-50 text-[10px] tracking-wider text-slate-500">
              TP
            </span>
            <div>
              <div className="font-semibold text-[15px] sm:text-base">トピック一覧</div>
              <div className="text-[10px] sm:text-sm text-gray-600 mt-2">
                解説＋演習をまとめて進めるコース画面へ
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-flex rounded-full border px-3 py-1 text-xs text-gray-600">
            {courseMap.get(courseId)?.title ?? courseId}
          </span>
        </div>
        <div className="text-[10px] sm:text-sm text-gray-500 mt-2 sm:hidden">
          現在のコース: {courseMap.get(courseId)?.title ?? courseId}
        </div>
      </Link>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        {courseIndex.map((course) => {
          const id = course.courseId;
          const unit = course.units?.[0] ?? "math1";
          return (
            <Link
              key={id}
              href={`/course/topics?course=${id}&unit=${unit}`}
              className="inline-flex w-full items-center justify-center gap-2 px-3 py-2 rounded-full border text-[10px] sm:text-sm bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 sm:w-auto"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg border bg-slate-50 text-[9px] tracking-wider text-slate-500">
                {course.title.slice(0, 2)}
              </span>
              {course.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
