// src/lib/course/templates/math2/identity_coefficient_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = {
  p: number;
  q: number;
  r: number;
  b: number;
};

function buildParams(): Params {
  const p = randInt(1, 3);
  const q = randInt(-3, 3);
  const r = randInt(-3, 3);
  const b = q - p;
  return { p, q, r, b };
}

export const identityCoefficientVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `identity_coefficient_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "identity_coefficient_basic",
      title: `係数（一次）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.p, params.q, params.r);
      const statement = `面積の式として、恒等式 $(${poly})(x-1)\\equiv ax^3+bx^2+\\cdots$ が成り立つとき、$b$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$$
(px^2+qx+r)(x-1)=p x^3+(q-p)x^2+\\cdots
$$
したがって $b=q-p=${p.b}$。答えは **${p.b}** です。
`;
    },
  };
});
