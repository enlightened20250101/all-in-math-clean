// src/lib/course/templates/math2/calc_ct_passage_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const f = (x: number) => c.a * x * x + c.b * x;
  const fp = (x: number) => 2 * c.a * x + c.b;
  const value = f(c.x);
  const slope = fp(c.x);
  const intercept = value - slope * c.x;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `関数 $f(x)=${c.a}x^2+${c.b}x$ とする。`,
    `（問1）$x=${c.x}$ における $f(x)$ を求めよ。`,
    `（問2）$x=${c.x}$ における接線の傾きを求めよ。`,
    `（問3）接線を $y=mx+k$ としたときの $k$ を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "calc_tangent_line_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["calculus", "tangent", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "f(x)" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "傾き" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "切片" },
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
      const q2Result = gradeNumeric(parsed.q2 ?? "", slope);
      const q3Result = gradeNumeric(parsed.q3 ?? "", intercept);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${value} / 問2:${slope} / 問3:${intercept}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(value) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(slope) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(intercept) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n$f'(x)=2ax+b$ を使う。接線は $y=f'(x_0)(x-x_0)+f(x_0)$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "calc_ct_passage_1",
    title: "接線 連問 1",
    a: 1,
    b: -4,
    x: 2,
    context: "放物線の接線を調べる。",
    difficulty: 2,
  },
  {
    id: "calc_ct_passage_2",
    title: "接線 連問 2",
    a: 2,
    b: 3,
    x: 1,
    context: "放物線の接線を調べる。",
    difficulty: 3,
  },
];

export const calcCtPassageTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
