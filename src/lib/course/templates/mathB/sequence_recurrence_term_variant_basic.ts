// src/lib/course/templates/mathB/sequence_recurrence_term_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texJoin } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  kind: "arithmetic" | "geometric";
  a1: number;
  d?: number;
  r?: number;
  n: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const answer =
    c.kind === "arithmetic" ? c.a1 + (c.n - 1) * (c.d ?? 0) : c.a1 * Math.pow(c.r ?? 1, c.n - 1);
  const shift = texConst(c.d ?? 0);
  const recurrence = texJoin("a_{n+1}=a_n", shift);
  const statement =
    c.kind === "arithmetic"
      ? `毎回一定量ずつ変化する量を考える。$a_1=${c.a1}$, $${recurrence}$ を満たすとき、$a_${c.n}$ を求めよ。`
      : `毎回一定倍率で変化する量を考える。$a_1=${c.a1}$, $a_{n+1}=${c.r}a_n$ を満たすとき、$a_${c.n}$ を求めよ。`;
  return {
    meta: {
      id: c.id,
      topicId: "seq_recurrence_term_basic",
      title: c.title,
      difficulty: 1,
      tags: ["sequence", "recurrence", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "numeric",
        params: { answer },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { answer: number }).answer);
    },
    explain(params) {
      const ans = (params as { answer: number }).answer;
      return `### この問題の解説\n定義に従って計算すると $a_${c.n}=${ans}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "seq_rec_term_v1", title: "漸化式（別）1", kind: "arithmetic", a1: 2, d: 3, n: 5 },
  { id: "seq_rec_term_v2", title: "漸化式（別）2", kind: "arithmetic", a1: -1, d: 2, n: 6 },
  { id: "seq_rec_term_v3", title: "漸化式（別）3", kind: "geometric", a1: 3, r: 2, n: 4 },
  { id: "seq_rec_term_v4", title: "漸化式（別）4", kind: "geometric", a1: 1, r: 3, n: 3 },
];

export const sequenceRecurrenceTermVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
