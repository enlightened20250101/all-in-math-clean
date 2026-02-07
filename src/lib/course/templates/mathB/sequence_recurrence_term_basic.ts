// src/lib/course/templates/mathB/sequence_recurrence_term_basic.ts
import type { QuestionTemplate } from "../../types";
import { texConst, texJoin } from "@/lib/format/tex";

type ArithmeticCase = { kind: "arithmetic"; a1: number; d: number; n: number };
type GeometricCase = { kind: "geometric"; a1: number; r: number; n: number };
type RecurrenceCase = ArithmeticCase | GeometricCase;

const CASES: RecurrenceCase[] = [
  { kind: "arithmetic", a1: 3, d: 2, n: 4 },
  { kind: "arithmetic", a1: 5, d: -1, n: 5 },
  { kind: "arithmetic", a1: -2, d: 3, n: 4 },
  { kind: "geometric", a1: 2, r: 3, n: 4 },
  { kind: "geometric", a1: -3, r: 2, n: 4 },
  { kind: "geometric", a1: 4, r: -2, n: 3 },
];

type RecurrenceParams = {
  caseId: number;
  answer: number;
};

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_recurrence_term_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "recurrence", "ct"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      let statement: string;
      let answer: number;
      if (c.kind === "arithmetic") {
        const shift = texConst(c.d);
        const recurrence = texJoin("a_{n+1}=a_n", shift);
        statement = `数列 $\\{a_n\\}$ が $a_1=${c.a1}$, $${recurrence}$ を満たすとき、$a_${c.n}$ を求めよ。`;
        answer = c.a1 + (c.n - 1) * c.d;
      } else {
        statement = `数列 $\\{a_n\\}$ が $a_1=${c.a1}$, $a_{n+1}=${c.r}a_n$ を満たすとき、$a_${c.n}$ を求めよ。`;
        answer = c.a1 * Math.pow(c.r, c.n - 1);
      }
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { caseId, answer },
      };
    },
    grade(params, userAnswer) {
      const correct = (params as RecurrenceParams).answer;
      const user = Number(userAnswer);
      return { isCorrect: !Number.isNaN(user) && user === correct, correctAnswer: String(correct) };
    },
    explain(params) {
      const p = params as RecurrenceParams;
      const c = CASES[p.caseId] ?? CASES[0];
      const answer = p.answer;
      return `
### この問題の解説
定義に従って順に求めると $a_${c.n}=${answer}$ です。
答えは **${answer}** です。
`;
    },
  };
}

export const sequenceRecurrenceTermTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_recurrence_term_basic_${i + 1}`, `漸化式 ${i + 1}`)
);
