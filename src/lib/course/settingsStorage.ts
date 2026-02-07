export type CourseSettingsExtra = {
  targetType?: string;
  targetName?: string;
  targetDate?: string;
  weeklyHours?: number;
  note?: string;
  electives?: Record<string, string[]>;
  level?: number;
};

const STORAGE_KEY = "course_settings_extra_v1";

export function loadCourseSettingsExtra(): CourseSettingsExtra {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return {
      targetType: typeof parsed.targetType === "string" ? parsed.targetType : undefined,
      targetName: typeof parsed.targetName === "string" ? parsed.targetName : undefined,
      targetDate: typeof parsed.targetDate === "string" ? parsed.targetDate : undefined,
      weeklyHours: Number.isFinite(parsed.weeklyHours) ? Number(parsed.weeklyHours) : undefined,
      note: typeof parsed.note === "string" ? parsed.note : undefined,
      electives: typeof parsed.electives === "object" && parsed.electives ? parsed.electives : undefined,
      level: Number.isFinite(parsed.level) ? Number(parsed.level) : undefined,
    };
  } catch {
    return {};
  }
}

export function saveCourseSettingsExtra(extra: CourseSettingsExtra) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        targetType: extra.targetType ?? "",
        targetName: extra.targetName ?? "",
        targetDate: extra.targetDate ?? "",
        weeklyHours: extra.weeklyHours ?? "",
        note: extra.note ?? "",
        electives: extra.electives ?? {},
        level: extra.level ?? "",
      })
    );
  } catch {
    // noop
  }
}
