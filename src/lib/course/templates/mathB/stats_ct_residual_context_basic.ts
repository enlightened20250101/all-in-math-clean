// src/lib/course/templates/mathB/stats_ct_residual_context_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

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

type DistCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x: number;
  y: number;
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildResidualTemplate(c: ResidualCase): QuestionTemplate {
  const line = texLinear(c.a, c.b);
  const yHat = c.a * c.x + c.b;
  const residual = c.y - yHat;
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
        statement: `${c.context}回帰直線 $y=${line}$ に対し、観測値 $(x,y)=(${c.x},${c.y})$ の残差を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, residual);
    },
    explain() {
      return `### この問題の解説\n残差は $y-\\hat{y}$。\nここでは $\\hat{y}=${yHat}$ なので残差は **${residual}**。`;
    },
  };
}

function buildDistanceTemplate(c: DistCase): QuestionTemplate {
  const line = texLinear(c.a, c.b);
  const yHat = c.a * c.x + c.b;
  const dist = Math.abs(c.y - yHat);
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
        statement: `${c.context}回帰直線 $y=${line}$ に対し、点 $(x,y)=(${c.x},${c.y})$ の直線からのずれ（$|y-\\hat{y}|$）を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, dist);
    },
    explain() {
      return `### この問題の解説\n$\\hat{y}=${yHat}$ なので $|y-\\hat{y}|=${dist}$。\n答えは **${dist}**。`;
    },
  };
}

const RESIDUAL_CASES: ResidualCase[] = [
  {
    id: "stats_ct_residual_1",
    title: "残差 1",
    a: 2,
    b: 1,
    x: 4,
    y: 11,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_residual_2",
    title: "残差 2",
    a: -1,
    b: 20,
    x: 6,
    y: 10,
    context: "気温 $x$ と電力消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_residual_3",
    title: "残差 3",
    a: 3,
    b: -5,
    x: 5,
    y: 7,
    context: "来客数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_residual_4",
    title: "残差 4",
    a: 0.5,
    b: 8,
    x: 10,
    y: 15,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_residual_5",
    title: "残差 5",
    a: 1.2,
    b: -3,
    x: 5,
    y: 4,
    context: "来客数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_residual_6",
    title: "残差 6",
    a: 1.5,
    b: 2,
    x: 4,
    y: 9,
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_residual_7",
    title: "残差 7",
    a: -2,
    b: 40,
    x: 10,
    y: 18,
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 3,
  },
  {
    id: "stats_ct_residual_8",
    title: "残差 8",
    a: 0.8,
    b: 5,
    x: 8,
    y: 12,
    context: "学習時間 $x$ と得点 $y$ について、",
    difficulty: 2,
  },
];

const DIST_CASES: DistCase[] = [
  {
    id: "stats_ct_dist_1",
    title: "ずれ 1",
    a: 1,
    b: 4,
    x: 6,
    y: 12,
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_dist_2",
    title: "ずれ 2",
    a: 2,
    b: 3,
    x: 3,
    y: 5,
    context: "来店数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_dist_3",
    title: "ずれ 3",
    a: -1,
    b: 18,
    x: 4,
    y: 12,
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_dist_4",
    title: "ずれ 4",
    a: 1.2,
    b: -3,
    x: 5,
    y: 4,
    context: "来客数 $x$ と売上 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_dist_5",
    title: "ずれ 5",
    a: 1.5,
    b: 2,
    x: 4,
    y: 9,
    context: "走行距離 $x$ と燃料消費 $y$ について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_dist_6",
    title: "ずれ 6",
    a: -2,
    b: 40,
    x: 10,
    y: 18,
    context: "気温 $x$ と暖房費 $y$ について、",
    difficulty: 3,
  },
];

export const statsCtResidualContextTemplates: QuestionTemplate[] = [
  ...RESIDUAL_CASES.map(buildResidualTemplate),
  ...DIST_CASES.map(buildDistanceTemplate),
];
