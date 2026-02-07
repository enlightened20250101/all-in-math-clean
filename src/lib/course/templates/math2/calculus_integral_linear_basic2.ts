// src/lib/course/templates/math2/calculus_integral_linear_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type IntParams = {
  a: number;
  b: number;
  p: number;
  q: number;
  value: number;
};

function buildParams(): IntParams {
  const a = randInt(1, 3);
  const b = randInt(-2, 2);
  const p = randInt(0, 2);
  const q = p + randInt(1, 3);
  const value = (a / 2) * (q * q - p * p) + b * (q - p);
  return { a, b, p, q, value };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_integral_linear_basic2",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement = `次を計算せよ。\\n\\n$$\\int_${params.p}^{${params.q}} ${fx}\\,dx$$`;
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
      const p = params as IntParams;
      return `
### この問題の解説
原始関数は $${p.a}/2x^2+${p.b}x$ なので
$$
F(${p.q})-F(${p.p})=${p.value}
$$
です。答えは **${p.value}** です。
`;
    },
  };
}

export const integralLinear2Templates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_integral_linear_basic2_${i + 1}`, `定積分 ${i + 1}`)
);
