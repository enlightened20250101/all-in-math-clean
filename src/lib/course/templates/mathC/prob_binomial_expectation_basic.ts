// src/lib/course/templates/mathC/prob_binomial_expectation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type BinomParams = { n: number; p2: number; value: number };

function buildParams(): BinomParams {
  const n = pick([4, 6, 8, 10, 12, 14]);
  const p2 = pick([1, 2, 3]); // p = p2/4
  const value = (n * p2) / 4;
  return { n, p2, value };
}

function explain(params: BinomParams) {
  return `
### この問題の解説
二項分布 $X\\sim\\mathrm{Bin}(n,p)$ の期待値は
$$
E[X]=np
$$
です。$p=${params.p2}/4$ なので
$$
E[X]=${params.n}\\cdot \\frac{${params.p2}}{4}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "prob_binomial_expectation_basic",
      title,
      difficulty: 1,
      tags: ["probability", "binomial"],
    },
    generate() {
      const params = buildParams();
      const statement = `確率 $p=${params.p2}/4$ で成功する試行を ${params.n} 回行う。二項分布 $X\\sim\\mathrm{Bin}(${params.n},${params.p2}/4)$ の期待値 $E[X]$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as BinomParams).value);
    },
    explain(params) {
      return explain(params as BinomParams);
    },
  };
}

export const binomialExpectationTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`prob_binomial_expectation_basic_${i + 1}`, `二項分布期待値 ${i + 1}`)
);
