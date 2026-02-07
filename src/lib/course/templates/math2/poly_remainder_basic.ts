// src/lib/course/templates/math2/poly_remainder_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  c: number;
  p: number;
  r: number;
};

function buildParams(): Params {
  for (let i = 0; i < 50; i += 1) {
    const a = randInt(-3, 3);
    if (a === 0) continue;
    const b = randInt(-5, 5);
    const c = randInt(-6, 6);
    const p = randInt(-3, 3);
    const r = a * p * p + b * p + c;
    if (Math.abs(r) <= 40) {
      return { a, b, c, p, r };
    }
  }
  return { a: 1, b: 0, c: 0, p: 1, r: 1 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "poly_remainder_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.a, params.b, params.c);
      const divisor = texLinear(1, -params.p);
      const statement = `多項式 $f(x)=${poly}$ を $${divisor}$ で割ったときの余りを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
余りの定理より、余りは $f(${p.p})$ です。
$$
${p.a}(${p.p})^2+${p.b}(${p.p})+${p.c}=${p.r}
$$
答えは **${p.r}** です。
`;
    },
  };
}

export const polyRemainderTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`poly_remainder_basic_${i + 1}`, `余り ${i + 1}`)
);
