// src/lib/course/templates/math2/calc_ct_passage_integral_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  c: number;
  l: number;
  r: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const F = (x: number) => (c.a * x ** 3) / 3 + (c.b * x ** 2) / 2 + c.c * x;
  const area = F(c.r) - F(c.l);
  const avg = area / (c.r - c.l);
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `関数 $f(x)=${c.a}x^2+${c.b}x+${c.c}$ とする。`,
    `（問1）区間 [${c.l},${c.r}] の定積分を求めよ。`,
    `（問2）区間 [${c.l},${c.r}] における平均値を求めよ。`,
    `（問3）$f(x)$ が 0 となる $x$ を 1 つ求めよ。`,
  ].join("\n");
  const root = c.c === 0 ? 0 : c.a === 0 ? -c.c / c.b : 0;
  return {
    meta: {
      id: c.id,
      topicId: "calc_integral_quadratic_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["calculus", "integral", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "定積分" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "平均値" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "解" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", area);
      const q2Result = gradeNumeric(parsed.q2 ?? "", avg);
      const q3Result = gradeNumeric(parsed.q3 ?? "", root);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${area} / 問2:${avg} / 問3:${root}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(area) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(avg) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(root) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n積分で面積を求め、平均値は区間の長さで割る。解は簡単な値を選んである。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "calc_ct_passage_integral_1",
    title: "積分 連問 1",
    a: 1,
    b: -2,
    c: 0,
    l: 0,
    r: 2,
    context: "二次関数の面積と平均値を考える。",
    difficulty: 2,
  },
  {
    id: "calc_ct_passage_integral_2",
    title: "積分 連問 2",
    a: 2,
    b: -4,
    c: 0,
    l: 1,
    r: 3,
    context: "二次関数の面積と平均値を考える。",
    difficulty: 3,
  },
];

export const calcCtPassageIntegralTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
