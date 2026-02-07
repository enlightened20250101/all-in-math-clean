// src/lib/course/templates/math1/data_scatter_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type ScatterCase = {
  id: string;
  points: Array<[number, number]>;
  correct: string;
  difficulty: 1 | 2 | 3;
};

function pointsText(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `(${x},${y})`).join(", ");
}

const CASES: ScatterCase[] = [
  { id: "data_scatter_var_1", points: [[1, 3], [2, 4], [3, 4], [4, 5]], correct: "正の相関", difficulty: 1 },
  { id: "data_scatter_var_2", points: [[1, 5], [2, 4], [3, 3], [4, 3]], correct: "負の相関", difficulty: 1 },
  { id: "data_scatter_var_3", points: [[1, 2], [2, 3], [3, 2], [4, 3]], correct: "相関なし", difficulty: 1 },
];

export const dataScatterVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `data_scatter_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "data_scatter_basic",
      title: `散布図（追加）${i + 1}`,
      difficulty: c.difficulty,
      tags: ["data", "scatter"],
    },
    generate() {
      return {
        templateId,
        statement: `次のデータの散布図の傾向として正しいものを選べ。\\n\\nデータ: ${pointsText(c.points)}`,
        answerKind: "choice",
        choices: ["正の相関", "負の相関", "相関なし"],
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n点の並び方から相関の向きを判断します。答えは **${c.correct}** です。`;
    },
  };
});
