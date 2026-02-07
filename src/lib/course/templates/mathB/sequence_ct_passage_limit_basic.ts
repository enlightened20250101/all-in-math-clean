// src/lib/course/templates/mathB/sequence_ct_passage_limit_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  r: number;
  k: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const an = c.a1 * Math.pow(c.r, c.k - 1);
  const anNext = c.a1 * Math.pow(c.r, c.k);
  const sum = c.a1 / (1 - c.r);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。なお、$|r|<1$ とする。",
    c.context,
    `（問1）$n=${c.k}$ のとき、$a_n$ を求めよ。`,
    `（問2）$n=${c.k + 1}$ のとき、$a_n$ を求めよ。`,
    "（問3）無限和 $S=\\sum_{n=1}^{\\infty} a_n$ を求めよ。",
  ].join("\n");
  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: `${c.k}項目` },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: `${c.k + 1}項目` },
    { id: "q3", label: "問3", answerKind: "numeric", placeholder: `無限和` },
  ] as const;
  return {
    meta: {
      id: c.id,
      topicId: "seq_geometric_limit_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["sequence", "geometric", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [...subQuestions],
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", an);
      const q2Result = gradeNumeric(parsed.q2 ?? "", anNext);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${an} / 問2:${anNext} / 問3:${sum}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(an) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(anNext) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(sum) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n等比数列で $a_1=${c.a1},\\ r=${c.r}$。\n$a_n=a_1r^{n-1}$、無限和は $S=\\frac{a_1}{1-r}$。\n答えは **${an}**, **${anNext}**, **${sum}**。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_limit_1",
    title: "無限和 連問 1",
    a1: 12,
    r: 0.5,
    k: 4,
    context: "ある数列は初項12で、公比は1/2である。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_limit_2",
    title: "無限和 連問 2",
    a1: 15,
    r: 0.2,
    k: 3,
    context: "ある数列は初項15で、公比は1/5である。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_limit_3",
    title: "無限和 連問 3",
    a1: 18,
    r: 0.5,
    k: 5,
    context: "ある数列は初項18で、公比は1/2である。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_limit_4",
    title: "無限和 連問 4",
    a1: 20,
    r: 0.4,
    k: 4,
    context: "ある数列は初項20で、公比は2/5である。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_limit_5",
    title: "無限和 連問 5",
    a1: 30,
    r: 0.5,
    k: 4,
    context: "ある数列は初項30で、公比は1/2である。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_limit_6",
    title: "無限和 連問 6",
    a1: 24,
    r: 0.2,
    k: 3,
    context: "ある数列は初項24で、公比は1/5である。",
    difficulty: 2,
  },
];

export const sequenceCtPassageLimitTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
