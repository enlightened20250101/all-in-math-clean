// src/lib/course/templates/mathB/sequence_term_from_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type SumParams = {
  s1: number;
  s2: number;
  an: number;
};

const CASES: SumParams[] = [
  { s1: 6, s2: 10, an: 4 },
  { s1: 3, s2: 9, an: 6 },
  { s1: 7, s2: 12, an: 5 },
  { s1: 10, s2: 15, an: 5 },
];

function buildParams(): SumParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_term_from_sum_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "sum", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `累積記録から当日の値を求める場面を想定する。` +
        `$S_{n-1}=${params.s1}$, $S_n=${params.s2}$ のとき、$a_n$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SumParams).an);
    },
    explain(params) {
      const p = params as SumParams;
      return `
### この問題の解説
$a_n=S_n-S_{n-1}$ なので $${p.s2}-${p.s1}=${p.an}$ です。
答えは **${p.an}** です。
`;
    },
  };
}

export const sequenceTermFromSumTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_term_from_sum_basic_${i + 1}`, `和から項 ${i + 1}`)
);
