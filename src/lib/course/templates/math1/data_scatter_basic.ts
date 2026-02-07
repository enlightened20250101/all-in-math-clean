// src/lib/course/templates/math1/data_scatter_basic.ts
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
      topicId: "data_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "scatter"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次のデータの散布図の傾向として正しいものを選べ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n点の並び方から相関の向きを判断します。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: ScatterCase[] = [
  { id: "data_scatter_1", title: "散布図 1", points: [[1, 1], [2, 2], [3, 3], [4, 4]], correct: "正の相関", difficulty: 1 },
  { id: "data_scatter_2", title: "散布図 2", points: [[1, 5], [2, 4], [3, 3], [4, 2]], correct: "負の相関", difficulty: 1 },
  { id: "data_scatter_3", title: "散布図 3", points: [[1, 2], [2, 1], [3, 2], [4, 1]], correct: "相関なし", difficulty: 1 },
  { id: "data_scatter_4", title: "散布図 4", points: [[0, 0], [1, 2], [2, 4], [3, 6]], correct: "正の相関", difficulty: 1 },
  { id: "data_scatter_5", title: "散布図 5", points: [[0, 6], [1, 5], [2, 4], [3, 3]], correct: "負の相関", difficulty: 1 },
  { id: "data_scatter_6", title: "散布図 6", points: [[1, 2], [2, 2], [3, 1], [4, 3]], correct: "相関なし", difficulty: 1 },
  { id: "data_scatter_7", title: "散布図 7", points: [[1, 1], [2, 3], [3, 2], [4, 4]], correct: "正の相関", difficulty: 2 },
  { id: "data_scatter_8", title: "散布図 8", points: [[1, 4], [2, 3], [3, 3], [4, 2]], correct: "負の相関", difficulty: 2 },
  { id: "data_scatter_9", title: "散布図 9", points: [[1, 2], [2, 2], [3, 2], [4, 2]], correct: "相関なし", difficulty: 2 },
  { id: "data_scatter_10", title: "散布図 10", points: [[1, 1], [2, 2], [3, 4], [4, 5]], correct: "正の相関", difficulty: 3 },
  { id: "data_scatter_11", title: "散布図 11", points: [[1, 5], [2, 4], [3, 2], [4, 1]], correct: "負の相関", difficulty: 3 },
];

export const dataScatterTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
