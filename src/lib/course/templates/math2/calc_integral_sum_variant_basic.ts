// src/lib/course/templates/math2/calc_integral_sum_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  p: number;
  q: number;
  value: number;
};

function buildParams(): Params {
  const a = randInt(1, 3);
  const b = randInt(1, 4);
  const p = randInt(0, 2);
  const q = p + randInt(1, 3);
  const value = a * (q - p) + (b / 2) * (q * q - p * p);
  return { a, b, p, q, value };
}

export const calcIntegralSumVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_integral_sum_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_sum_basic",
      title: `定積分（和）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.b, params.a);
      const statement = `次を計算せよ。\\n\\n$$\\int_{${params.p}}^{${params.q}} (${fx})\\,dx$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      const fx = texLinear(p.b, p.a);
      return `
### この問題の解説
$$
\\int (${fx})\\,dx = ${p.a}x+\\frac{${p.b}}{2}x^2
$$
より $${p.value}$$。答えは **${p.value}** です。
`;
    },
  };
});
