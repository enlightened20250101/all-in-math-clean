// src/lib/course/templates/math1/data_variance_sd_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type VarKind = "variance" | "sd";

type VarCase = {
  id: string;
  title: string;
  kind: VarKind;
  data: number[];
};

function sum(data: number[]): number {
  return data.reduce((acc, v) => acc + v, 0);
}

function mean(data: number[]): number {
  return sum(data) / data.length;
}

function variance(data: number[]): number {
  const avg = mean(data);
  const sqSum = data.reduce((acc, v) => acc + (v - avg) ** 2, 0);
  return sqSum / data.length;
}

function standardDeviation(data: number[]): number {
  return Math.sqrt(variance(data));
}

function formatData(data: number[]): string {
  return data.join(", ");
}

function computeAnswer(kind: VarKind, data: number[]): number {
  return kind === "variance" ? variance(data) : standardDeviation(data);
}

function buildTemplate(c: VarCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "data_variance_sd_basic",
      title: c.title,
      difficulty: 1,
      tags: ["data", c.kind],
    },
    generate() {
      const label = c.kind === "variance" ? "分散（母分散）" : "標準偏差";
      const statement =
        c.title.includes("文章題") && c.kind === "variance"
          ? `ある4回の測定値が ${formatData(c.data)} であった。分散（母分散）を求めよ。`
          : c.title.includes("文章題") && c.kind === "sd"
          ? `ある4回の測定値が ${formatData(c.data)} であった。標準偏差を求めよ。`
          : `次のデータの${label}を求めよ。\n\nデータ: ${formatData(c.data)}`;
      return {
        templateId: c.id,
        statement,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      const ans = computeAnswer(c.kind, c.data);
      return gradeNumeric(userAnswer, ans);
    },
    explain(_params) {
      const avg = mean(c.data);
      const sqSum = c.data.reduce((acc, v) => acc + (v - avg) ** 2, 0);
      const v = variance(c.data);
      if (c.kind === "variance") {
        return `
### この問題の解説
平均は ${avg} です。平均との差の二乗の合計は ${sqSum} なので、
分散は ${sqSum} ÷ ${c.data.length} = ${v} です。
`;
      }
      const sd = standardDeviation(c.data);
      return `
### この問題の解説
平均は ${avg}、分散は ${v} です。標準偏差は分散の平方根なので ${sd} です。
`;
    },
  };
}

const CASES: VarCase[] = [
  { id: "data_var_1", title: "分散", kind: "variance", data: [1, 1, 3, 3] },
  { id: "data_var_2", title: "分散", kind: "variance", data: [0, 0, 4, 4] },
  { id: "data_var_3", title: "分散", kind: "variance", data: [2, 2, 4, 4] },
  { id: "data_var_4", title: "分散", kind: "variance", data: [1, 3, 3, 5] },
  { id: "data_var_5", title: "分散", kind: "variance", data: [0, 2, 4, 6] },
  { id: "data_var_6", title: "分散", kind: "variance", data: [2, 2, 6, 6] },
  { id: "data_var_7", title: "分散", kind: "variance", data: [3, 3, 3, 3] },
  { id: "data_var_8", title: "分散", kind: "variance", data: [1, 2, 3, 4, 5] },
  { id: "data_var_9", title: "分散", kind: "variance", data: [2, 4, 6, 8, 10] },
  { id: "data_var_10", title: "分散", kind: "variance", data: [1, 1, 5, 5] },
  { id: "data_var_11", title: "分散", kind: "variance", data: [4, 4, 4, 8] },
  { id: "data_var_12", title: "分散", kind: "variance", data: [1, 1, 1, 5] },
  { id: "data_var_13", title: "分散", kind: "variance", data: [2, 2, 2, 6, 6, 6] },
  { id: "data_var_14", title: "分散", kind: "variance", data: [0, 1, 2, 3, 4] },
  { id: "data_var_15", title: "分散", kind: "variance", data: [2, 4, 6, 8] },
  { id: "data_var_16", title: "分散", kind: "variance", data: [1, 3, 5, 7] },
  { id: "data_var_17", title: "分散", kind: "variance", data: [3, 3, 7, 7] },
  { id: "data_var_18", title: "分散", kind: "variance", data: [0, 2, 6, 8] },
  { id: "data_var_19", title: "分散", kind: "variance", data: [4, 4, 8, 8] },
  { id: "data_var_20", title: "分散", kind: "variance", data: [1, 1, 5, 9] },

  { id: "data_sd_1", title: "標準偏差", kind: "sd", data: [1, 1, 3, 3] },
  { id: "data_sd_2", title: "標準偏差", kind: "sd", data: [0, 0, 4, 4] },
  { id: "data_sd_3", title: "標準偏差", kind: "sd", data: [2, 2, 6, 6] },
  { id: "data_sd_4", title: "標準偏差", kind: "sd", data: [1, 1, 5, 5] },
  { id: "data_sd_5", title: "標準偏差", kind: "sd", data: [3, 3, 3, 3] },
  { id: "data_sd_6", title: "標準偏差", kind: "sd", data: [2, 2, 2, 6, 6, 6] },
  { id: "data_sd_7", title: "標準偏差", kind: "sd", data: [1, 1, 7, 7] },
  { id: "data_sd_8", title: "標準偏差", kind: "sd", data: [2, 2, 8, 8] },
  { id: "data_sd_9", title: "標準偏差", kind: "sd", data: [1, 1, 1, 9, 9, 9] },
  { id: "data_sd_10", title: "標準偏差", kind: "sd", data: [2, 2, 2, 8, 8, 8] },
  { id: "data_sd_11", title: "標準偏差", kind: "sd", data: [3, 3, 9, 9] },
  { id: "data_sd_12", title: "標準偏差", kind: "sd", data: [4, 4, 4, 4] },

  { id: "data_var_21", title: "分散", kind: "variance", data: [1, 1, 7, 7] },
  { id: "data_var_22", title: "分散", kind: "variance", data: [2, 2, 8, 8] },
  { id: "data_var_23", title: "分散", kind: "variance", data: [5, 5, 9, 9] },
  { id: "data_var_24", title: "分散", kind: "variance", data: [6, 6, 10, 10] },
  { id: "data_var_25", title: "分散", kind: "variance", data: [1, 1, 9, 9] },
  { id: "data_var_26", title: "分散", kind: "variance", data: [2, 2, 10, 10] },
  { id: "data_var_27", title: "分散", kind: "variance", data: [3, 3, 11, 11] },
  { id: "data_var_28", title: "分散", kind: "variance", data: [4, 4, 12, 12] },
  { id: "data_var_29", title: "分散", kind: "variance", data: [5, 5, 13, 13] },
  { id: "data_var_30", title: "分散", kind: "variance", data: [6, 6, 14, 14] },
  { id: "data_var_31", title: "分散", kind: "variance", data: [0, 0, 6, 6] },
  { id: "data_var_32", title: "分散", kind: "variance", data: [0, 0, 8, 8] },
  { id: "data_var_33", title: "分散", kind: "variance", data: [2, 2, 12, 12] },
  { id: "data_var_34", title: "分散", kind: "variance", data: [4, 4, 14, 14] },
  { id: "data_var_35", title: "分散", kind: "variance", data: [7, 7, 15, 15] },
  { id: "data_var_word_1", title: "分散（文章題）", kind: "variance", data: [2, 2, 6, 6] },

  { id: "data_sd_13", title: "標準偏差", kind: "sd", data: [4, 4, 10, 10] },
  { id: "data_sd_14", title: "標準偏差", kind: "sd", data: [5, 5, 11, 11] },
  { id: "data_sd_15", title: "標準偏差", kind: "sd", data: [6, 6, 12, 12] },
  { id: "data_sd_16", title: "標準偏差", kind: "sd", data: [7, 7, 13, 13] },
  { id: "data_sd_17", title: "標準偏差", kind: "sd", data: [8, 8, 14, 14] },
  { id: "data_sd_18", title: "標準偏差", kind: "sd", data: [2, 2, 10, 10] },
  { id: "data_sd_19", title: "標準偏差", kind: "sd", data: [3, 3, 11, 11] },
  { id: "data_sd_20", title: "標準偏差", kind: "sd", data: [5, 5, 13, 13] },
  { id: "data_sd_21", title: "標準偏差", kind: "sd", data: [6, 6, 14, 14] },
  { id: "data_sd_22", title: "標準偏差", kind: "sd", data: [0, 0, 8, 8] },
  { id: "data_sd_23", title: "標準偏差", kind: "sd", data: [1, 1, 9, 9] },
  { id: "data_sd_24", title: "標準偏差", kind: "sd", data: [4, 4, 12, 12] },
  { id: "data_sd_25", title: "標準偏差", kind: "sd", data: [0, 0, 6, 6] },
  { id: "data_sd_26", title: "標準偏差", kind: "sd", data: [9, 9, 15, 15] },
  { id: "data_sd_27", title: "標準偏差", kind: "sd", data: [10, 10, 16, 16] },
  { id: "data_sd_word_1", title: "標準偏差（文章題）", kind: "sd", data: [1, 1, 5, 5] },
];

export const dataVarianceSdTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
