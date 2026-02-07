import { promises as fs } from "fs";
import path from "path";

export type CoursePlan = {
  courseId: string;
  goal: number;
  topicOrder: string[];
};

export async function loadCoursePlan(courseId: string, goal: number): Promise<CoursePlan> {
  const p = path.join(process.cwd(), "data/course/plans", `${courseId}_${goal}.json`);
  const raw = await fs.readFile(p, "utf8");
  const json = JSON.parse(raw);

  if (!json?.courseId || !json?.goal || !Array.isArray(json?.topicOrder)) {
    throw new Error("Invalid plan schema");
  }
  return {
    courseId: json.courseId,
    goal: Number(json.goal),
    topicOrder: json.topicOrder.map(String),
  };
}
