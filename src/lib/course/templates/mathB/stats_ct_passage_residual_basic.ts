// src/lib/course/templates/mathB/stats_ct_passage_residual_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  slope: number;
  intercept: number;
  point: [number, number];
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const [x, y] = c.point;
  const estimate = c.slope * x + c.intercept;
  const residual = y - estimate;
  const sign = residual > 0 ? "正" : residual < 0 ? "負" : "0";
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）回帰直線で $x=${x}$ の推定値を求めよ。`,
    `（問2）残差 $y-\\hat{y}$ を求めよ。`,
    `（問3）残差の符号を答えよ（正/負/0）。`,
  ].join("\n");
  const choices = [
    { id: "A", label: "正" },
    { id: "B", label: "負" },
    { id: "C", label: "0" },
  ] as const;
  const signChoice = sign === "正" ? "A" : sign === "負" ? "B" : "C";
  return {
    meta: {
      id: c.id,
      topicId: "stats_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "regression", "residual", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "推定値" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "残差" },
          { id: "q3", label: "問3", answerKind: "choice", choices },
        ],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        parsed = {};
      }
      const q1Result = gradeNumeric(parsed.q1 ?? "", estimate);
      const q2Result = gradeNumeric(parsed.q2 ?? "", residual);
      const q3Result = gradeChoice(parsed.q3 ?? "", signChoice);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${estimate} / 問2:${residual} / 問3:${sign}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(estimate) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(residual) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: signChoice },
        },
      };
    },
    explain() {
      return `### この問題の解説\n回帰直線 $y=ax+b$ に $x$ を代入して推定値を求め、残差 $y-\\hat{y}$ の符号を判断する。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_residual_1",
    title: "残差 連問 1",
    slope: 1.8,
    intercept: 2,
    point: [4, 11],
    context: "回帰直線が $y=1.8x+2$ で、観測値は $(4,11)$ である。",
    difficulty: 2,
  },
  {
    id: "stats_ct_passage_residual_2",
    title: "残差 連問 2",
    slope: 0.6,
    intercept: 3,
    point: [10, 7],
    context: "回帰直線が $y=0.6x+3$ で、観測値は $(10,7)$ である。",
    difficulty: 3,
  },
];

export const statsCtPassageResidualTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
