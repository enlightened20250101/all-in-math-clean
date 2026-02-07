// src/lib/course/templates/mathB/sequence_ct_passage_arithmetic_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  d: number;
  ak: number;
  k: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `等差数列で $a_1=${c.a1},\\ d=${c.d}$ とする。`,
    `（問1）$a_n=${c.ak}$ となる $n$ を求めよ。`,
    "（問2）$a_{n+1}$ を求めよ。",
    "（問3）最初の $n$ 項の和 $S_n$ を求めよ。",
  ].join("\n");

  const anNext = c.a1 + c.k * c.d;
  const sum = (c.k * (c.a1 + c.ak)) / 2;

  const subQuestions = [
    { id: "q1", label: "問1", answerKind: "numeric", placeholder: "n" },
    { id: "q2", label: "問2", answerKind: "numeric", placeholder: "a_{n+1}" },
    { id: "q3", label: "問3", answerKind: "numeric", placeholder: "S_n" },
  ] as const;

  return {
    meta: {
      id: c.id,
      topicId: "seq_arithmetic_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["sequence", "arithmetic", "ct", "passage"],
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", c.k);
      const q2Result = gradeNumeric(parsed.q2 ?? "", anNext);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${c.k} / 問2:${anNext} / 問3:${sum}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(c.k) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(anNext) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(sum) },
        },
      };
    },
    explain() {
      return "### この問題の解説\n$a_n=a_1+(n-1)d$ から n を求め、$a_{n+1}$ と $S_n$ を計算する。";
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_arith_back_1",
    title: "逆算 連問 1",
    a1: 3,
    d: 2,
    ak: 15,
    k: 7,
    context: "等差数列の一部の項が分かっている。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_arith_back_2",
    title: "逆算 連問 2",
    a1: 10,
    d: 4,
    ak: 42,
    k: 9,
    context: "等差数列で特定の項が与えられている。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_arith_back_3",
    title: "逆算 連問 3",
    a1: -5,
    d: 3,
    ak: 16,
    k: 8,
    context: "負の初項を含む等差数列を扱う。",
    difficulty: 3,
  },
];

export const sequenceCtPassageArithmeticBacksolveTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
