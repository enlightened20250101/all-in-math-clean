// src/lib/course/templates/math2/coord_region_basic.ts
import type { QuestionTemplate } from "../../types";

type RegionCase = {
  id: string;
  title: string;
  inequalities: string[];
  point: [number, number];
  inside: boolean;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: RegionCase): QuestionTemplate {
  const choices = ["含まれる", "含まれない"];
  const correct = c.inside ? "含まれる" : "含まれない";
  const cond = c.inequalities.map((s) => `$${s}$`).join(", ");
  return {
    meta: {
      id: c.id,
      topicId: "coord_region_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `避難区域を次の不等式で表す。点 $(${c.point[0]},${c.point[1]})$ は区域に含まれるか。\\n\\n条件: ${cond}`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n各不等式に点を代入して判定します。答えは **${correct}** です。`;
    },
  };
}

const CASES: RegionCase[] = [
  { id: "region_1", title: "領域 1", inequalities: ["x+y\\le 4", "x\\ge 0", "y\\ge 0"], point: [2, 1], inside: true, difficulty: 1 },
  { id: "region_2", title: "領域 2", inequalities: ["x+y\\le 4", "x\\ge 0", "y\\ge 0"], point: [3, 2], inside: false, difficulty: 1 },
  { id: "region_3", title: "領域 3", inequalities: ["x\\ge -1", "x\\le 2", "y\\ge 1"], point: [0, 1], inside: true, difficulty: 1 },
  { id: "region_4", title: "領域 4", inequalities: ["x\\ge -1", "x\\le 2", "y\\ge 1"], point: [3, 2], inside: false, difficulty: 1 },
  { id: "region_5", title: "領域 5", inequalities: ["2x+y\\le 6", "y\\ge 0"], point: [2, 2], inside: true, difficulty: 1 },
  { id: "region_6", title: "領域 6", inequalities: ["2x+y\\le 6", "y\\ge 0"], point: [3, 1], inside: false, difficulty: 1 },
  { id: "region_7", title: "領域 7", inequalities: ["x-2y\\le 2", "x\\ge 0", "y\\ge 0"], point: [2, 1], inside: true, difficulty: 2 },
  { id: "region_8", title: "領域 8", inequalities: ["x-2y\\le 2", "x\\ge 0", "y\\ge 0"], point: [4, 2], inside: false, difficulty: 2 },
  { id: "region_9", title: "領域 9", inequalities: ["x+y\\ge 1", "x\\le 3", "y\\le 2"], point: [2, 1], inside: true, difficulty: 2 },
  { id: "region_10", title: "領域 10", inequalities: ["x+y\\ge 1", "x\\le 3", "y\\le 2"], point: [0, 0], inside: false, difficulty: 3 },
];

export const coordRegionTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
