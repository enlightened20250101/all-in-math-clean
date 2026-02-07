// src/lib/course/templates/math2/poly_coeff_from_roots_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type RootCase = {
  id: string;
  title: string;
  a: number;
  r1: number;
  r2: number;
};

function constantTerm(c: RootCase): number {
  return c.a * c.r1 * c.r2;
}

function buildTemplate(c: RootCase): QuestionTemplate {
  const constTerm = constantTerm(c);
  return {
    meta: {
      id: c.id,
      topicId: "poly_coeff_from_roots_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `二次方程式の解が $x=${c.r1},\\ x=${c.r2}$ で、最高次係数が ${c.a} のとき、定数項を求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, r1: c.r1, r2: c.r2, constTerm },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, constTerm);
    },
    explain() {
      return `
### この問題の解説
二次式は $${c.a}(x-${c.r1})(x-${c.r2})$ なので定数項は
$$
${c.a}\\cdot${c.r1}\\cdot${c.r2}=${constTerm}
$$
答えは **${constTerm}** です。
`;
    },
  };
}

const CASES: RootCase[] = [
  { id: "poly_coeff_root_v1", title: "定数項 1", a: 1, r1: 2, r2: -3 },
  { id: "poly_coeff_root_v2", title: "定数項 2", a: 2, r1: 1, r2: 3 },
  { id: "poly_coeff_root_v3", title: "定数項 3", a: -1, r1: -2, r2: 4 },
  { id: "poly_coeff_root_v4", title: "定数項 4", a: 3, r1: -1, r2: -2 },
  { id: "poly_coeff_root_v5", title: "定数項 5", a: 1, r1: 4, r2: 5 },
  { id: "poly_coeff_root_v6", title: "定数項 6", a: -2, r1: 3, r2: -1 },
  { id: "poly_coeff_root_v7", title: "定数項 7", a: 2, r1: -3, r2: -2 },
  { id: "poly_coeff_root_v8", title: "定数項 8", a: 1, r1: -4, r2: 1 },
];

export const polyCoeffFromRootsVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
