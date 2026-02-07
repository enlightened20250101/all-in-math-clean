// src/lib/course/useCourseIndex.ts
"use client";

import { useEffect, useState } from "react";
import { fetchCourseIndex, type CourseIndexItem, FALLBACK_COURSES } from "./courseIndex";

export function useCourseIndex() {
  const [courses, setCourses] = useState<CourseIndexItem[]>(FALLBACK_COURSES);

  useEffect(() => {
    let alive = true;
    fetchCourseIndex().then((items) => {
      if (!alive || !items?.length) return;
      setCourses(items);
    });
    return () => {
      alive = false;
    };
  }, []);

  return courses;
}
