// src/lib/course/templates/mathB/sequence_ct_passage_geometric_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  r: number;
  n: number;
  variant: "basic" | "ratio" | "solve_n";
  nTarget?: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const an = c.a1 * Math.pow(c.r, c.n - 1);
  const anNext = c.a1 * Math.pow(c.r, c.n);
  const nTarget = c.variant === "solve_n" ? c.nTarget ?? c.n + 2 : null;
  const targetTerm = nTarget ? c.a1 * Math.pow(c.r, nTarget - 1) : null;
  const sum = c.r === 1 ? c.a1 * c.n : (c.a1 * (Math.pow(c.r, c.n) - 1)) / (c.r - 1);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$n=${c.n}$ のとき、$a_n$ を求めよ。`,
    c.variant === "ratio"
      ? "（問2）$\\dfrac{a_{n+1}}{a_n}$ を求めよ。"
      : c.variant === "solve_n"
      ? `（問2）$a_n=${targetTerm}$ となる $n$ を求めよ。`
      : `（問2）$n=${c.n + 1}$ のとき、$a_n$ を求めよ。`,
    `（問3）最初の ${c.n} 項の和を求めよ。`,
  ].join("\n");
  const subQuestions =
    c.variant === "ratio"
      ? ([
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `${c.n}項目` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `比` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `和` },
        ] as const)
      : c.variant === "solve_n"
      ? ([
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `${c.n}項目` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `n` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `和` },
        ] as const)
      : ([
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `${c.n}項目` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `${c.n + 1}項目` },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: `和` },
        ] as const);
  return {
    meta: {
      id: c.id,
      topicId: "seq_geometric_sum_basic",
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
      const q2Correct =
        c.variant === "ratio" ? c.r : c.variant === "solve_n" ? nTarget ?? 0 : anNext;
      const q2Result = gradeNumeric(parsed.q2 ?? "", q2Correct);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer:
          c.variant === "ratio"
            ? `問1:${an} / 問2:${c.r} / 問3:${sum}`
            : c.variant === "solve_n"
            ? `問1:${an} / 問2:${nTarget} / 問3:${sum}`
            : `問1:${an} / 問2:${anNext} / 問3:${sum}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(an) },
          q2: {
            isCorrect: q2Result.isCorrect,
            correctAnswer: String(q2Correct),
          },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(sum) },
        },
      };
    },
    explain() {
      const detail =
        c.variant === "ratio"
          ? "比は $\\dfrac{a_{n+1}}{a_n}=r$"
          : c.variant === "solve_n"
          ? "$a_n=a_1r^{n-1}$ から $n$ を逆算する"
          : "次の項は $a_{n+1}=a_1r^n$";
      const answers =
        c.variant === "ratio"
          ? `**${an}**, **${c.r}**, **${sum}**`
          : c.variant === "solve_n"
          ? `**${an}**, **${nTarget}**, **${sum}**`
          : `**${an}**, **${anNext}**, **${sum}**`;
      return `### この問題の解説\n等比数列で $a_1=${c.a1},\\ r=${c.r}$。\n$a_n=a_1r^{n-1}$、$S_n=\\frac{a_1(r^n-1)}{r-1}$ を用いる。\n${detail}。\n答えは ${answers}。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_geo_1",
    title: "倍率成長 連問 1",
    a1: 3,
    r: 2,
    n: 8,
    variant: "basic",
    context: "ある数列は初項3で、以後毎回2倍になる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_2",
    title: "倍率成長 連問 2",
    a1: 5,
    r: 3,
    n: 6,
    variant: "ratio",
    context: "ある数列は初項5で、以後毎回3倍になる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_3",
    title: "減衰 連問 3",
    a1: 96,
    r: 0.5,
    n: 7,
    variant: "basic",
    context: "毎回の使用量が初回96で、以後半分ずつになる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_4",
    title: "減衰 連問 4",
    a1: 128,
    r: 0.5,
    n: 6,
    variant: "ratio",
    context: "毎回の使用量が初回128で、以後半分ずつになる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_5",
    title: "倍率成長 連問 5",
    a1: 8,
    r: 1.5,
    n: 7,
    variant: "basic",
    context: "数が初め8で、毎回1.5倍になる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_6",
    title: "倍率成長 連問 6",
    a1: 4,
    r: 2,
    n: 9,
    variant: "solve_n",
    nTarget: 6,
    context: "数が初め4で、毎回2倍になる。",
    difficulty: 3,
  },
  {
    id: "seq_ct_passage_geo_7",
    title: "減衰 連問 7",
    a1: 60,
    r: 0.5,
    n: 5,
    variant: "basic",
    context: "毎回の使用量が初回60で、以後半分ずつになる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_geo_8",
    title: "減衰 連問 8",
    a1: 81,
    r: 0.5,
    n: 6,
    variant: "ratio",
    context: "毎回の使用量が初回81で、以後半分ずつになる。",
    difficulty: 3,
  },
];

export const sequenceCtPassageGeometricTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
