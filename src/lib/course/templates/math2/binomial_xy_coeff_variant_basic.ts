// src/lib/course/templates/math2/binomial_xy_coeff_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

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
  a: number;
  b: number;
  n: number;
  k: number;
  coeff: number;
};

function buildParams(): Params {
  const a = pick([1, 2, 3, 4]);
  const b = pick([1, 2, 3, 4]);
  const n = pick([4, 5, 6]);
  const k = randInt(0, n);
  const coeff = comb(n, k) * Math.pow(a, k) * Math.pow(b, n - k);
  return { a, b, n, k, coeff };
}

export const binomialXyCoeffVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `binomial_xy_coeff_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "binomial_xy_coeff_basic",
      title: `係数（係数付き）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const xTerm = texTerm(params.a, "x", true);
      const yTerm = texTerm(params.b, "y", false);
      const base = `${xTerm}${yTerm ? ` ${yTerm}` : ""}`;
      const statement = `$(${base})^{${params.n}}$ の $x^{${params.k}}y^{${params.n - params.k}}$ の係数を求めよ。`;
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
係数は $\\binom{${p.n}}{${p.k}} ${p.a}^{${p.k}} ${p.b}^{${p.n - p.k}}$。
よって **${p.coeff}** です。
`;
    },
  };
});
