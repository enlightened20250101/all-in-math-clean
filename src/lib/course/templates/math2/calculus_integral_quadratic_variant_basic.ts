// src/lib/course/templates/math2/calculus_integral_quadratic_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = { a: number; b: number; c: number; value: number };

function buildParams(): Params {
  const a = pick([3, 6, 9]); // a/3 integer
  const b = pick([2, 4, -2, -4]);
  const c = randInt(-3, 4);
  const value = (2 * a) / 3 + 2 * c; // integral -1..1, odd term cancels
  return { a, b, c, value };
}

export const integralQuadraticVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_integral_quadratic_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_quadratic_basic",
      title: `2次関数の積分（対称区間）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次の定積分を求めよ。\\n\\n$$\\int_{-1}^{1} (${texPoly2(params.a, params.b, params.c)})\\,dx$$`;
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
      return `
### この問題の解説
奇数次の項は対称区間で消えるので、
$$
\\int_{-1}^{1} (ax^2+bx+c)\\,dx = 2\\int_0^1 (ax^2+c)\\,dx
$$
となり、答えは **${p.value}** です。
`;
    },
  };
});
