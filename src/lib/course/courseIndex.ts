// src/lib/course/courseIndex.ts
import type { UnitId } from "./topics";

export type CourseIndexItem = {
  courseId: string;
  title: string;
  units: UnitId[];
  baseCourseId?: string;
  section?: string;
};

export const FALLBACK_COURSES: CourseIndexItem[] = [
  { courseId: "hs_ia", title: "高校数学IA", units: ["math1", "mathA"] },
  { courseId: "hs_iib", title: "高校数学IIB", units: ["math2", "mathB"] },
  { courseId: "ct_iib", title: "共通テストII/B", units: ["math2", "mathB"] },
  { courseId: "ct_iib_sequence", title: "共通テストII/B（数列）", units: ["mathB"], baseCourseId: "ct_iib", section: "sequence" },
  { courseId: "ct_iib_statistics", title: "共通テストII/B（統計）", units: ["mathB"], baseCourseId: "ct_iib", section: "statistics" },
  { courseId: "hs_iic", title: "高校数学C", units: ["mathC"] },
  { courseId: "hs_iii", title: "高校数学III", units: ["math3"] },
];

export type CourseIndexResponse = { courses: CourseIndexItem[] };

export async function fetchCourseIndex(): Promise<CourseIndexItem[]> {
  try {
    const res = await fetch("/api/course/index", { cache: "no-store" });
    if (!res.ok) return FALLBACK_COURSES;
    const data = (await res.json()) as CourseIndexResponse;
    if (!data?.courses?.length) return FALLBACK_COURSES;
    return data.courses;
  } catch {
    return FALLBACK_COURSES;
  }
}
