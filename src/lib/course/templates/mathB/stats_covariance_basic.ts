// src/lib/course/templates/mathB/stats_covariance_basic.ts
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
      topicId: "stats_covariance_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "covariance", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.title}に関するデータである。共分散を求めよ。\\n\\nデータ: ${pointsText(c.points)}`,
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
  { id: "stats_cov_1", title: "学習時間と得点", points: [[2, 2], [-2, -2]], difficulty: 1 },
  { id: "stats_cov_2", title: "気温と売上個数", points: [[1, 3], [3, 5]], difficulty: 1 },
  { id: "stats_cov_3", title: "通学時間と身長", points: [[-1, 2], [1, -2]], difficulty: 1 },
  { id: "stats_cov_4", title: "広告費と来店数", points: [[0, 0], [2, 2], [4, 4], [6, 6]], difficulty: 1 },
  { id: "stats_cov_5", title: "練習量とミス回数", points: [[0, 1], [2, 5], [4, 9]], difficulty: 2 },
  { id: "stats_cov_6", title: "睡眠時間と集中度", points: [[-2, 4], [0, 2], [2, 0]], difficulty: 2 },
  { id: "stats_cov_7", title: "移動距離と体力残量", points: [[-1, -2], [1, 0], [3, 2]], difficulty: 2 },
  { id: "stats_cov_8", title: "気温と暖房使用量", points: [[-3, 1], [-1, -1], [1, -3], [3, -5]], difficulty: 3 },
  { id: "stats_cov_9", title: "練習回数と記録", points: [[-2, 3], [0, 1], [2, -1], [4, -3]], difficulty: 3 },
];

export const statsCovarianceTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
