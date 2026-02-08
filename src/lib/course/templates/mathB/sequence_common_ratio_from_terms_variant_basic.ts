// src/lib/course/templates/mathB/sequence_common_ratio_from_terms_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a2: number;
  a5: number;
  r: number;
};

function buildParams(): Params {
  const r = pick([2, 3]);
  const a2 = randInt(1, 6);
  const a5 = a2 * Math.pow(r, 3);
  return { a2, a5, r };
}

export const sequenceCommonRatioFromTermsVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_common_ratio_from_terms_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_common_ratio_from_terms_basic",
      title: `公比（条件違い）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `同じ倍率で変化する量を考える。` +
        `$a_2=${params.a2}$, $a_5=${params.a5}$ のとき、公比 $r$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
等比数列では $a_5=a_2 r^3$ なので
$$
${p.a5}=${p.a2}r^3
$$
より $r=${p.r}$。答えは **${p.r}** です。
`;
    },
  };
});
