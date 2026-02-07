// src/lib/course/templates/math2/exp_log_power_equation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type PowerCase = {
  id: string;
  title: string;
  a: number;
  p: number;
  q: number;
  k: number;
};

function formatLinear(p: number, q: number): string {
  return texLinear(p, q);
}

function solveX(c: PowerCase): number {
  return (c.k - c.q) / c.p;
}

function buildTemplate(c: PowerCase): QuestionTemplate {
  const x = solveX(c);
  return {
    meta: {
      id: c.id,
      topicId: "exp_log_power_equation_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const exp = formatLinear(c.p, c.q);
      return {
        templateId: c.id,
        statement: `方程式 ${c.a}^{${exp}}=${c.a}^{${c.k}} を解け。`,
        answerKind: "numeric",
        params: { a: c.a, p: c.p, q: c.q, k: c.k, x },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, x);
    },
    explain() {
      return `
### この問題の解説
同じ底なので指数を等しくすると
$$
${c.p}x+${c.q}=${c.k}
$$
より $x=${x}$。答えは **${x}** です。
`;
    },
  };
}

const CASES: PowerCase[] = [
  { id: "exp_power_v1", title: "指数方程式（一次）1", a: 2, p: 2, q: 1, k: 5 },
  { id: "exp_power_v2", title: "指数方程式（一次）2", a: 3, p: 3, q: 0, k: 6 },
  { id: "exp_power_v3", title: "指数方程式（一次）3", a: 5, p: 2, q: -1, k: 3 },
  { id: "exp_power_v4", title: "指数方程式（一次）4", a: 10, p: 1, q: -2, k: 1 },
  { id: "exp_power_v5", title: "指数方程式（一次）5", a: 2, p: 3, q: -2, k: 7 },
  { id: "exp_power_v6", title: "指数方程式（一次）6", a: 3, p: 2, q: -3, k: 1 },
];

export const expLogPowerEquationVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
