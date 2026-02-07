// src/lib/course/templates/math2/binomial_coeff_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

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
  a: number;
  coeff: number;
};

function buildParams(): Params {
  const n = pick([3, 4, 5]);
  const k = randInt(0, n);
  const a = pick([-2, -1, 1, 2, 3]);
  const coeff = comb(n, k) * Math.pow(a, n - k);
  return { n, k, a, coeff };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "binomial_coeff_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const base = texLinear(1, params.a);
      const statement = `$(${base})^{${params.n}}$ の $x^{${params.k}}$ の係数を求めよ。`;
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
二項定理より係数は $\binom{${p.n}}{${p.k}}${p.a}^{${p.n - p.k}}$。
よって **${p.coeff}** です。
`;
    },
  };
}

export const binomialCoeffTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`binomial_coeff_basic_${i + 1}`, `係数 ${i + 1}`)
);
