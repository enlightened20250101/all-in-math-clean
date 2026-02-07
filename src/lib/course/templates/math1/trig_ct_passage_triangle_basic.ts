// src/lib/course/templates/math1/trig_ct_passage_triangle_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  hyp: number;
  adj: number;
  opp: number;
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const sin = c.opp / c.hyp;
  const cos = c.adj / c.hyp;
  const tan = c.opp / c.adj;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `直角三角形で、斜辺=${c.hyp}, 隣辺=${c.adj}, 対辺=${c.opp} とする。`,
    "（問1）$\\sin A$ を求めよ。",
    "（問2）$\\cos A$ を求めよ。",
    "（問3）$\\tan A$ を求めよ。",
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "trig_ratio_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["trig", "ratio", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "sin" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "cos" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "tan" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", sin);
      const q2Result = gradeNumeric(parsed.q2 ?? "", cos);
      const q3Result = gradeNumeric(parsed.q3 ?? "", tan);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${sin} / 問2:${cos} / 問3:${tan}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(sin) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(cos) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(tan) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n$\\sin=\\frac{対辺}{斜辺}$、$\\cos=\\frac{隣辺}{斜辺}$、$\\tan=\\frac{対辺}{隣辺}$。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "trig_ct_passage_triangle_1",
    title: "三角比 連問 1",
    hyp: 13,
    adj: 12,
    opp: 5,
    context: "直角三角形の辺の長さが与えられている。",
    difficulty: 2,
  },
  {
    id: "trig_ct_passage_triangle_2",
    title: "三角比 連問 2",
    hyp: 10,
    adj: 8,
    opp: 6,
    context: "直角三角形の辺の長さが与えられている。",
    difficulty: 3,
  },
];

export const trigCtPassageTriangleTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
