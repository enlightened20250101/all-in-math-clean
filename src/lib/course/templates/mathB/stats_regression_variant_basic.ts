// src/lib/course/templates/mathB/stats_regression_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type RegCase = {
  id: string;
  title: string;
  prompt: string;
  answerKind: "numeric" | "choice";
  correct: number | string;
  choices?: string[];
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: RegCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "stats_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "regression", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.prompt,
        answerKind: c.answerKind,
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      if (c.answerKind === "choice") {
        return { isCorrect: userAnswer === c.correct, correctAnswer: String(c.correct) };
      }
      return gradeNumeric(userAnswer, Number(c.correct));
    },
    explain() {
      return `### この問題の解説\n回帰直線の傾き・切片・予測値の意味を使います。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: RegCase[] = [
  {
    id: "stats_reg_var_1",
    title: "傾きの解釈 1",
    prompt: "回帰直線 $y=2x+3$ のとき、$x$ が1増えると $y$ は平均的にいくつ増えるか。",
    answerKind: "numeric",
    correct: 2,
    difficulty: 1,
  },
  {
    id: "stats_reg_var_2",
    title: "切片の解釈",
    prompt: "回帰直線 $y=-x+5$ において、$x=0$ のときの推定値を求めよ。",
    answerKind: "numeric",
    correct: 5,
    difficulty: 1,
  },
  {
    id: "stats_reg_var_3",
    title: "残差の符号 1",
    prompt: "回帰直線 $y=3x-2$ に対し、観測値が $(x,y)=(2,6)$ のとき残差の符号はどれか。",
    answerKind: "choice",
    choices: ["正", "負", "0"],
    correct: "正",
    difficulty: 2,
  },
  {
    id: "stats_reg_var_4",
    title: "残差の符号 2",
    prompt: "回帰直線 $y=2x+1$ に対し、観測値が $(x,y)=(3,5)$ のとき残差の符号はどれか。",
    answerKind: "choice",
    choices: ["正", "負", "0"],
    correct: "0",
    difficulty: 2,
  },
  {
    id: "stats_reg_var_5",
    title: "予測値の比較",
    prompt: "回帰直線 $y=-2x+10$ について、$x=4$ の推定値を求めよ。",
    answerKind: "numeric",
    correct: 2,
    difficulty: 1,
  },
  {
    id: "stats_reg_var_6",
    title: "傾きの解釈 2",
    prompt: "回帰直線 $y=0.5x-1$ のとき、$x$ が2増えると $y$ は平均的にいくつ増えるか。",
    answerKind: "numeric",
    correct: 1,
    difficulty: 2,
  },
];

export const statsRegressionVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);

