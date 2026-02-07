// src/lib/course/templates/math2/coord_region_variant_basic.ts
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
        statement: `次の不等式で表される領域に、点 $(${c.point[0]},${c.point[1]})$ は含まれるか。\\n\\n条件: ${cond}`,
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
  { id: "region_v1", title: "領域（別）1", inequalities: ["x+y\\le 3", "x\\ge 0", "y\\ge 0"], point: [1, 1], inside: true, difficulty: 1 },
  { id: "region_v2", title: "領域（別）2", inequalities: ["x+y\\le 3", "x\\ge 0", "y\\ge 0"], point: [2, 2], inside: false, difficulty: 1 },
  { id: "region_v3", title: "領域（別）3", inequalities: ["2x-y\\ge 0", "x\\le 3", "y\\le 4"], point: [2, 1], inside: true, difficulty: 2 },
  { id: "region_v4", title: "領域（別）4", inequalities: ["2x-y\\ge 0", "x\\le 3", "y\\le 4"], point: [1, 3], inside: false, difficulty: 2 },
  { id: "region_v5", title: "領域（別）5", inequalities: ["x-2y\\ge -2", "x\\ge -1", "y\\ge -1"], point: [0, 0], inside: true, difficulty: 2 },
  { id: "region_v6", title: "領域（別）6", inequalities: ["x-2y\\ge -2", "x\\ge -1", "y\\ge -1"], point: [-1, 2], inside: false, difficulty: 3 },
];

export const coordRegionVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
