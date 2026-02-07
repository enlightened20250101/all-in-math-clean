// src/lib/course/templates/math1/data_correlation_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type CorrCase = {
  id: string;
  title: string;
  r: number;
  correct: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: CorrCase): QuestionTemplate {
  const choices = ["強い正の相関", "正の相関", "強い負の相関", "負の相関", "相関なし"];
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
  { id: "data_corr_v1", title: "相関係数 別解1", r: 0.85, correct: "強い正の相関", difficulty: 1 },
  { id: "data_corr_v2", title: "相関係数 別解2", r: 0.55, correct: "正の相関", difficulty: 1 },
  { id: "data_corr_v3", title: "相関係数 別解3", r: -0.82, correct: "強い負の相関", difficulty: 1 },
  { id: "data_corr_v4", title: "相関係数 別解4", r: -0.45, correct: "負の相関", difficulty: 1 },
  { id: "data_corr_v5", title: "相関係数 別解5", r: 0.05, correct: "相関なし", difficulty: 1 },
  { id: "data_corr_v6", title: "相関係数 別解6", r: 0.72, correct: "強い正の相関", difficulty: 2 },
  { id: "data_corr_v7", title: "相関係数 別解7", r: -0.65, correct: "負の相関", difficulty: 2 },
  { id: "data_corr_v8", title: "相関係数 別解8", r: -0.9, correct: "強い負の相関", difficulty: 3 },
];

export const dataCorrelationVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
