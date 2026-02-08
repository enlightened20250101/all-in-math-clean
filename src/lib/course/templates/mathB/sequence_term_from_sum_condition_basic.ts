// src/lib/course/templates/mathB/sequence_term_from_sum_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  sPrev: number;
  sNow: number;
  an: number;
};

function buildParams(): Params {
  const an = randInt(2, 12);
  const sPrev = randInt(5, 20);
  const sNow = sPrev + an;
  return { sPrev, sNow, an };
}

export const sequenceTermFromSumConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_term_from_sum_condition_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_term_from_sum_basic",
      title: `和から項（条件付き）${i + 1}`,
      difficulty: 1,
      tags: ["sequence", "sum", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `累積値の差から当日の量を求める場面を想定する。` +
        `$S_{n-1}=${params.sPrev}$, $S_n=${params.sNow}$ のとき、$a_n$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).an);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$a_n=S_n-S_{n-1}$ より
$$
${p.sNow}-${p.sPrev}=${p.an}
$$
答えは **${p.an}** です。
`;
    },
  };
});
