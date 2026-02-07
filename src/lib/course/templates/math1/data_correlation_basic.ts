// src/lib/course/templates/math1/data_correlation_basic.ts
import type { QuestionTemplate } from "../../types";

type CorrCase = {
  id: string;
  title: string;
  r: number;
  correct: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: CorrCase): QuestionTemplate {
  const choices = ["強い正の相関", "正の相関", "負の相関", "相関なし"];
  return {
    meta: {
      id: c.id,
      topicId: "data_correlation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "correlation"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `相関係数 $r=${c.r}$ のとき、相関の強さとして正しいものを選べ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n$r$ の符号と大きさで相関の向きと強さを判断します。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: CorrCase[] = [
  { id: "data_corr_1", title: "相関係数 1", r: 0.9, correct: "強い正の相関", difficulty: 1 },
  { id: "data_corr_2", title: "相関係数 2", r: 0.6, correct: "正の相関", difficulty: 1 },
  { id: "data_corr_3", title: "相関係数 3", r: -0.7, correct: "負の相関", difficulty: 1 },
  { id: "data_corr_4", title: "相関係数 4", r: 0, correct: "相関なし", difficulty: 1 },
  { id: "data_corr_5", title: "相関係数 5", r: -0.3, correct: "負の相関", difficulty: 1 },
  { id: "data_corr_6", title: "相関係数 6", r: 0.2, correct: "正の相関", difficulty: 1 },
  { id: "data_corr_7", title: "相関係数 7", r: 0.8, correct: "強い正の相関", difficulty: 2 },
  { id: "data_corr_8", title: "相関係数 8", r: -0.8, correct: "負の相関", difficulty: 2 },
  { id: "data_corr_9", title: "相関係数 9", r: 0.1, correct: "正の相関", difficulty: 2 },
  { id: "data_corr_10", title: "相関係数 10", r: -0.1, correct: "負の相関", difficulty: 3 },
];

export const dataCorrelationTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
