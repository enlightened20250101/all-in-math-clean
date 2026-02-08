// src/lib/course/templates/mathA/int_remainder_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  n: number;
  m: number;
  context?: string;
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
      const lead = c.context ? `${c.context}\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}${c.n} を ${c.m} で割った余りを求めよ。`,
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
  { id: "int_rem_v1", title: "余り 1", n: 47, m: 6, context: "47個の飴を6人で同じ数ずつ分けるとき、余りは何個か。" },
  { id: "int_rem_v2", title: "余り 2", n: 125, m: 9, context: "125枚のプリントを9人に配るときの余りを考える。" },
  { id: "int_rem_v3", title: "余り 3", n: 203, m: 7, context: "203人を7列に並べるとき、余り人数は何人か。" },
  { id: "int_rem_v4", title: "余り 4", n: 154, m: 8, context: "154ページの本を8ページずつ読むとき、最後に余るページ数は何ページか。" },
  { id: "int_rem_v5", title: "余り 5", n: 321, m: 11, context: "321個の部品を11箱に同数ずつ入れるときの余りを求めよ。" },
];

export const intRemainderVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
