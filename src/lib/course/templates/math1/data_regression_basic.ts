// src/lib/course/templates/math1/data_regression_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type RegCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: RegCase): QuestionTemplate {
  const y = c.a * c.x + c.b;
  const line = texLinear(c.a, c.b);
  return {
    meta: {
      id: c.id,
      topicId: "data_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["data", "regression"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `回帰直線 $y=${line}$ を用いて、$x=${c.x}$ のときの推定値 $y$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, y);
    },
    explain() {
      return `### この問題の解説\n回帰直線に $x=${c.x}$ を代入します。$y=${y}$。`;
    },
  };
}

const CASES: RegCase[] = [
  { id: "data_reg_1", title: "回帰直線 1", a: 2, b: 3, x: 4, difficulty: 1 },
  { id: "data_reg_2", title: "回帰直線 2", a: 1, b: -2, x: 6, difficulty: 1 },
  { id: "data_reg_3", title: "回帰直線 3", a: -1, b: 10, x: 3, difficulty: 1 },
  { id: "data_reg_4", title: "回帰直線 4", a: 3, b: 1, x: 2, difficulty: 1 },
  { id: "data_reg_5", title: "回帰直線 5", a: -2, b: 8, x: 1, difficulty: 1 },
  { id: "data_reg_6", title: "回帰直線 6", a: 4, b: -5, x: 2, difficulty: 1 },
  { id: "data_reg_7", title: "回帰直線 7", a: -3, b: 7, x: 2, difficulty: 2 },
  { id: "data_reg_8", title: "回帰直線 8", a: 5, b: -6, x: 2, difficulty: 3 },
];

export const dataRegressionTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
