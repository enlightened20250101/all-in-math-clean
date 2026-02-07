// src/lib/course/templates/mathB/stats_variance_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type VarCase = {
  id: string;
  title: string;
  data: number[];
};

function variance(data: number[]): number {
  const n = data.length;
  const mean = data.reduce((s, v) => s + v, 0) / n;
  const sum = data.reduce((s, v) => s + (v - mean) * (v - mean), 0);
  return sum / n;
}

function buildTemplate(c: VarCase): QuestionTemplate {
  const value = variance(c.data);
  return {
    meta: {
      id: c.id,
      topicId: "data_variance_sd_basic",
      title: c.title,
      difficulty: 1,
      tags: ["data", "variance", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次のデータの分散を求めよ。\\n\\nデータ: ${c.data.join(", ")}`,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, value);
    },
    explain() {
      return `
### この問題の解説
分散は平均との差の二乗の平均です。
答えは **${value}** です。
`;
    },
  };
}

const CASES: VarCase[] = [
  { id: "stats_var_v1", title: "分散 1", data: [1, 3, 5, 7, 9] },
  { id: "stats_var_v2", title: "分散 2", data: [2, 4, 6, 8, 10] },
  { id: "stats_var_v3", title: "分散 3", data: [3, 3, 3, 3, 3] },
  { id: "stats_var_v4", title: "分散 4", data: [1, 2, 3, 4, 5] },
  { id: "stats_var_v5", title: "分散 5", data: [0, 2, 4, 6, 8] },
  { id: "stats_var_v6", title: "分散 6", data: [1, 1, 5, 5] },
  { id: "stats_var_v7", title: "分散 7", data: [2, 2, 6, 6] },
  { id: "stats_var_v8", title: "分散 8", data: [1, 3, 3, 5] },
];

export const statsVarianceVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
