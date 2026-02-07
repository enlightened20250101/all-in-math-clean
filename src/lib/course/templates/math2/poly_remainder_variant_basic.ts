// src/lib/course/templates/math2/poly_remainder_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type RemainderCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  p: number;
  sign: "+" | "-";
};

function remainderFor(c: RemainderCase): number {
  const x = c.sign === "+" ? -c.p : c.p;
  return c.a * x * x + c.b * x + c.c;
}

function divisorText(c: RemainderCase): string {
  return c.sign === "+" ? `x+${c.p}` : `x-${c.p}`;
}

function buildTemplate(c: RemainderCase): QuestionTemplate {
  const poly = texPoly2(c.a, c.b, c.c);
  const rem = remainderFor(c);
  return {
    meta: {
      id: c.id,
      topicId: "poly_remainder_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `多項式 $f(x)=${poly}$ を ${divisorText(c)} で割ったときの余りを求めよ。`,
        answerKind: "numeric",
        params: { a: c.a, b: c.b, c: c.c, p: c.p, rem },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, rem);
    },
    explain() {
      const x = c.sign === "+" ? -c.p : c.p;
      return `
### この問題の解説
余りの定理より、余りは $f(${x})$ です。
$$
f(${x})=${rem}
$$
答えは **${rem}** です。
`;
    },
  };
}

const CASES: RemainderCase[] = [
  { id: "poly_remainder_v1", title: "余り（符号入り）1", a: 1, b: -3, c: 2, p: 1, sign: "+" },
  { id: "poly_remainder_v2", title: "余り（符号入り）2", a: 2, b: 1, c: -4, p: 2, sign: "-" },
  { id: "poly_remainder_v3", title: "余り（符号入り）3", a: -1, b: 4, c: 1, p: 3, sign: "+" },
  { id: "poly_remainder_v4", title: "余り（符号入り）4", a: 3, b: -2, c: -1, p: 2, sign: "+" },
  { id: "poly_remainder_v5", title: "余り（符号入り）5", a: -2, b: 5, c: -3, p: 1, sign: "-" },
  { id: "poly_remainder_v6", title: "余り（符号入り）6", a: 1, b: 0, c: -5, p: 2, sign: "+" },
  { id: "poly_remainder_v7", title: "余り（符号入り）7", a: 2, b: -5, c: 2, p: 3, sign: "-" },
  { id: "poly_remainder_v8", title: "余り（符号入り）8", a: -3, b: 1, c: 4, p: 1, sign: "-" },
];

export const polyRemainderVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
