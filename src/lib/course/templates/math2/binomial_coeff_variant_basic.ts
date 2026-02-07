// src/lib/course/templates/math2/binomial_coeff_variant_basic.ts
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
  const a = pick([-3, -2, -1, 1, 2, 3]);
  const b = pick([-3, -2, -1, 1, 2, 3]);
  const n = randInt(4, 7);
  const k = randInt(0, n);
  const value = comb(n, k) * Math.pow(a, k) * Math.pow(b, n - k);
  return { a, b, n, k, value };
}

function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 1; i <= k; i += 1) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

export const binomialCoeffVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `binomial_coeff_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "binomial_coeff_basic",
      title: `二項係数の応用 ${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const { a, b, n, k } = params;
      const expr = texPow(`(${texLinear(a, b, "x")})`, n);
      const statement = `展開したときの $x^{${k}}$ の係数を求めよ。\\n\\n$$${expr}$$`;
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
二項定理より、$x^{${k}}$ の係数は
$$
\\binom{${n}}{${k}} \\cdot ${a}^{${k}} \\cdot ${b}^{${n - k}} = ${value}
$$
答えは **${value}** です。
`;
    },
  };
});
