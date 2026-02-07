// src/lib/course/templates/mathB/sequence_arithmetic_sum_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a1: number;
  an: number;
  n: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const value = (c.n * (c.a1 + c.an)) / 2;
  return {
    meta: {
      id: c.id,
      topicId: "seq_arithmetic_sum_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "sum", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `等差数列で初項 $a_1=${c.a1}$、第${c.n}項 $a_${c.n}=${c.an}$ のとき、和 $S_${c.n}$ を求めよ。`,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const value = (params as { value: number }).value;
      return `
### この問題の解説
等差数列の和は
$$
S_n=\\frac{n}{2}(a_1+a_n)
$$
なので $S_${c.n}=${value}$。
`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_sum_v1", title: "和（a1, an）1", a1: 2, an: 20, n: 10 },
  { id: "seq_sum_v2", title: "和（a1, an）2", a1: 3, an: 15, n: 8 },
  { id: "seq_sum_v3", title: "和（a1, an）3", a1: -4, an: 8, n: 7 },
  { id: "seq_sum_v4", title: "和（a1, an）4", a1: 5, an: 29, n: 13 },
];

export const sequenceArithmeticSumVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
