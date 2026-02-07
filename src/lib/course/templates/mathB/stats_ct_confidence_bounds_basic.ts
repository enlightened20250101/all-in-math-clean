// src/lib/course/templates/mathB/stats_ct_confidence_bounds_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type BoundCase = {
  id: string;
  title: string;
  mean: number;
  se: number;
  z: number;
  ask: "lower" | "upper";
  context: string;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: BoundCase): QuestionTemplate {
  const half = c.z * c.se;
  const lower = c.mean - half;
  const upper = c.mean + half;
  const answer = c.ask === "lower" ? lower : upper;
  const label = c.ask === "lower" ? "下限" : "上限";
  return {
    meta: {
      id: c.id,
      topicId: "stats_confidence_interval_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "confidence", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `${c.context}標本平均が ${c.mean}、標準誤差が ${c.se}、$z=${c.z}$ のとき、信頼区間の${label}を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, answer);
    },
    explain() {
      return `### この問題の解説\n信頼区間は $\\bar{x} \\pm z\\times\\text{SE}$。\n${label}は **${answer}**。`;
    },
  };
}

const CASES: BoundCase[] = [
  {
    id: "stats_ct_ci_bound_1",
    title: "信頼区間 下限 1",
    mean: 50,
    se: 2,
    z: 2,
    ask: "lower",
    context: "ある商品の平均満足度について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_ci_bound_2",
    title: "信頼区間 上限 1",
    mean: 50,
    se: 2,
    z: 2,
    ask: "upper",
    context: "ある商品の平均満足度について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_ci_bound_3",
    title: "信頼区間 下限 2",
    mean: 72,
    se: 3,
    z: 1,
    ask: "lower",
    context: "テスト平均点について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_ci_bound_4",
    title: "信頼区間 上限 2",
    mean: 72,
    se: 3,
    z: 1,
    ask: "upper",
    context: "テスト平均点について、",
    difficulty: 1,
  },
  {
    id: "stats_ct_ci_bound_5",
    title: "信頼区間 下限 3",
    mean: 65,
    se: 4,
    z: 1.5,
    ask: "lower",
    context: "アンケートの平均値について、",
    difficulty: 2,
  },
  {
    id: "stats_ct_ci_bound_6",
    title: "信頼区間 上限 3",
    mean: 65,
    se: 4,
    z: 1.5,
    ask: "upper",
    context: "アンケートの平均値について、",
    difficulty: 2,
  },
];

export const statsCtConfidenceBoundsTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
