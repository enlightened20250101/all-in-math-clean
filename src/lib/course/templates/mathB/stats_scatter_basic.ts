// src/lib/course/templates/mathB/stats_scatter_basic.ts
import type { QuestionTemplate } from "../../types";

type ScatterCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  correct: string;
  difficulty: 1 | 2 | 3;
};

function pointsText(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `(${x},${y})`).join(", ");
}

function buildTemplate(c: ScatterCase): QuestionTemplate {
  const choices = ["正の相関", "負の相関", "相関なし"];
  return {
    meta: {
      id: c.id,
      topicId: "stats_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "scatter", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.title}に関する調査データである。散布図の相関の向きを選べ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n散布図の並び方から相関の向きを判断します。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: ScatterCase[] = [
  { id: "stats_scatter_1", title: "学習時間と得点", points: [[1, 3], [2, 4], [3, 5], [4, 6]], correct: "正の相関", difficulty: 1 },
  { id: "stats_scatter_2", title: "気温と売上個数", points: [[1, 6], [2, 5], [3, 4], [4, 3]], correct: "負の相関", difficulty: 1 },
  { id: "stats_scatter_3", title: "通学時間と身長", points: [[1, 2], [2, 3], [3, 2], [4, 3]], correct: "相関なし", difficulty: 1 },
  { id: "stats_scatter_4", title: "広告費と来店数", points: [[0, 1], [1, 2], [2, 4], [3, 5]], correct: "正の相関", difficulty: 1 },
  { id: "stats_scatter_5", title: "練習量とミス回数", points: [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1]], correct: "負の相関", difficulty: 1 },
  { id: "stats_scatter_6", title: "睡眠時間と集中度", points: [[1, 1], [2, 3], [3, 2], [4, 4], [5, 3]], correct: "正の相関", difficulty: 2 },
  { id: "stats_scatter_7", title: "移動距離と体力残量", points: [[1, 4], [2, 2], [3, 3], [4, 1], [5, 2]], correct: "負の相関", difficulty: 2 },
  { id: "stats_scatter_8", title: "座席位置と身長", points: [[1, 2], [2, 2], [3, 2], [4, 2]], correct: "相関なし", difficulty: 2 },
  { id: "stats_scatter_9", title: "練習回数と記録", points: [[1, 1], [2, 2], [3, 4], [4, 5], [5, 4]], correct: "正の相関", difficulty: 3 },
  { id: "stats_scatter_10", title: "気温と暖房使用量", points: [[1, 5], [2, 4], [3, 2], [4, 2], [5, 1]], correct: "負の相関", difficulty: 3 },
];

export const statsScatterTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
