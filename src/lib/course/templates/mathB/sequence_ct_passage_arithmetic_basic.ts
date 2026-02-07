// src/lib/course/templates/mathB/sequence_ct_passage_arithmetic_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a1: number;
  d: number;
  n: number;
  variant: "basic" | "mean" | "solve_n";
  nTarget?: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const an = c.a1 + (c.n - 1) * c.d;
  const anNext = c.a1 + c.n * c.d;
  const nTarget = c.variant === "solve_n" ? c.nTarget ?? c.n + 3 : null;
  const targetTerm = nTarget ? c.a1 + (nTarget - 1) * c.d : null;
  const sum = (c.n * (c.a1 + an)) / 2;
  const mean = (c.a1 + an) / 2;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$n=${c.n}$ のとき、$a_n$ を求めよ。`,
    c.variant === "mean"
      ? `（問2）$a_1$ と $a_{${c.n}}$ の平均を求めよ。`
      : c.variant === "solve_n"
      ? `（問2）$a_n=${targetTerm}$ となる $n$ を求めよ。`
      : `（問2）$n=${c.n + 1}$ のとき、$a_n$ を求めよ。`,
    `（問3）最初の ${c.n} 項の和を求めよ。`,
  ].join("\n");
  const subQuestions =
    c.variant === "mean"
      ? ([
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: `${c.n}項目` },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: `平均` },
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
      topicId: "seq_arithmetic_sum_basic",
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", an);
      const q2Correct =
        c.variant === "mean" ? mean : c.variant === "solve_n" ? nTarget ?? 0 : anNext;
      const q2Result = gradeNumeric(parsed.q2 ?? "", q2Correct);
      const q3Result = gradeNumeric(parsed.q3 ?? "", sum);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer:
          c.variant === "mean"
            ? `問1:${an} / 問2:${mean} / 問3:${sum}`
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
        c.variant === "mean"
          ? "平均は \\frac{a_1+a_n}{2}"
          : c.variant === "solve_n"
          ? "$a_n=a_1+(n-1)d$ から $n$ を逆算する"
          : "次の項は $a_{n+1}=a_1+nd$";
      const answers =
        c.variant === "mean"
          ? `**${an}**, **${mean}**, **${sum}**`
          : c.variant === "solve_n"
          ? `**${an}**, **${nTarget}**, **${sum}**`
          : `**${an}**, **${anNext}**, **${sum}**`;
      return `### この問題の解説\n等差数列で $a_1=${c.a1},\\ d=${c.d}$。\n$a_n=a_1+(n-1)d$、$S_n=\\frac{n}{2}(a_1+a_n)$ を用いる。\n${detail}。\n答えは ${answers}。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "seq_ct_passage_arith_1",
    title: "練習回数 連問 1",
    a1: 12,
    d: 3,
    n: 8,
    variant: "basic",
    context: "ある部活動では1日目に12回練習し、2日目以降は毎日3回ずつ増やす。",
    difficulty: 1,
  },
  {
    id: "seq_ct_passage_arith_2",
    title: "積立額 連問 2",
    a1: 2000,
    d: 500,
    n: 6,
    variant: "mean",
    context: "毎月の積立額が初月2000円で、以後毎月500円ずつ増える。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_arith_3",
    title: "通学時間 連問 3",
    a1: 24,
    d: -1,
    n: 10,
    variant: "basic",
    context: "通学時間は初日24分で、以後1日ごとに1分ずつ短くなる。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_arith_4",
    title: "歩数 連問 4",
    a1: 6500,
    d: 400,
    n: 5,
    variant: "mean",
    context: "1日目の歩数が6500歩で、以後毎日400歩ずつ増える。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_arith_5",
    title: "売上 連問 5",
    a1: 80,
    d: 6,
    n: 8,
    variant: "basic",
    context: "1日目の売上が80万円で、以後毎日6万円ずつ増える。",
    difficulty: 2,
  },
  {
    id: "seq_ct_passage_arith_6",
    title: "生産数 連問 6",
    a1: 120,
    d: -5,
    n: 6,
    variant: "solve_n",
    nTarget: 10,
    context: "初回の生産数が120個で、以後毎回5個ずつ減る。",
    difficulty: 3,
  },
  {
    id: "seq_ct_passage_arith_7",
    title: "点数 連問 7",
    a1: 55,
    d: 5,
    n: 9,
    variant: "solve_n",
    nTarget: 12,
    context: "1回目55点で、以後毎回5点ずつ上がる。",
    difficulty: 3,
  },
  {
    id: "seq_ct_passage_arith_8",
    title: "座席数 連問 8",
    a1: 24,
    d: 4,
    n: 7,
    variant: "mean",
    context: "初段が24席で、以後段ごとに4席ずつ増える。",
    difficulty: 3,
  },
];

export const sequenceCtPassageArithmeticTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
