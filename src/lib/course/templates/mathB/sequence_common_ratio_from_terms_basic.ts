// src/lib/course/templates/mathB/sequence_common_ratio_from_terms_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type RatioParams = {
  a1: number;
  a3: number;
  r: number;
};

const CASES: RatioParams[] = [
  { a1: 2, r: 2, a3: 8 },
  { a1: 3, r: 3, a3: 27 },
  { a1: 5, r: 2, a3: 20 },
  { a1: 4, r: 3, a3: 36 },
];

function buildParams(): RatioParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_common_ratio_from_terms_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列で $a_1=${params.a1}$, $a_3=${params.a3}$ のとき、公比 $r$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as RatioParams).r);
    },
    explain(params) {
      const p = params as RatioParams;
      return `
### この問題の解説
等比数列では $a_3=a_1 r^2$ なので
$$
${p.a3}=${p.a1}r^2
$$
より $r=${p.r}$ です。答えは **${p.r}** です。
`;
    },
  };
}

export const sequenceCommonRatioFromTermsTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_common_ratio_from_terms_basic_${i + 1}`, `公比 ${i + 1}`)
);
