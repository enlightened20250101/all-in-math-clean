import type { Topic } from "./topics";

export type ElectiveOption = {
  id: string;
  label: string;
  sections: string[];
};

const COURSE_ELECTIVES: Record<string, ElectiveOption[]> = {
  ct_iib: [
    { id: "sequence", label: "数列", sections: ["sequence"] },
    { id: "statistics", label: "統計", sections: ["statistics"] },
  ],
  ct_iib_sequence: [{ id: "sequence", label: "数列", sections: ["sequence"] }],
  ct_iib_statistics: [{ id: "statistics", label: "統計", sections: ["statistics"] }],
};

export function getCourseElectiveOptions(courseId?: string | null): ElectiveOption[] {
  if (!courseId) return [];
  return COURSE_ELECTIVES[courseId] ?? [];
}

export function normalizeElectiveSelection(courseId: string | null | undefined, selected?: string[]): string[] {
  const options = getCourseElectiveOptions(courseId);
  if (!options.length) return [];
  const valid = (selected ?? []).filter((id) => options.some((opt) => opt.id === id));
  return valid.length ? valid : options.map((opt) => opt.id);
}

export function isTopicIncludedByElectives(
  courseId: string | null | undefined,
  topic: Topic | undefined,
  selected?: string[]
): boolean {
  const options = getCourseElectiveOptions(courseId);
  if (!options.length) return true;
  if (!topic?.section) return true;
  const allSections = new Set(options.flatMap((opt) => opt.sections));
  if (!allSections.has(topic.section)) return true;
  const activeIds = normalizeElectiveSelection(courseId, selected);
  const activeSections = new Set(
    options.filter((opt) => activeIds.includes(opt.id)).flatMap((opt) => opt.sections)
  );
  return activeSections.has(topic.section);
}
