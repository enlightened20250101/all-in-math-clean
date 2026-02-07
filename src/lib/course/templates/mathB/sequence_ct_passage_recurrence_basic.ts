// src/lib/course/templates/mathB/sequence_ct_passage_recurrence_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  step: number;
  ratio?: number;
  kind: "add" | "mul";
  n1: number;
  n2: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const a2 = c.kind === "add" ? c.a1 + c.step : c.a1 * (c.ratio ?? 1);
  const aN1 =
    c.kind === "add"
      ? c.a1 + (c.n1 - 1) * c.step
      : c.a1 * Math.pow(c.ratio ?? 1, c.n1 - 1);
  const aN2 =
    c.kind === "add"
      ? c.a1 + (c.n2 - 1) * c.step
      : c.a1 * Math.pow(c.ratio ?? 1, c.n2 - 1);
  const sum =
    c.kind === "add"
      ? (c.n2 * (c.a1 + aN2)) / 2
      : c.ratio === 1
      ? c.a1 * c.n2
      : (c.a1 * (1 - Math.pow(c.ratio ?? 1, c.n2))) / (1 - (c.ratio ?? 1));
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$a_2$ を求めよ。`,
    `（問2）$a_{${c.n1}}$ を求めよ。`,
    `（問3）最初の ${c.n2} 項の和を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "seq_recurrence_term_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["sequence", "recurrence", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "a2" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `a${c.n1}` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `S${c.n2}` },
        ],
        params: {},
      };
    },
    grade(_params, userAnswer) {
      let parsed: Record<string, string> = {};
      try {
        parsed = JSON.parse(userAnswer) as Record<string, string>;
      } catch {
        parsed = {};
      }
      const q1Result = gradeNumeric(parsed.q1 ?? "", a2);
      const q2Result = gradeNumeric(parsed.q2 ?? "", aN1);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${a2} / 問2:${aN1} / 問3:${sum}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(a2) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(aN1) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(sum) },
        },
      };
    },
    explain() {
      const seqLine =
        c.kind === "add"
          ? `等差型の漸化式で $a_{n+1}=a_n+${c.step}$。`
          : `等比型の漸化式で $a_{n+1}=${c.ratio}\,a_n$。`;
      return `### この問題の解説\n${seqLine}\n最初の数項を計算し、$a_n$ と $S_n$ の公式で求める。\n答えは **${a2}**, **${aN1}**, **${sum}**。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_recur_1",
    title: "貯金額 連問",
    a1: 5,
    step: 3,
    kind: "add",
    n1: 6,
    n2: 6,
    context: "毎週の貯金額が初週5千円で、以後毎週3千円ずつ増える。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_recur_2",
    title: "細胞数 連問",
    a1: 2,
    step: 0,
    ratio: 3,
    kind: "mul",
    n1: 4,
    n2: 4,
    context: "ある細胞数は初め2で、毎回3倍になる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_recur_3",
    title: "来客数 連問",
    a1: 28,
    step: -2,
    kind: "add",
    n1: 8,
    n2: 8,
    context: "1日目の来客数は28人で、以後毎日2人ずつ減る。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_recur_4",
    title: "機械台数 連問",
    a1: 4,
    step: 0,
    ratio: 2,
    kind: "mul",
    n1: 5,
    n2: 5,
    context: "機械の台数が初期4台で、毎回2倍になる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_recur_5",
    title: "走行距離 連問",
    a1: 12,
    step: 4,
    kind: "add",
    n1: 7,
    n2: 7,
    context: "1回目の走行距離が12kmで、以後4kmずつ増やす。",
    difficulty: 3,
  },
];

export const sequenceCtPassageRecurrenceTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
