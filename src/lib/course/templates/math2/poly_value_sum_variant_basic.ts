// src/lib/course/templates/math2/poly_value_sum_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type ValueCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  x1: number;
  x2: number;
};

function sumValue(c: ValueCase): number {
  const f1 = c.a * c.x1 * c.x1 + c.b * c.x1 + c.c;
  const f2 = c.a * c.x2 * c.x2 + c.b * c.x2 + c.c;
  return f1 + f2;
}

function buildTemplate(c: ValueCase): QuestionTemplate {
  const val = sumValue(c);
  const poly = texPoly2(c.a, c.b, c.c);
  return {
    meta: {
      id: c.id,
      topicId: "poly_value_sum_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `費用の条件から得た多項式として、多項式 $f(x)=${poly}$ について $f(${c.x1})+f(${c.x2})$ を求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, b: c.b, c: c.c, x1: c.x1, x2: c.x2, val },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, val);
    },
    explain() {
      const f1 = c.a * c.x1 * c.x1 + c.b * c.x1 + c.c;
      const f2 = c.a * c.x2 * c.x2 + c.b * c.x2 + c.c;
      return `
### この問題の解説
$f(${c.x1})=${f1}$, $f(${c.x2})=${f2}$ より
$$
f(${c.x1})+f(${c.x2})=${f1}+${f2}=${val}
$$
答えは **${val}** です。
`;
    },
  };
}

const CASES: ValueCase[] = [
  { id: "poly_value_sum_v1", title: "値の和（別）1", a: 1, b: -2, c: 1, x1: 2, x2: -2 },
  { id: "poly_value_sum_v2", title: "値の和（別）2", a: 2, b: 1, c: -3, x1: 1, x2: -1 },
  { id: "poly_value_sum_v3", title: "値の和（別）3", a: -1, b: 4, c: 0, x1: 2, x2: -2 },
  { id: "poly_value_sum_v4", title: "値の和（別）4", a: 3, b: -2, c: -1, x1: 0, x2: 2 },
  { id: "poly_value_sum_v5", title: "値の和（別）5", a: -2, b: 5, c: -3, x1: 1, x2: 2 },
  { id: "poly_value_sum_v6", title: "値の和（別）6", a: 1, b: 0, c: -5, x1: -1, x2: 3 },
  { id: "poly_value_sum_v7", title: "値の和（別）7", a: 2, b: -5, c: 2, x1: -2, x2: 2 },
  { id: "poly_value_sum_v8", title: "値の和（別）8", a: -3, b: 1, c: 4, x1: 1, x2: 3 },
];

export const polyValueSumVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
