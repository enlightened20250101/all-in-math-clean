// src/lib/course/templates/mathB/sequence_ct_passage_compare_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  d: number;
  b1: number;
  r: number;
  n: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const an = c.a1 + (c.n - 1) * c.d;
  const bn = c.b1 * Math.pow(c.r, c.n - 1);
  const compare = an > bn ? 1 : an < bn ? -1 : 0;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$n=${c.n}$ のとき、$a_n$ を求めよ。`,
    `（問2）$n=${c.n}$ のとき、$b_n$ を求めよ。`,
    `（問3）$a_n$ と $b_n$ を比較し、$a_n>b_n$ なら 1、$a_n=b_n$ なら 0、$a_n<b_n$ なら -1 を答えよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "seq_geometric_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["sequence", "comparison", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `a${c.n}` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `b${c.n}` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "比較" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", an);
      const q2Result = gradeNumeric(parsed.q2 ?? "", bn);
      const q3Result = gradeNumeric(parsed.q3 ?? "", compare);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${an} / 問2:${bn} / 問3:${compare}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(an) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(bn) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(compare) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n$a_n=a_1+(n-1)d$、$b_n=b_1 r^{n-1}$ を計算して比較する。\n答えは **${an}**, **${bn}**, **${compare}**。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_compare_1",
    title: "等差と等比の比較 1",
    a1: 8,
    d: 3,
    b1: 5,
    r: 2,
    n: 4,
    context: "ある等差数列 $a_n$ と等比数列 $b_n$ を比較する。", 
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_compare_2",
    title: "等差と等比の比較 2",
    a1: 20,
    d: -2,
    b1: 18,
    r: 0.5,
    n: 5,
    context: "数列 $a_n$ は初項20、公差-2。数列 $b_n$ は初項18、公比1/2。",
    difficulty: 3,
  },
  {
    id: "seq_ct_passage_compare_3",
    title: "等差と等比の比較 3",
    a1: 4,
    d: 4,
    b1: 3,
    r: 3,
    n: 3,
    context: "等差数列と等比数列の同じ項を比べる。", 
    difficulty: 2,
  },
];

export const sequenceCtPassageCompareTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
