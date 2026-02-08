// src/lib/course/templates/math2/binomial_middle_coeff_basic.ts
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
  coeff: number;
};

function buildParams(): Params {
  const n = pick([4, 6, 8]);
  const k = n / 2;
  const coeff = comb(n, k);
  return { n, coeff };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "binomial_middle_coeff_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `組合せの数え上げとして、展開式 $(x+y)^{${params.n}}$ の中央項の係数を求めよ。`;
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
$n$ が偶数のとき中央項は $\binom{n}{n/2}$。
よって **${p.coeff}** です。
`;
    },
  };
}

export const binomialMiddleCoeffTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`binomial_middle_coeff_basic_${i + 1}`, `中央項 ${i + 1}`)
);
