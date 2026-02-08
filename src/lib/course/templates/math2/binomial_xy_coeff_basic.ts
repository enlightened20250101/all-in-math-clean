// src/lib/course/templates/math2/binomial_xy_coeff_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

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
  const n = pick([4, 5, 6]);
  const k = randInt(0, n);
  const coeff = comb(n, k);
  return { n, k, coeff };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "binomial_xy_coeff_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement =
        `組合せの数え上げとして、展開式 $(x+y)^{${params.n}}$ における $x^{${params.k}}y^{${params.n - params.k}}$ の係数を求めよ。`;
      return {
        templateId: id,
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
二項定理より係数は $\binom{${p.n}}{${p.k}}$。
よって **${p.coeff}** です。
`;
    },
  };
}

export const binomialXyCoeffTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`binomial_xy_coeff_basic_${i + 1}`, `係数 ${i + 1}`)
);
