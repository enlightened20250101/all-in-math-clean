// src/lib/course/templates/mathB/stats_ct_passage_mixed_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeChoice, gradeNumeric } from "../_shared/utils";

type PassageCase = {
  id: string;
  title: string;
  points: Array<[number, number]>;
  query: [number, number];
  context: string;
  difficulty: 3;
};

function mean(values: number[]) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildTemplate(c: PassageCase): QuestionTemplate {
  const xs = c.points.map((p) => p[0]);
  const ys = c.points.map((p) => p[1]);
  const xBar = mean(xs);
  const yBar = mean(ys);
  const [qx, qy] = c.query;
  const cov =
    c.points.reduce((acc, [x, y]) => acc + (x - xBar) * (y - yBar), 0) / c.points.length;
  const varX = c.points.reduce((acc, [x]) => acc + Math.pow(x - xBar, 2), 0) / c.points.length;
  const slope = cov / varX;
  const intercept = yBar - slope * xBar;
  const estimate = slope * qx + intercept;
  const residual = qy - estimate;
  const signChoice = residual > 0 ? "A" : residual < 0 ? "B" : "C";
  const statement = [
    "次の表と文章を読み、問1〜問4に答えよ。",
    c.context,
    `データ: ${c.points.map((p) => `(${p[0]},${p[1]})`).join(", ")}`,
    "（問1）$\\bar{x}$ を求めよ。",
    "（問2）回帰直線 $y=ax+b$ の係数 $a$ を求めよ。",
    `（問3）$x=${qx}$ の推定値を求めよ。`,
    `（問4）点 (${qx},${qy}) の残差の符号を答えよ（正/負/0）。`,
  ].join("\n");
  const choices = [
    { id: "A", label: "正" },
    { id: "B", label: "負" },
    { id: "C", label: "0" },
  ] as const;
  return {
    meta: {
      id: c.id,
      topicId: "stats_regression_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["stats", "regression", "ct", "passage"],
    },
    generate() {
      return {
        templateId: c.id,
        statement,
        answerKind: "multi",
        subQuestions: [
          { id: "q1", label: "問1", answerKind: "numeric", placeholder: "x平均" },
          { id: "q2", label: "問2", answerKind: "numeric", placeholder: "傾き" },
          { id: "q3", label: "問3", answerKind: "numeric", placeholder: "推定値" },
          { id: "q4", label: "問4", answerKind: "choice", choices },
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
      const q1Result = gradeNumeric(parsed.q1 ?? "", xBar);
      const q2Result = gradeNumeric(parsed.q2 ?? "", slope);
      const q3Result = gradeNumeric(parsed.q3 ?? "", estimate);
      const q4Result = gradeChoice(parsed.q4 ?? "", signChoice);
      return {
        isCorrect: q1Result.isCorrect && q2Result.isCorrect && q3Result.isCorrect && q4Result.isCorrect,
        correctAnswer: `問1:${xBar} / 問2:${slope} / 問3:${estimate} / 問4:${signChoice}`,
        partResults: {
          q1: { isCorrect: q1Result.isCorrect, correctAnswer: String(xBar) },
          q2: { isCorrect: q2Result.isCorrect, correctAnswer: String(slope) },
          q3: { isCorrect: q3Result.isCorrect, correctAnswer: String(estimate) },
          q4: { isCorrect: q4Result.isCorrect, correctAnswer: signChoice },
        },
      };
    },
    explain() {
      return `### この問題の解説\n平均から共分散・分散を計算し、回帰直線を求める。残差の符号で適合の向きを判断する。`;
    },
  };
}

const CASES: PassageCase[] = [
  {
    id: "stats_ct_passage_mixed_1",
    title: "回帰と残差 連問 1",
    points: [
      [1, 2],
      [2, 4],
      [3, 5],
      [4, 7],
    ],
    query: [3, 6],
    context: "測定データを回帰直線で分析する。",
    difficulty: 3,
  },
  {
    id: "stats_ct_passage_mixed_2",
    title: "回帰と残差 連問 2",
    points: [
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
    ],
    query: [5, 8],
    context: "別のデータを回帰直線で分析する。",
    difficulty: 3,
  },
];

export const statsCtPassageMixedTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
