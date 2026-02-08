// src/lib/course/templates/mathB/sequence_general_term_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a1: number;
  d: number;
  n: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const an = c.a1 + (c.n - 1) * c.d;
  return {
    meta: {
      id: c.id,
      topicId: "seq_arithmetic_diff_from_terms_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "general-term", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement:
          `調査で得た数列として、一定の差で増減する記録を等差数列とみなす。` +
          `$a_1=${c.a1}$, 公差 $d=${c.d}$ のとき、$a_${c.n}$ を求めよ。`,
        answerKind: "numeric",
        params: { an },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { an: number }).an);
    },
    explain(params) {
      const an = (params as { an: number }).an;
      return `### この問題の解説\n$a_n=a_1+(n-1)d$ より $a_${c.n}=${an}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_term_v1", title: "一般項 1", a1: 2, d: 3, n: 6 },
  { id: "seq_term_v2", title: "一般項 2", a1: -1, d: 2, n: 5 },
  { id: "seq_term_v3", title: "一般項 3", a1: 4, d: -2, n: 7 },
  { id: "seq_term_v4", title: "一般項 4", a1: 0, d: 5, n: 4 },
];

export const sequenceGeneralTermVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
