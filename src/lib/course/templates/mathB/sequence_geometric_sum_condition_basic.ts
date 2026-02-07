// src/lib/course/templates/mathB/sequence_geometric_sum_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a1: number;
  r: number;
  n: number;
  sn: number;
};

function buildParams(): Params {
  const a1 = randInt(1, 5);
  const r = pick([2, 3]);
  const n = randInt(3, 6);
  const sn = a1 * (Math.pow(r, n) - 1) / (r - 1);
  return { a1, r, n, sn };
}

export const sequenceGeometricSumConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_geometric_sum_condition_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_geometric_sum_basic",
      title: `等比数列の和（条件付き）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "sum", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列で $a_1=${params.a1}$, 公比 $r=${params.r}$ のとき、$S_${params.n}$ を求めよ。`;
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
等比数列の和は
$$
S_n=a_1\\frac{r^n-1}{r-1}
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
