// src/lib/course/templates/math2/calculus_integral_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type IntegralParams = {
  a: number;
  b: number;
  x1: number;
  x2: number;
  value: number;
};

function buildParams(): IntegralParams {
  const a = pick([2, 4, 6]);
  const b = randInt(-4, 4);
  let x1 = randInt(-2, 1);
  let x2 = randInt(x1 + 1, 3);
  if (x2 === x1) x2 = x1 + 1;
  const value = (a / 2) * (x2 * x2 - x1 * x1) + b * (x2 - x1);
  return { a, b, x1, x2, value };
}

function explain(params: IntegralParams) {
  const { a, b, x1, x2, value } = params;
  return `
### この問題の解説
$$
\\int (${a}x + ${b})\\,dx = ${a / 2}x^2 + ${b}x
$$
より
$$
\\int_{${x1}}^{${x2}} (${a}x + ${b})\\,dx
= \\left[${a / 2}x^2 + ${b}x\\right]_{${x1}}^{${x2}}
$$
計算すると **${value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_integral_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement = `次の定積分を求めよ。\\n\\n$$\\int_{${params.x1}}^{${params.x2}} (${fx})\\,dx$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntegralParams).value);
    },
    explain(params) {
      return explain(params as IntegralParams);
    },
  };
}

export const integralBasicTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_integral_basic_${i + 1}`, `積分計算 ${i + 1}`)
);
