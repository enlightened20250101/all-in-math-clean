"use client";

import { useEffect, useState } from "react";
import type { UserCourse } from "@/lib/course/userCourses";

type UserCoursesResponse = {
  ok: boolean;
  courses?: UserCourse[];
  error?: string;
};

export function useUserCourses() {
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/course/user-courses", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as UserCoursesResponse | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error ?? "failed to load user courses");
      }
      setCourses(Array.isArray(data.courses) ? data.courses : []);
    } catch (e) {
      const message = e instanceof Error ? e.message : "load error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { courses, loading, error, reload: load };
}
