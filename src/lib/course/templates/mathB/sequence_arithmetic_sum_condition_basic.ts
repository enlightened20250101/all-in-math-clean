// src/lib/course/templates/mathB/sequence_arithmetic_sum_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  a1: number;
  d: number;
  n: number;
  sn: number;
};

function buildParams(): Params {
  const a1 = randInt(1, 6);
  const d = randInt(1, 4);
  const n = randInt(3, 8);
  const sn = (n * (2 * a1 + (n - 1) * d)) / 2;
  return { a1, d, n, sn };
}

export const sequenceArithmeticSumConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_arithmetic_sum_condition_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_arithmetic_sum_from_terms_basic",
      title: `等差数列の和（条件付き）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "sum", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `一定の差で増える量の合計を考える。` +
        `$a_1=${params.a1}$, 公差 $d=${params.d}$ のとき、$S_${params.n}$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).sn);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
等差数列の和は
$$
S_n=\\frac{n}{2}(2a_1+(n-1)d)
$$
より
$$
S_${p.n}=${p.sn}
$$
答えは **${p.sn}** です。
`;
    },
  };
});
