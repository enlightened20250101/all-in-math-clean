// src/lib/course/templates/mathB/stats_correlation_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type CorrCase = {
  id: string;
  title: string;
  prompt: string;
  choices: string[];
  correct: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: CorrCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "stats_correlation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "correlation", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.prompt,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n相関係数 $r$ の絶対値が大きいほど相関が強く、符号で向きが決まります。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: CorrCase[] = [
  {
    id: "stats_corr_var_1",
    title: "相関の強さ比較 1",
    prompt: "相関係数が $r=0.8$ と $r=0.3$ のとき、相関が強いのはどちらか。",
    choices: ["r=0.8", "r=0.3", "同程度"],
    correct: "r=0.8",
    difficulty: 1,
  },
  {
    id: "stats_corr_var_2",
    title: "相関の強さ比較 2",
    prompt: "相関係数が $r=-0.6$ と $r=0.4$ のとき、相関が強いのはどちらか。",
    choices: ["r=-0.6", "r=0.4", "同程度"],
    correct: "r=-0.6",
    difficulty: 1,
  },
  {
    id: "stats_corr_var_3",
    title: "相関の向き判定",
    prompt: "相関係数が $r=-0.2$ のとき、相関の向きとして正しいものを選べ。",
    choices: ["正の相関", "負の相関", "相関なし"],
    correct: "負の相関",
    difficulty: 1,
  },
  {
    id: "stats_corr_var_4",
    title: "相関の有無",
    prompt: "相関係数が $r=0$ のとき、相関として正しいものを選べ。",
    choices: ["正の相関", "負の相関", "相関なし"],
    correct: "相関なし",
    difficulty: 1,
  },
  {
    id: "stats_corr_var_5",
    title: "強さの比較（絶対値）",
    prompt: "相関係数が $r=-0.9$ と $r=0.8$ のとき、相関が強いのはどちらか。",
    choices: ["r=-0.9", "r=0.8", "同程度"],
    correct: "r=-0.9",
    difficulty: 2,
  },
  {
    id: "stats_corr_var_6",
    title: "弱い相関の判定",
    prompt: "相関係数が $r=0.05$ のとき、相関の強さとして最も適切なものを選べ。",
    choices: ["強い相関", "弱い相関", "相関なしに近い"],
    correct: "相関なしに近い",
    difficulty: 2,
  },
];

export const statsCorrelationVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);

