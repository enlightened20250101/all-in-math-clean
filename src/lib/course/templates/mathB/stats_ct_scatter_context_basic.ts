// src/lib/course/templates/mathB/stats_ct_scatter_context_basic.ts
import type { QuestionTemplate } from "../../types";

type ScatterCtxCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  correct: string;
  context: string;
  difficulty: 1 | 2 | 3;
};

function pointsText(points: Array<[number, number]>): string {
  return points.map(([x, y]) => `(${x},${y})`).join(", ");
}

function buildTemplate(c: ScatterCtxCase): QuestionTemplate {
  const choices = ["正の相関", "負の相関", "相関なし"];
  return {
    meta: {
      id: c.id,
      topicId: "stats_scatter_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "scatter", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.context}\n\nデータ: ${pointsText(c.points)}\n相関の向きを選べ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n散布図の並び方から相関の向きを判断する。答えは **${c.correct}**。`;
    },
  };
}

const CASES: ScatterCtxCase[] = [
  {
    id: "stats_ct_scatter_ctx_1",
    title: "学習時間と得点",
    points: [
      [1, 40],
      [2, 52],
      [3, 55],
      [4, 65],
      [5, 70],
    ],
    correct: "正の相関",
    context: "学習時間 $x$（時間）とテスト得点 $y$（点）を調べた。",
    difficulty: 1,
  },
  {
    id: "stats_ct_scatter_ctx_2",
    title: "気温と暖房費",
    points: [
      [2, 90],
      [4, 80],
      [6, 72],
      [8, 66],
      [10, 60],
    ],
    correct: "負の相関",
    context: "気温 $x$（℃）と暖房費 $y$（千円）を調べた。",
    difficulty: 1,
  },
  {
    id: "stats_ct_scatter_ctx_3",
    title: "睡眠時間と満足度",
    points: [
      [4, 3],
      [5, 4],
      [6, 3],
      [7, 4],
      [8, 3],
    ],
    correct: "相関なし",
    context: "睡眠時間 $x$（時間）と満足度 $y$（1〜5）を調べた。",
    difficulty: 2,
  },
  {
    id: "stats_ct_scatter_ctx_4",
    title: "来客数と売上",
    points: [
      [10, 22],
      [12, 26],
      [9, 19],
      [15, 30],
      [11, 23],
    ],
    correct: "正の相関",
    context: "来客数 $x$（人）と売上 $y$（万円）を調べた。",
    difficulty: 2,
  },
  {
    id: "stats_ct_scatter_ctx_5",
    title: "通学距離と遅刻回数",
    points: [
      [2, 1],
      [3, 2],
      [4, 2],
      [5, 3],
      [6, 4],
    ],
    correct: "正の相関",
    context: "通学距離 $x$（km）と遅刻回数 $y$（回/月）を調べた。",
    difficulty: 3,
  },
  {
    id: "stats_ct_scatter_ctx_6",
    title: "体重と運動時間",
    points: [
      [48, 30],
      [52, 25],
      [55, 20],
      [60, 18],
      [63, 15],
    ],
    correct: "負の相関",
    context: "体重 $x$（kg）と運動時間 $y$（分）を調べた。",
    difficulty: 2,
  },
  {
    id: "stats_ct_scatter_ctx_7",
    title: "気分と気温",
    points: [
      [12, 3],
      [18, 4],
      [22, 2],
      [26, 4],
      [30, 3],
    ],
    correct: "相関なし",
    context: "気温 $x$（℃）と気分スコア $y$（1〜5）を調べた。",
    difficulty: 3,
  },
  {
    id: "stats_ct_scatter_ctx_8",
    title: "勉強量と睡眠時間",
    points: [
      [1, 7],
      [2, 7],
      [3, 6],
      [4, 6],
      [5, 5],
    ],
    correct: "負の相関",
    context: "勉強時間 $x$（時間）と睡眠時間 $y$（時間）を調べた。",
    difficulty: 2,
  },
  {
    id: "stats_ct_scatter_ctx_9",
    title: "年齢と視力",
    points: [
      [15, 1.2],
      [20, 1.0],
      [25, 0.9],
      [30, 0.7],
      [35, 0.6],
    ],
    correct: "負の相関",
    context: "年齢 $x$（歳）と視力 $y$ を調べた。",
    difficulty: 2,
  },
  {
    id: "stats_ct_scatter_ctx_10",
    title: "日照時間と気温",
    points: [
      [2, 8],
      [4, 12],
      [6, 15],
      [8, 18],
      [10, 21],
    ],
    correct: "正の相関",
    context: "日照時間 $x$（時間）と気温 $y$（℃）を調べた。",
    difficulty: 1,
  },
];

export const statsCtScatterContextTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
