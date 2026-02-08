// src/lib/course/templates/mathB/sequence_geometric_sum_n_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type SumParams = {
  a1: number;
  r: number;
  n: number;
  sum: number;
};

const CASES: SumParams[] = [
  { a1: 2, r: 2, n: 3, sum: 14 },
  { a1: 1, r: 3, n: 3, sum: 13 },
  { a1: 3, r: 2, n: 4, sum: 45 },
  { a1: 2, r: 3, n: 2, sum: 8 },
];

function buildParams(): SumParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_geometric_sum_n_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `一定の倍率で増減する量の合計を考える。` +
        `$a_1=${params.a1}$, $r=${params.r}$ のとき、$S_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SumParams).sum);
    },
    explain(params) {
      const p = params as SumParams;
      return `
### この問題の解説
等比数列の和は $S_n=a_1\\frac{1-r^n}{1-r}$ なので $S_${p.n}=${p.sum}$ です。
答えは **${p.sum}** です。
`;
    },
  };
}

export const sequenceGeometricSumNTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_geometric_sum_n_basic_${i + 1}`, `等比数列の和 ${i + 1}`)
);
