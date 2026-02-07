// src/lib/course/templates/math3/calc_derivative_chain_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow, texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  n: number;
  k: number;
  value: number;
};

function buildParams(): Params {
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-3, 3);
  const n = randInt(2, 4);
  const k = randInt(-2, 2);
  const inner = a * k + b;
  const value = n * a * Math.pow(inner, n - 1);
  return { a, b, n, k, value };
}

export const calcDerivativeChainBasicTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_derivative_chain_basic_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_derivative_advanced_basic",
      title: `合成関数の微分 ${i + 1}`,
      difficulty: 2,
      tags: ["calculus", "derivative"],
    },
    generate() {
      const params = buildParams();
      const { a, b, n, k } = params;
      const fx = texPow(`(${texLinear(a, b, "x")})`, n);
      const statement = `関数 $y=${fx}$ について、$x=${k}$ における $\\dfrac{dy}{dx}$ を求めよ。`;
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
      const { a, b, n, k, value } = params as Params;
      return `
### この問題の解説
合成関数の微分より
$$
\\frac{dy}{dx} = ${n}(${texLinear(a, b, "x")})^{${n - 1}} \\cdot ${a}
$$
なので、$x=${k}$ を代入して **${value}**。
`;
    },
  };
});

