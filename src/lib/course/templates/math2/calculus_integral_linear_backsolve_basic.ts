// src/lib/course/templates/math2/calculus_integral_linear_backsolve_basic.ts
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
  const b = randInt(-2, 3);
  const p = randInt(0, 2);
  const q = p + randInt(1, 3);
  const value = (a / 2) * (q * q - p * p) + b * (q - p);
  return { a, b, p, q, value };
}

export const calcIntegralLinearBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_integral_linear_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_linear_basic2",
      title: `定積分（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = `${texLinear(params.a, 0)}+b`;
      const statement =
        `直線 $y=${fx}$ の区間 $[${params.p},${params.q}]$ における面積が ${params.value} となるように` +
        ` $b$ を求めよ。\\n\\n$$\\int_${params.p}^{${params.q}} (${fx})\\,dx=${params.value}$$`;
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
\\int_{${p.p}}^{${p.q}} (${p.a}x+b)\\,dx=\\frac{${p.a}}{2}(${p.q}^2-${p.p}^2)+b(${p.q}-${p.p})
$$
より $b=${p.b}$。答えは **${p.b}** です。
`;
    },
  };
});
