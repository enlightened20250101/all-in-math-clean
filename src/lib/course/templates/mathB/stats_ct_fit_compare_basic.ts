// src/lib/course/templates/mathB/stats_ct_fit_compare_basic.ts
import type { QuestionTemplate } from "../../types";
import { texLinear } from "@/lib/format/tex";

type FitCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  points: Array<[number, number]>;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: FitCase): QuestionTemplate {
  const line = texLinear(c.a, c.b);
  const residuals = c.points.map(([x, y]) => y - (c.a * x + c.b));
  const sumAbs = residuals.reduce((acc, r) => acc + Math.abs(r), 0);
  const choices = ["当てはまりが良い", "当てはまりが悪い"];
  const correct = sumAbs <= 3 ? "当てはまりが良い" : "当てはまりが悪い";
  const pointsText = c.points.map(([x, y]) => `(${x},${y})`).join(", ");
  return {
    meta: {
      id: c.id,
      topicId: "stats_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "regression", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.context}回帰直線 $y=${line}$ と観測値のずれから、当てはまりの良さを選べ。\n\nデータ: ${pointsText}`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n直線からのずれ（残差）が小さいほど当てはまりが良い。\nここではずれの合計が ${sumAbs} なので **${correct}**。`;
    },
  };
}

const CASES: FitCase[] = [
  {
    id: "stats_ct_fit_1",
    title: "当てはまり 1",
    a: 2,
    b: 1,
    points: [
      [1, 3],
      [2, 5],
      [3, 7],
    ],
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_fit_2",
    title: "当てはまり 2",
    a: 2,
    b: 1,
    points: [
      [1, 1],
      [2, 8],
      [3, 4],
    ],
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_fit_3",
    title: "当てはまり 3",
    a: -1,
    b: 10,
    points: [
      [1, 9],
      [2, 8],
      [3, 7],
    ],
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_fit_4",
    title: "当てはまり 4",
    a: -1,
    b: 10,
    points: [
      [1, 5],
      [2, 9],
      [3, 7],
    ],
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_fit_5",
    title: "当てはまり 5",
    a: 0.5,
    b: 8,
    points: [
      [2, 9],
      [4, 10],
      [6, 11],
    ],
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_fit_6",
    title: "当てはまり 6",
    a: 0.5,
    b: 8,
    points: [
      [2, 6],
      [4, 14],
      [6, 7],
    ],
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_fit_7",
    title: "当てはまり 7",
    a: -0.8,
    b: 16,
    points: [
      [2, 14],
      [4, 12],
      [6, 11],
    ],
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_fit_8",
    title: "当てはまり 8",
    a: -0.8,
    b: 16,
    points: [
      [2, 9],
      [4, 15],
      [6, 8],
    ],
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 3,
  },
  {
    id: "stats_ct_fit_9",
    title: "当てはまり 9",
    a: 1,
    b: 0,
    points: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    context: "身長 $x$ と体重 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_fit_10",
    title: "当てはまり 10",
    a: 1,
    b: 0,
    points: [
      [1, 0],
      [2, 4],
      [3, 1],
    ],
    context: "身長 $x$ と体重 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_fit_11",
    title: "当てはまり 11",
    a: 1.5,
    b: 2,
    points: [
      [1, 3.5],
      [2, 5],
      [3, 6.5],
    ],
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_fit_12",
    title: "当てはまり 12",
    a: 1.5,
    b: 2,
    points: [
      [1, 1],
      [2, 8],
      [3, 2],
    ],
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 2,
  },
];

export const statsCtFitCompareTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
