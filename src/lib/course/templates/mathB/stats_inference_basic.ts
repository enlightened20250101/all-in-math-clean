// src/lib/course/templates/mathB/stats_inference_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type InferCase = {
  id: string;
  title: string;
  low: number;
  high: number;
  difficulty: 1 | 2 | 3;
};

function buildTemplate(c: InferCase): QuestionTemplate {
  const center = (c.low + c.high) / 2;
  return {
    meta: {
      id: c.id,
      topicId: "stats_inference_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["statistics", "inference", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `調査結果の母平均の95%信頼区間が $[${c.low}, ${c.high}]$ のとき、点推定値（区間の中心）を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, center);
    },
    explain() {
      return `### この問題の解説\n信頼区間の中心は $(L+U)/2$ です。答えは ${center}。`;
    },
  };
}

const CASES: InferCase[] = [
  { id: "stats_inf_1", title: "推定 1", low: 48, high: 52, difficulty: 1 },
  { id: "stats_inf_2", title: "推定 2", low: 95, high: 105, difficulty: 1 },
  { id: "stats_inf_3", title: "推定 3", low: 30, high: 34, difficulty: 1 },
  { id: "stats_inf_4", title: "推定 4", low: 120, high: 128, difficulty: 1 },
  { id: "stats_inf_5", title: "推定 5", low: 72, high: 78, difficulty: 2 },
  { id: "stats_inf_6", title: "推定 6", low: 210, high: 218, difficulty: 2 },
  { id: "stats_inf_7", title: "推定 7", low: 44, high: 52, difficulty: 2 },
  { id: "stats_inf_8", title: "推定 8", low: 96, high: 104, difficulty: 3 },
  { id: "stats_inf_9", title: "推定 9", low: 135, high: 149, difficulty: 3 },
];

export const statsInferenceTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
