// src/lib/course/templates/math2/coord_ct_passage_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  A: [number, number];
  B: [number, number];
  P: [number, number];
  context: string;
  difficulty: 2 | 3;
};

function buildTemplate(c: PassageCase): QuestionTemplate {
  const [ax, ay] = c.A;
  const [bx, by] = c.B;
  const [px, py] = c.P;
  const slope = (by - ay) / (bx - ax);
  const intercept = ay - slope * ax;
  const numerator = Math.abs((by - ay) * px - (bx - ax) * py + bx * ay - by * ax);
  const denom = Math.sqrt((by - ay) ** 2 + (bx - ax) ** 2);
  const distance = numerator / denom;
  const statement = [
    "次の文章を読み、問1〜問3に答えよ。",
    c.context,
    `点 $A(${ax},${ay})$, $B(${bx},${by})$ を通る直線を考える。`,
    "（問1）直線の傾きを求めよ。",
    "（問2）$y$ 切片を求めよ。",
    `（問3）点 $P(${px},${py})$ から直線までの距離を求めよ。`,
  ].join("\n");
  return {
    meta: {
      id: c.id,
      topicId: "coord_distance_point_line_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["coordinate", "line", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "傾き" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "切片" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "距離" },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", slope);
      const q2Result = gradeNumeric(parsed.q2 ?? "", intercept);
      const q3Result = gradeNumeric(parsed.q3 ?? "", distance);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect,
        correctAnswer: `問1:${slope} / 問2:${intercept} / 問3:${distance}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(slope) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(intercept) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(distance) },
        },
      };
    },
    explain() {
      return `### この問題の解説\n傾き $m=\\frac{y_2-y_1}{x_2-x_1}$、$y$切片は $y=mx+b$ から求める。距離は点と直線の公式。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "coord_ct_passage_line_1",
    title: "直線と距離 連問 1",
    A: [0, 3],
    B: [2, -1],
    P: [3, 2],
    context: "座標平面上の直線と点の距離を考える。",
    difficulty: 2,
  },
  {
    id: "coord_ct_passage_line_2",
    title: "直線と距離 連問 2",
    A: [-1, 4],
    B: [3, 0],
    P: [2, -2],
    context: "座標平面上の直線と点の距離を考える。",
    difficulty: 3,
  },
];

export const coordCtPassageLineTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
