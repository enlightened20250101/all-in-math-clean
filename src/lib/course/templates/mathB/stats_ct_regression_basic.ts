// src/lib/course/templates/mathB/stats_ct_regression_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type PredictCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  context: string;
  unit: string;
  difficulty: 1 | 2 | 3;
};

type ResidualCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  y: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildPredictTemplate(c: PredictCase): QuestionTemplate {
  const line = texLinear(c.a, c.b);
  const y = c.a * c.x + c.b;
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
        statement: `${c.context}回帰直線 $y=${line}$ が得られた。$x=${c.x}$ の推定値を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, y);
    },
    explain() {
      return `### この問題の解説\n回帰直線に代入して $y=${y}${c.unit}$。`;
    },
  };
}

function buildResidualTemplate(c: ResidualCase): QuestionTemplate {
  const line = texLinear(c.a, c.b);
  const yHat = c.a * c.x + c.b;
  const residual = c.y - yHat;
  const choices = ["正の残差", "負の残差", "残差0"];
  const correct = residual > 0 ? "正の残差" : residual < 0 ? "負の残差" : "残差0";
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
        statement: `${c.context}回帰直線 $y=${line}$ に対し、観測値 $(x,y)=(${c.x},${c.y})$ の残差の符号を選べ。`,
        answerKind: "choice",
        choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `### この問題の解説\n残差は $y-\\hat{y}$。ここでは $\\hat{y}=${yHat}$ なので残差は ${residual}。答えは **${correct}**。`;
    },
  };
}

const PREDICT_CASES: PredictCase[] = [
  {
    id: "stats_ct_regress_predict_1",
    title: "回帰直線 推定 1",
    a: 2,
    b: 5,
    x: 3,
    context: "学習時間 $x$（時間）と得点 $y$（点）について、",
    unit: "点",
    difficulty: 1,
  },
  {
    id: "stats_ct_regress_predict_2",
    title: "回帰直線 推定 2",
    a: -1,
    b: 20,
    x: 6,
    context: "気温 $x$（℃）と電力消費 $y$（単位）について、",
    unit: "",
    difficulty: 1,
  },
  {
    id: "stats_ct_regress_predict_3",
    title: "回帰直線 推定 3",
    a: 3,
    b: -4,
    x: 5,
    context: "来客数 $x$（人）と売上 $y$（万円）について、",
    unit: "万円",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_4",
    title: "回帰直線 推定 4",
    a: 1,
    b: 8,
    x: 12,
    context: "走行距離 $x$（km）と燃料消費 $y$（L）について、",
    unit: "L",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_5",
    title: "回帰直線 推定 5",
    a: 0.5,
    b: 10,
    x: 20,
    context: "学習時間 $x$（時間）と得点 $y$（点）について、",
    unit: "点",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_6",
    title: "回帰直線 推定 6",
    a: -0.8,
    b: 18,
    x: 8,
    context: "気温 $x$（℃）と暖房費 $y$（千円）について、",
    unit: "千円",
    difficulty: 3,
  },
  {
    id: "stats_ct_regress_predict_7",
    title: "回帰直線 推定 7",
    a: 1.2,
    b: -3,
    x: 5,
    context: "来客数 $x$（人）と売上 $y$（万円）について、",
    unit: "万円",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_8",
    title: "回帰直線 推定 8",
    a: -0.5,
    b: 12,
    x: 6,
    context: "気温 $x$（℃）と電力消費 $y$（単位）について、",
    unit: "",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_9",
    title: "回帰直線 推定 9",
    a: 1.5,
    b: 4,
    x: 6,
    context: "走行距離 $x$（km）と燃料消費 $y$（L）について、",
    unit: "L",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_10",
    title: "回帰直線 推定 10",
    a: -2,
    b: 60,
    x: 15,
    context: "気温 $x$（℃）と暖房費 $y$（千円）について、",
    unit: "千円",
    difficulty: 3,
  },
  {
    id: "stats_ct_regress_predict_11",
    title: "回帰直線 推定 11",
    a: 0.8,
    b: 5,
    x: 10,
    context: "練習時間 $x$（時間）とタイム $y$（秒）について、",
    unit: "秒",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_predict_12",
    title: "回帰直線 推定 12",
    a: 1,
    b: -2,
    x: 9,
    context: "学習時間 $x$（時間）と得点 $y$（点）について、",
    unit: "点",
    difficulty: 1,
  },
];

const RESIDUAL_CASES: ResidualCase[] = [
  {
    id: "stats_ct_regress_residual_1",
    title: "残差の符号 1",
    a: 2,
    b: 3,
    x: 4,
    y: 13,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_regress_residual_2",
    title: "残差の符号 2",
    a: -1,
    b: 15,
    x: 5,
    y: 7,
    context: "気温 $x$ と電力消費 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_regress_residual_3",
    title: "残差の符号 3",
    a: 3,
    b: -6,
    x: 4,
    y: 6,
    context: "来客数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_4",
    title: "残差の符号 4",
    a: 1,
    b: 2,
    x: 10,
    y: 12,
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_5",
    title: "残差の符号 5",
    a: 0.5,
    b: 10,
    x: 20,
    y: 18,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_6",
    title: "残差の符号 6",
    a: -0.8,
    b: 18,
    x: 8,
    y: 9,
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 3,
  },
  {
    id: "stats_ct_regress_residual_7",
    title: "残差の符号 7",
    a: 1.2,
    b: -3,
    x: 5,
    y: 5,
    context: "来客数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_8",
    title: "残差の符号 8",
    a: -0.5,
    b: 12,
    x: 6,
    y: 8,
    context: "気温 $x$ と電力消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_9",
    title: "残差の符号 9",
    a: 1.5,
    b: 4,
    x: 6,
    y: 14,
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_10",
    title: "残差の符号 10",
    a: -2,
    b: 60,
    x: 15,
    y: 25,
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 3,
  },
  {
    id: "stats_ct_regress_residual_11",
    title: "残差の符号 11",
    a: 0.8,
    b: 5,
    x: 10,
    y: 12,
    context: "練習時間 $x$ とタイム $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_regress_residual_12",
    title: "残差の符号 12",
    a: 1,
    b: -2,
    x: 9,
    y: 6,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 1,
  },
];

export const statsCtRegressionTemplates: QuestionTemplate[] = [
  ...PREDICT_CASES.map(buildPredictTemplate),
  ...RESIDUAL_CASES.map(buildResidualTemplate),
];
