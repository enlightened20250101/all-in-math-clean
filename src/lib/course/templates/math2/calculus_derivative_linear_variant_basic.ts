// src/lib/course/templates/math2/calculus_derivative_linear_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type DerivCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
};

function buildTemplate(c: DerivCase): QuestionTemplate {
  const fx = texLinear(c.a, c.b);
  return {
    meta: {
      id: c.id,
      topicId: "calc_derivative_linear_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `関数 $f(x)=${fx}$ の $x=${c.x}$ における導関数の値を求めよ。`,
        answerKind: "numeric",
        params: { a: c.a },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { a: number }).a);
    },
    explain(params) {
      const a = (params as { a: number }).a;
      return `
### この問題の解説
一次関数の導関数は一定で $f'(x)=a$ です。
答えは **${a}** です。
`;
    },
  };
}

const CASES: DerivCase[] = [
  { id: "calc_deriv_lin_v1", title: "一次関数の微分（点指定）1", a: 2, b: -3, x: 1 },
  { id: "calc_deriv_lin_v2", title: "一次関数の微分（点指定）2", a: -3, b: 4, x: -2 },
  { id: "calc_deriv_lin_v3", title: "一次関数の微分（点指定）3", a: 4, b: 1, x: 3 },
  { id: "calc_deriv_lin_v4", title: "一次関数の微分（点指定）4", a: -2, b: -5, x: 0 },
];

export const derivativeLinearVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
