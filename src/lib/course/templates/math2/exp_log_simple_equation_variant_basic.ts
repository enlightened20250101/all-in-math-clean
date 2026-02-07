// src/lib/course/templates/math2/exp_log_simple_equation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type SimpleCase = {
  id: string;
  title: string;
  a: number;
  p: number;
  k: number;
};

function formatShift(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x+${p}` : `x${p}`;
}

function solveX(c: SimpleCase): number {
  return c.k - c.p;
}

function buildTemplate(c: SimpleCase): QuestionTemplate {
  const x = solveX(c);
  return {
    meta: {
      id: c.id,
      topicId: "exp_log_simple_equation_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const exp = formatShift(c.p);
      return {
        templateId: c.id,
        statement: `方程式 ${c.a}^{${exp}}=${c.a}^{${c.k}} を解け。`,
        answerKind: "numeric",
        params: { a: c.a, p: c.p, k: c.k, x },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, x);
    },
    explain() {
      return `
### この問題の解説
同じ底なので指数が等しくなり
$$
x+${c.p}=${c.k}
$$
より $x=${x}$。答えは **${x}** です。
`;
    },
  };
}

const CASES: SimpleCase[] = [
  { id: "exp_simple_v1", title: "指数方程式（移項）1", a: 2, p: 3, k: 7 },
  { id: "exp_simple_v2", title: "指数方程式（移項）2", a: 3, p: 2, k: 5 },
  { id: "exp_simple_v3", title: "指数方程式（移項）3", a: 5, p: 1, k: 4 },
  { id: "exp_simple_v4", title: "指数方程式（移項）4", a: 10, p: 4, k: 1 },
  { id: "exp_simple_v5", title: "指数方程式（移項）5", a: 2, p: -2, k: 3 },
  { id: "exp_simple_v6", title: "指数方程式（移項）6", a: 3, p: -1, k: 2 },
];

export const expLogSimpleEquationVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
