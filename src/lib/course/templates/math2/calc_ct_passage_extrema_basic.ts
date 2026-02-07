// src/lib/course/templates/math2/calc_ct_passage_extrema_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const vertexX = -c.b / (2 * c.a);
  const vertexY = c.a * vertexX * vertexX + c.b * vertexX + c.c;
  const derivative = (x: number) => 2 * c.a * x + c.b;
  const slopeAt0 = derivative(0);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `関数 $f(x)=${c.a}x^2+${c.b}x+${c.c}$ とする。`,
    "（問1）極値をとる $x$ を求めよ。",
    "（問2）そのときの極値を求めよ。",
    "（問3）$x=0$ における増減（増加なら1、減少なら-1、変化なしなら0）を答えよ。",
  ].join("\\n");
  const slopeSign = slopeAt0 > 0 ? 1 : slopeAt0 < 0 ? -1 : 0;
  return {
    meta: {
      id: c.id,
      topicId: "calc_extrema_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["calculus", "extrema", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "x" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "極値" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "増減" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", vertexX);
      const q2Result = gradeNumeric(parsed.q2 ?? "", vertexY);
      const q3Result = gradeNumeric(parsed.q3 ?? "", slopeSign);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${vertexX} / 問2:${vertexY} / 問3:${slopeSign}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(vertexX) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(vertexY) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(slopeSign) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n極値は導関数 $2ax+b=0$ から求める。増減は $f'(0)$ の符号で判定。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "calc_ct_passage_extrema_1",
    title: "極値 連問 1",
    a: 1,
    b: -4,
    c: 3,
    context: "二次関数の極値と増減を調べる。",
    difficulty: 2,
  },
  {
    id: "calc_ct_passage_extrema_2",
    title: "極値 連問 2",
    a: -2,
    b: 8,
    c: 1,
    context: "二次関数の極値と増減を調べる。",
    difficulty: 3,
  },
];

export const calcCtPassageExtremaTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
