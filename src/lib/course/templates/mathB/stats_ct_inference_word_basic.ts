// src/lib/course/templates/mathB/stats_ct_inference_word_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type SeCase = {
  id: string;
  title: string;
  sigma: number;
  n: number;
  difficulty: 1 | 2 | 3;
};

type CiCase = {
  id: string;
  title: string;
  mean: number;
  se: number;
  z: number;
  difficulty: 1 | 2 | 3;
};

function buildSeTemplate(c: SeCase): QuestionTemplate {
  const value = c.sigma / Math.sqrt(c.n);
  return {
    meta: {
      id: c.id,
      topicId: "stats_standard_error_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "standard_error", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `母標準偏差が ${c.sigma}、標本サイズが ${c.n} のとき、標本平均の標準誤差を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, value);
    },
    explain() {
      return `### この問題の解説\n標準誤差は $\\sigma/\\sqrt{n}$。\n答えは **${value}**。`;
    },
  };
}

function buildCiTemplate(c: CiCase): QuestionTemplate {
  const half = c.z * c.se;
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
        statement: `標本平均が ${c.mean}、標準誤差が ${c.se} のとき、$z=${c.z}$ を用いた信頼区間の幅（片側）を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, half);
    },
    explain() {
      return `### この問題の解説\n片側の幅は $z\\times \\text{SE}$。\n答えは **${half}**。`;
    },
  };
}

const SE_CASES: SeCase[] = [
  { id: "stats_ct_se_1", title: "標準誤差 1", sigma: 12, n: 36, difficulty: 1 },
  { id: "stats_ct_se_2", title: "標準誤差 2", sigma: 15, n: 25, difficulty: 1 },
  { id: "stats_ct_se_3", title: "標準誤差 3", sigma: 20, n: 100, difficulty: 2 },
  { id: "stats_ct_se_4", title: "標準誤差 4", sigma: 9, n: 81, difficulty: 1 },
  { id: "stats_ct_se_5", title: "標準誤差 5", sigma: 18, n: 49, difficulty: 2 },
  { id: "stats_ct_se_6", title: "標準誤差 6", sigma: 16, n: 64, difficulty: 1 },
  { id: "stats_ct_se_7", title: "標準誤差 7", sigma: 30, n: 225, difficulty: 2 },
  { id: "stats_ct_se_8", title: "標準誤差 8", sigma: 10, n: 25, difficulty: 1 },
  { id: "stats_ct_se_9", title: "標準誤差 9", sigma: 21, n: 49, difficulty: 2 },
  { id: "stats_ct_se_10", title: "標準誤差 10", sigma: 24, n: 144, difficulty: 2 },
  { id: "stats_ct_se_11", title: "標準誤差 11", sigma: 8, n: 16, difficulty: 1 },
];

const CI_CASES: CiCase[] = [
  { id: "stats_ct_ci_1", title: "信頼区間 1", mean: 68, se: 4, z: 2, difficulty: 1 },
  { id: "stats_ct_ci_2", title: "信頼区間 2", mean: 55, se: 3, z: 2, difficulty: 1 },
  { id: "stats_ct_ci_3", title: "信頼区間 3", mean: 62, se: 5, z: 3, difficulty: 2 },
  { id: "stats_ct_ci_4", title: "信頼区間 4", mean: 70, se: 2, z: 1.96, difficulty: 2 },
  { id: "stats_ct_ci_5", title: "信頼区間 5", mean: 80, se: 4, z: 1.5, difficulty: 2 },
  { id: "stats_ct_ci_6", title: "信頼区間 6", mean: 52, se: 3, z: 1.96, difficulty: 2 },
  { id: "stats_ct_ci_7", title: "信頼区間 7", mean: 60, se: 2, z: 2, difficulty: 1 },
  { id: "stats_ct_ci_8", title: "信頼区間 8", mean: 75, se: 5, z: 1.64, difficulty: 2 },
  { id: "stats_ct_ci_9", title: "信頼区間 9", mean: 48, se: 4, z: 2.58, difficulty: 3 },
  { id: "stats_ct_ci_10", title: "信頼区間 10", mean: 90, se: 6, z: 1.96, difficulty: 2 },
];

export const statsCtInferenceWordTemplates: QuestionTemplate[] = [
  ...SE_CASES.map(buildSeTemplate),
  ...CI_CASES.map(buildCiTemplate),
];
