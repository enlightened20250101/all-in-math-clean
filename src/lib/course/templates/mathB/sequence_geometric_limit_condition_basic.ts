// src/lib/course/templates/mathB/sequence_geometric_limit_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texFrac } from "@/lib/format/tex";

type Params = {
  rNum: number;
  rDen: number;
  a1: number;
  a2: number;
  sum: number;
};

function buildParams(): Params {
  const r = pick([
    { n: 1, d: 2 },
    { n: 2, d: 3 },
    { n: 3, d: 4 },
  ]);
  const a1 = randInt(2, 8);
  const a2 = Math.round((a1 * r.n) / r.d);
  const sum = (a1 * r.d) / (r.d - r.n);
  return { rNum: r.n, rDen: r.d, a1, a2, sum };
}

export const sequenceGeometricLimitConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_geometric_limit_condition_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_geometric_limit_basic",
      title: `無限和（条件付き）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "geometric", "infinite", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列で $a_1=${params.a1},\\ a_2=${params.a2}$ のとき、無限和 $S$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).sum);
    },
    explain(params) {
      const p = params as Params;
      const r = texFrac(p.rNum, p.rDen);
      return `
### この問題の解説
公比は $r=\\dfrac{a_2}{a_1}=${r}$。$|r|<1$ より
$$
S=\\frac{a_1}{1-r}=${p.sum}
$$
答えは **${p.sum}** です。
`;
    },
  };
});
