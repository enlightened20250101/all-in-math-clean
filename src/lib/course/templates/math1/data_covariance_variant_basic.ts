// src/lib/course/templates/math1/data_covariance_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type CovCase = {
  id: string;
  points: Array<[number, number]>;
  answer: number;
  difficulty: 1 | 2 | 3;
};

const CASES: CovCase[] = [
  { id: "data_cov_var_1", points: [[0, 0], [2, 2]], answer: 1, difficulty: 1 },
  { id: "data_cov_var_2", points: [[1, 3], [3, 1]], answer: -1, difficulty: 1 },
  { id: "data_cov_var_3", points: [[-1, 2], [1, 2]], answer: 0, difficulty: 1 },
];

function pointsText(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `(${x},${y})`).join(", ");
}

export const dataCovarianceVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `data_covariance_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "data_covariance_basic",
      title: `共分散（追加）${i + 1}`,
      difficulty: c.difficulty,
      tags: ["data", "covariance"],
    },
    generate() {
      return {
        templateId,
        statement: `次のデータの共分散を求めよ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "numeric",
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return `### この問題の解説\n平均を求め、$(x-\\bar{x})(y-\\bar{y})$ の平均を計算します。共分散は ${c.answer} です。`;
    },
  };
});
