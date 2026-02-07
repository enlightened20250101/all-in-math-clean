import { promises as fs } from "fs";
import path from "path";
import { loadCurriculumGraph, loadCurriculumViews } from "@/server/curriculum";
import { TOPICS } from "@/lib/course/topics";
import type { UnitId } from "@/lib/course/topics";
import { getTemplatesByTopic } from "@/lib/course/templateRegistry";

type CourseCatalogConfig = {
  courseId: string;
  title: string;
  topics: Array<{
    id: string;        // 既存topicId（SRSで使ってる）
    title: string;
    description: string;
    viewCode: string;  // curriculum view_code
  }>;
};

export type CourseTopic = {
  id: string;
  title: string;
  description: string;
  viewCode: string;
  skills: string[];
  firstSkillTitle?: string;
  templateCount?: number;
  difficulty?: number;
};

export type CourseCatalog = {
  courseId: string;
  title: string;
  topics: CourseTopic[];
};

export async function loadCourseCatalog(courseId = "hs_ia"): Promise<CourseCatalog> {
  let cfg: CourseCatalogConfig | null = null;
  try {
    const cfgPath = path.join(process.cwd(), "data/course/catalogs", `${courseId}.json`);
    cfg = JSON.parse(await fs.readFile(cfgPath, "utf8"));
  } catch {
    cfg = null;
  }

  const graph = await loadCurriculumGraph();
  const views = await loadCurriculumViews();

  const fallbackUnits: Record<string, UnitId[]> = {
    hs_ia: ["math1", "mathA"],
    hs_iib: ["math2", "mathB"],
    ct_iib: ["math2", "mathB"],
    ct_iib_sequence: ["mathB"],
    ct_iib_statistics: ["mathB"],
    hs_iic: ["mathC"],
    hs_iii: ["math3"],
  };

  const baseTopics = cfg?.topics ?? TOPICS
    .filter((t) => (fallbackUnits[courseId] ?? ["math1", "mathA"]).includes(t.unit as UnitId))
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      viewCode: "",
    }));

  const topics: CourseTopic[] = baseTopics.map((t) => {
    const v = views[t.viewCode];
    const skills = v?.items?.map((it) => it.skill_id) ?? [];
    const firstSkillTitle =
      skills.length > 0 ? (graph.titles[skills[0]] ?? skills[0]) : undefined;
    const templates = getTemplatesByTopic(t.id as any) ?? [];
    const templateCount = templates.length;
    const difficulty =
      templateCount > 0
        ? Math.max(
            1,
            Math.min(
              3,
              Math.round(templates.reduce((acc, cur) => acc + (cur.meta?.difficulty ?? 1), 0) / templateCount)
            )
          )
        : 1;

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      viewCode: t.viewCode,
      skills,
      firstSkillTitle,
      templateCount,
      difficulty,
    };
  });

  return {
    courseId: cfg?.courseId ?? courseId,
    title: cfg?.title ?? courseId,
    topics,
  };
}
