// src/lib/course/templates/math2/binomial_middle_coeff_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  const kk = Math.min(k, n - k);
  for (let i = 1; i <= kk; i += 1) {
    res = (res * (n - kk + i)) / i;
  }
  return Math.round(res);
}

type Params = {
  n: number;
  k: number;
  coeff: number;
};

function buildParams(): Params {
  const n = pick([6, 8, 10, 12]);
  const k = n / 2;
  const coeff = comb(n, k);
  return { n, k, coeff };
}

export const binomialMiddleCoeffVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `binomial_middle_coeff_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "binomial_middle_coeff_basic",
      title: `中央二項係数（偶数n）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `$(1+x)^{${params.n}}$ の中央二項係数を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).coeff);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
中央二項係数は $\\binom{${p.n}}{${p.k}}$。
よって **${p.coeff}** です。
`;
    },
  };
});
