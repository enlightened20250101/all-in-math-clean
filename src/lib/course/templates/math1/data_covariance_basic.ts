// src/lib/course/templates/math1/data_covariance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type CovCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  context?: string;
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
      const lead = c.context ? `${c.context}\n\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}次のデータの共分散を求めよ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, cov);
    },
    explain() {
      return `### この問題の解説\n平均を求め、$(x-\\bar{x})(y-\\bar{y})$ の平均を計算します。共分散は ${cov} です。`;
    },
  };
}

const CASES: CovCase[] = [
  { id: "data_cov_1", title: "共分散 1", points: [[1, 1], [-1, -1]], context: "2人の生徒の勉強時間 $x$ と得点 $y$ を調べた。", difficulty: 1 },
  { id: "data_cov_2", title: "共分散 2", points: [[1, 2], [3, 4]], context: "気温 $x$ とアイスの売上 $y$ の関係を調べた。", difficulty: 1 },
  { id: "data_cov_3", title: "共分散 3", points: [[-2, 2], [2, -2]], context: "広告費 $x$ と利益 $y$ のデータが次である。", difficulty: 1 },
  { id: "data_cov_4", title: "共分散 4", points: [[0, 0], [2, 2], [4, 4], [6, 6]], difficulty: 1 },
  { id: "data_cov_5", title: "共分散 5", points: [[-1, 1], [1, 1], [3, 1]], difficulty: 1 },
  { id: "data_cov_6", title: "共分散 6", points: [[0, 2], [2, 2], [4, 2]], difficulty: 1 },
  { id: "data_cov_7", title: "共分散 7", points: [[0, 1], [2, 3], [4, 5]], difficulty: 2 },
  { id: "data_cov_8", title: "共分散 8", points: [[-2, 4], [0, 2], [2, 0]], difficulty: 2 },
  { id: "data_cov_9", title: "共分散 9", points: [[-3, 1], [-1, -1], [1, -3], [3, -5]], difficulty: 3 },
];

export const dataCovarianceTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
