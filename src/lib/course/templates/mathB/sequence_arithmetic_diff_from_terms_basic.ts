// src/lib/course/templates/mathB/sequence_arithmetic_diff_from_terms_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type DiffParams = {
  a1: number;
  a4: number;
  d: number;
};

const CASES: DiffParams[] = [
  { a1: 2, a4: 11, d: 3 },
  { a1: -1, a4: 8, d: 3 },
  { a1: 5, a4: 14, d: 3 },
  { a1: 0, a4: 6, d: 2 },
  { a1: 3, a4: 12, d: 3 },
  { a1: -2, a4: 7, d: 3 },
  { a1: 4, a4: 13, d: 3 },
  { a1: 1, a4: 7, d: 2 },
];

function buildParams(): DiffParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_arithmetic_diff_from_terms_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `一定の差で増える記録を考える。` +
        `$a_1=${params.a1}$, $a_4=${params.a4}$ のとき、公差 $d$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).d);
    },
    explain(params) {
      const p = params as DiffParams;
      return `
### この問題の解説
等差数列では $a_4=a_1+3d$ なので
$$
${p.a4}=${p.a1}+3d
$$
より $d=${p.d}$ です。答えは **${p.d}** です。
`;
    },
  };
}

export const sequenceArithmeticDiffFromTermsTemplates: QuestionTemplate[] = Array.from({ length: 60 }, (_, i) =>
  buildTemplate(`seq_arithmetic_diff_from_terms_basic_${i + 1}`, `公差 ${i + 1}`)
);
