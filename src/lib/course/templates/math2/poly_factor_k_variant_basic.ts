// src/lib/course/templates/math2/poly_factor_k_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type FactorCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  p: number;
  sign: "+" | "-";
};

function kValue(c: FactorCase): number {
  if (c.sign === "+") {
    return c.b * c.p - c.a * c.p * c.p;
  }
  return -c.a * c.p * c.p - c.b * c.p;
}

function divisorText(c: FactorCase): string {
  return c.sign === "+" ? `x+${c.p}` : `x-${c.p}`;
}

function buildTemplate(c: FactorCase): QuestionTemplate {
  const k = kValue(c);
  const poly = `${texPoly2(c.a, c.b, 0)}+k`;
  return {
    meta: {
      id: c.id,
      topicId: "poly_factor_k_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `$${divisorText(c)}$ が $f(x)=${poly}$ の因数となるような $k$ を求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, b: c.b, p: c.p, k },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, k);
    },
    explain() {
      const x = c.sign === "+" ? -c.p : c.p;
      return `
### この問題の解説
因数定理より $f(${x})=0$ です。
$$
${c.a}(${x})^2+${c.b}(${x})+k=0
$$
より $k=${k}$ です。
`;
    },
  };
}

const CASES: FactorCase[] = [
  { id: "poly_factor_k_v1", title: "因数定理（符号入り）1", a: 1, b: -3, p: 2, sign: "+" },
  { id: "poly_factor_k_v2", title: "因数定理（符号入り）2", a: 2, b: 1, p: 1, sign: "-" },
  { id: "poly_factor_k_v3", title: "因数定理（符号入り）3", a: -1, b: 4, p: 2, sign: "-" },
  { id: "poly_factor_k_v4", title: "因数定理（符号入り）4", a: 3, b: -2, p: 1, sign: "+" },
  { id: "poly_factor_k_v5", title: "因数定理（符号入り）5", a: -2, b: 5, p: 2, sign: "+" },
  { id: "poly_factor_k_v6", title: "因数定理（符号入り）6", a: 1, b: 0, p: 3, sign: "-" },
  { id: "poly_factor_k_v7", title: "因数定理（符号入り）7", a: 2, b: -5, p: 1, sign: "+" },
  { id: "poly_factor_k_v8", title: "因数定理（符号入り）8", a: -3, b: 1, p: 1, sign: "-" },
];

export const polyFactorKVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
