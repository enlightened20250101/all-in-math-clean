// src/lib/course/templates/mathB/sequence_recurrence_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texJoin } from "@/lib/format/tex";

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
      topicId: "seq_recurrence_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "recurrence", "ct"],
    },
    generate() {
      const shift = texConst(c.d);
      const recurrence = texJoin("a_{n+1}=a_n", shift);
      return {
        templateId: c.id,
        statement:
          `毎回同じ増減がある記録を漸化式で表す。` +
          `$${recurrence}$、$a_1=${c.a1}$ を満たすとき、$a_${c.n}$ を求めよ。`,
        answerKind: "numeric",
        params: { an },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { an: number }).an);
    },
    explain(params) {
      const an = (params as { an: number }).an;
      return `### この問題の解説\n等差数列なので $a_n=a_1+(n-1)d$。$a_${c.n}=${an}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_rec_v1", title: "漸化式 1", a1: 3, d: 2, n: 6 },
  { id: "seq_rec_v2", title: "漸化式 2", a1: 5, d: -1, n: 4 },
  { id: "seq_rec_v3", title: "漸化式 3", a1: -2, d: 3, n: 5 },
  { id: "seq_rec_v4", title: "漸化式 4", a1: 1, d: 4, n: 3 },
];

export const sequenceRecurrenceVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
