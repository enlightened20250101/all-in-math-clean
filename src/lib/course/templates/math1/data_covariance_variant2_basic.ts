// src/lib/course/templates/math1/data_covariance_variant2_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type CovCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  difficulty: 1 | 2 | 3;
};

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function covariance(points: Array<[number, number]>): number {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const mx = mean(xs);
  const my = mean(ys);
  const sum = points.reduce((acc, [x, y]) => acc + (x - mx) * (y - my), 0);
  return sum / points.length;
}

function pointsText(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `(${x},${y})`).join(", ");
}

function buildTemplate(c: CovCase): QuestionTemplate {
  const cov = covariance(c.points);
  return {
    meta: {
      id: c.id,
      topicId: "data_covariance_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "covariance"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次のデータの共分散を求めよ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, cov);
    },
    explain() {
      return `### この問題の解説\n平均との差の積の平均を計算します。共分散は ${cov} です。`;
    },
  };
}

const CASES: CovCase[] = [
  { id: "data_cov_v1", title: "共分散（別）1", points: [[1, 2], [1, 2], [-1, -2], [-1, -2]], difficulty: 1 },
  { id: "data_cov_v2", title: "共分散（別）2", points: [[1, -2], [1, -2], [-1, 2], [-1, 2]], difficulty: 1 },
  { id: "data_cov_v3", title: "共分散（別）3", points: [[2, 1], [2, 1], [-2, -1], [-2, -1]], difficulty: 1 },
  { id: "data_cov_v4", title: "共分散（別）4", points: [[2, 0], [2, 0], [-2, 0], [-2, 0]], difficulty: 1 },
  { id: "data_cov_v5", title: "共分散（別）5", points: [[2, 3], [-2, -3], [2, 3], [-2, -3]], difficulty: 2 },
  { id: "data_cov_v6", title: "共分散（別）6", points: [[3, -1], [3, -1], [-3, 1], [-3, 1]], difficulty: 2 },
];

export const dataCovarianceVariant2Templates: QuestionTemplate[] = CASES.map(buildTemplate);
