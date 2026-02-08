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
  context?: string;
  difficulty: 1 | 2 | 3;
};

const CASES: RegCase[] = [
  { id: "data_reg_var_1", a: 2, b: 1, y: 9, answer: 4, context: "学習時間 $x$ (時間) と得点 $y$ (点) の回帰直線が与えられている。", difficulty: 1 },
  { id: "data_reg_var_2", a: -1, b: 6, y: 2, answer: 4, context: "気温 $x$ (℃) と暖房使用量 $y$ の回帰直線が与えられている。", difficulty: 1 },
  { id: "data_reg_var_3", a: 3, b: -3, y: 6, answer: 3, context: "広告費 $x$ (万円) と売上 $y$ (万円) の回帰直線が与えられている。", difficulty: 1 },
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
      const lead = c.context ? `${c.context}\\n\\n` : "";
      return {
        templateId,
        statement: `${lead}回帰直線 $y=${line}$ において、$y=${c.y}$ となる $x$ を求めよ。`,
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
