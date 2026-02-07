// src/lib/course/templates/math1/data_regression_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type RegCase = {
  id: string;
  a: number;
  b: number;
  y: number;
  answer: number;
  difficulty: 1 | 2 | 3;
};

const CASES: RegCase[] = [
  { id: "data_reg_var_1", a: 2, b: 1, y: 9, answer: 4, difficulty: 1 },
  { id: "data_reg_var_2", a: -1, b: 6, y: 2, answer: 4, difficulty: 1 },
  { id: "data_reg_var_3", a: 3, b: -3, y: 6, answer: 3, difficulty: 1 },
];

export const dataRegressionVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `data_regression_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "data_regression_basic",
      title: `回帰直線（逆算）${i + 1}`,
      difficulty: c.difficulty,
      tags: ["data", "regression"],
    },
    generate() {
      const line = texLinear(c.a, c.b);
      return {
        templateId,
        statement: `回帰直線 $y=${line}$ において、$y=${c.y}$ となる $x$ を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.answer);
    },
    explain() {
      return `### この問題の解説\n$${c.y}=${c.a}x+${c.b}$ を解くと $x=${c.answer}$。`;
    },
  };
});
