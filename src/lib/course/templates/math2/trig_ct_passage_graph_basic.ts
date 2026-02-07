// src/lib/course/templates/math2/trig_ct_passage_graph_basic.ts
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
  const max = c.b + Math.abs(c.a);
  const min = c.b - Math.abs(c.a);
  const period = 2 * Math.PI / c.c;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `関数 $y=${c.a}\\sin(${c.c}x)+${c.b}$ とする。`,
    "（問1）最大値を求めよ。",
    "（問2）最小値を求めよ。",
    "（問3）周期を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_range_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["trig", "graph", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "最大" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "最小" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "周期" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", max);
      const q2Result = gradeNumeric(parsed.q2 ?? "", min);
      const q3Result = gradeNumeric(parsed.q3 ?? "", period);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${max} / 問2:${min} / 問3:${period}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(max) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(min) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(period) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n最大値は $b+|a|$、最小値は $b-|a|$、周期は $\\frac{2\\pi}{c}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "trig_ct_passage_graph_1",
    title: "三角関数のグラフ 連問 1",
    a: 2,
    b: 1,
    c: 1,
    context: "三角関数のグラフの性質を調べる。",
    difficulty: 2,
  },
  {
    id: "trig_ct_passage_graph_2",
    title: "三角関数のグラフ 連問 2",
    a: -3,
    b: 2,
    c: 2,
    context: "三角関数のグラフの性質を調べる。",
    difficulty: 3,
  },
];

export const trigCtPassageGraphTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
