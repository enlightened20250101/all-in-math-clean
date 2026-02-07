// src/lib/course/templates/math2/exp_log_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  r: number;
  n: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const value = c.a * Math.pow(c.r, c.n);
  const logValue = Math.log(value) / Math.log(c.r);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `（問1）$n=${c.n}$ のときの値を求めよ。`,
    `（問2）値が ${value} となるときの $n$ を求めよ。`,
    "（問3）$\\log_{r}(値)$ を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "exp_log_growth_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["exp_log", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "値" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "n" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "log" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", value);
      const q2Result = gradeNumeric(parsed.q2 ?? "", c.n);
      const q3Result = gradeNumeric(parsed.q3 ?? "", logValue);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${value} / 問2:${c.n} / 問3:${logValue}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(value) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(c.n) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(logValue) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n指数の基本形 $a r^n$ を使い、同値な式から $n$ を求める。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "exp_log_ct_passage_1",
    title: "指数成長 連問 1",
    a: 2,
    r: 3,
    n: 4,
    context: "ある量が初期値2で、1回ごとに3倍になる。",
    difficulty: 2,
  },
  {
    id: "exp_log_ct_passage_2",
    title: "指数成長 連問 2",
    a: 5,
    r: 2,
    n: 6,
    context: "ある量が初期値5で、1回ごとに2倍になる。",
    difficulty: 3,
  },
];

export const expLogCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
