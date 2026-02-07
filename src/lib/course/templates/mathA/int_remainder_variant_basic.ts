// src/lib/course/templates/mathA/int_remainder_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  n: number;
  m: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const r = ((c.n % c.m) + c.m) % c.m;
  return {
    meta: {
      id: c.id,
      topicId: "int_remainder_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "remainder"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.n} を ${c.m} で割った余りを求めよ。`,
        answerKind: "numeric",
        params: { r },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { r: number }).r);
    },
    explain(params) {
      const r = (params as { r: number }).r;
      return `### この問題の解説\n余りは **${r}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "int_rem_v1", title: "余り 1", n: 47, m: 6 },
  { id: "int_rem_v2", title: "余り 2", n: 125, m: 9 },
  { id: "int_rem_v3", title: "余り 3", n: 203, m: 7 },
  { id: "int_rem_v4", title: "余り 4", n: 154, m: 8 },
  { id: "int_rem_v5", title: "余り 5", n: 321, m: 11 },
];

export const intRemainderVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
