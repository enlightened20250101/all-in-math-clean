"use client";

import { useCallback, useEffect, useState } from "react";
import RecommendedNextClient from "./RecommendedNextClient";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";

type Settings = {
  courseId: string;
  goal: number;
};

export default function RecommendedNextWithSettingsClient({
  defaultCourseId = "hs_ia",
  defaultGoal = 65,
}: {
  defaultCourseId?: string;
  defaultGoal?: number;
}) {
  const [settings, setSettings] = useState<Settings>({
    courseId: defaultCourseId,
    goal: defaultGoal,
  });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
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
      if (data?.ok && data?.settings) {
        const next = {
          courseId: data.settings.courseId ?? defaultCourseId,
          goal: data.settings.goal ?? defaultGoal,
        };
        setSettings((prev) =>
          prev.courseId === next.courseId && prev.goal === next.goal ? prev : next
        );
      }
    } catch (e) {
      console.error(e);
      // 失敗してもデフォルトで継続
    } finally {
      setLoading(false);
    }
  }, [defaultCourseId, defaultGoal]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500">
        <a
          href="/course/settings"
          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 hover:bg-slate-100 transition"
        >
          今日の目標: {settings.goal} 点
        </a>
        {loading ? <span>設定読込中...</span> : null}
      </div>
      <RecommendedNextClient courseId={settings.courseId} goal={settings.goal} />
    </div>
  );
}
