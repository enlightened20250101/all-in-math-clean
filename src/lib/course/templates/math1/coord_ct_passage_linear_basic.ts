// src/lib/course/templates/math1/coord_ct_passage_linear_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  queryX: number;
  difficulty: 1 | 2;
};

const CASES: PassageCase[] = [
  { id: "coord_ct_passage_linear_1", title: "一次関数 連問 1", x1: -1, y1: 2, x2: 3, y2: 10, queryX: 1, difficulty: 1 },
  { id: "coord_ct_passage_linear_2", title: "一次関数 連問 2", x1: 0, y1: -3, x2: 4, y2: 5, queryX: 2, difficulty: 1 },
  { id: "coord_ct_passage_linear_3", title: "一次関数 連問 3", x1: -2, y1: 7, x2: 2, y2: -1, queryX: 0, difficulty: 2 },
  { id: "coord_ct_passage_linear_4", title: "一次関数 連問 4", x1: 1, y1: 5, x2: 5, y2: 1, queryX: 3, difficulty: 2 },
];

function buildTemplate(c: PassageCase): QuestionTemplate {
  const slope = (c.y2 - c.y1) / (c.x2 - c.x1);
  const intercept = c.y1 - slope * c.x1;
  const yValue = slope * c.queryX + intercept;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    `2点 $A(${c.x1},${c.y1})$、$B(${c.x2},${c.y2})$ を通る直線を考える。`,
    "（問1）直線の傾きを求めよ。",
    "（問2）$y$ 切片を求めよ。",
    `（問3）$x=${c.queryX}$ のときの $y$ を求めよ。`,
  ].join("\n");

  return {
    meta: {
      id: c.id,
      topicId: "coord_line_slope_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["coordinate", "linear", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "傾き" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "切片" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "y" },
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
      const q1 = gradeNumeric(parsed.q1 ?? "", slope);
      const q2 = gradeNumeric(parsed.q2 ?? "", intercept);
      const q3 = gradeNumeric(parsed.q3 ?? "", yValue);
      return {
        isCorrect: q1.isCorrect && q2.isCorrect && q3.isCorrect,
        correctAnswer: `問1:${slope} / 問2:${intercept} / 問3:${yValue}`,
        partResults: {
          q1: { isCorrect: q1.isCorrect, correctAnswer: String(slope) },
          q2: { isCorrect: q2.isCorrect, correctAnswer: String(intercept) },
          q3: { isCorrect: q3.isCorrect, correctAnswer: String(yValue) },
        },
      };
    },
  };
}

export const coordCtPassageLinearTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
