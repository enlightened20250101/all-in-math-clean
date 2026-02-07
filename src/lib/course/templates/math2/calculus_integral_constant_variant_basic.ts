// src/lib/course/templates/math2/calculus_integral_constant_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  c: number;
  a: number;
  b: number;
  value: number;
};

function buildParams(): Params {
  const c = randInt(1, 6);
  const a = randInt(0, 3);
  const b = a + randInt(1, 4);
  const value = c * (b - a);
  return { c, a, b, value };
}

export const calcIntegralConstantVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_integral_constant_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_constant_basic",
      title: `定数積分の逆算 ${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を満たす定数 $c$ を求めよ。\\n\\n$\\int_{${params.a}}^{${params.b}} c\\,dx = ${params.value}$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).c);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$$
\\int_{${p.a}}^{${p.b}} c\\,dx = c(${p.b}-${p.a}) = ${p.value}
$$
より $c=${p.value}÷(${p.b}-${p.a})=${p.c}$。答えは **${p.c}** です。
`;
    },
  };
});
