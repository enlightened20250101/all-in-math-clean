// src/lib/course/templates/math2/calculus_integral_quadratic_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type IntParams = { a: number; b: number; c: number; value: number };

function buildParams(): IntParams {
  const a = pick([3, 6, 9]); // a/3 が整数
  const b = pick([2, 4, -2, -4]); // b/2 が整数
  const c = randInt(-4, 4);
  const value = a / 3 + b / 2 + c;
  return { a, b, c, value };
}

function explain(params: IntParams) {
  return `
### この問題の解説
$$
\\int (ax^2+bx+c)dx=\\frac{a}{3}x^3+\\frac{b}{2}x^2+cx
$$
より
$$
\\int_0^1 (${texPoly2(params.a, params.b, params.c)})\\,dx
=\\frac{${params.a}}{3}+\\frac{${params.b}}{2}+${params.c}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_integral_quadratic_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次の定積分を求めよ。\\n\\n$$\\int_0^1 (${texPoly2(params.a, params.b, params.c)})\\,dx$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams).value);
    },
    explain(params) {
      return explain(params as IntParams);
    },
  };
}

export const integralQuadraticTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_integral_quadratic_basic_${i + 1}`, `2次関数の積分 ${i + 1}`)
);
