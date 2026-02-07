// src/lib/course/templates/mathA/int_remainder_applied_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  statement: string;
  answer: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_remainder_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "remainder", "application"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: c.statement,
        answerKind: "numeric",
        params: { answer: c.answer },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { answer: number }).answer);
    },
    explain(params) {
      const a = (params as { answer: number }).answer;
      return `### この問題の解説\n答えは **${a}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "int_rem_app_1", title: "剰余の応用 1", statement: `$(10^2+10^3)$ を 7 で割った余りを求めよ。`, answer: 1 },
  { id: "int_rem_app_2", title: "剰余の応用 2", statement: `$(3^4+3^2)$ を 5 で割った余りを求めよ。`, answer: 0 },
  { id: "int_rem_app_3", title: "剰余の応用 3", statement: `$(2^6-2^3)$ を 7 で割った余りを求めよ。`, answer: 0 },
  { id: "int_rem_app_4", title: "剰余の応用 4", statement: `$(5^3+5)$ を 6 で割った余りを求めよ。`, answer: 4 },
];

export const intRemainderAppliedVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
