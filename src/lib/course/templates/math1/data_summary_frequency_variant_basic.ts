// src/lib/course/templates/math1/data_summary_frequency_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type FreqCase = {
  id: string;
  title: string;
  values: number[];
  freqs: number[];
  kind: "mean" | "median";
  context?: string;
};

function mean(values: number[], freqs: number[]): number {
  const total = values.reduce((s, v, i) => s + v * freqs[i], 0);
  const count = freqs.reduce((s, v) => s + v, 0);
  return total / count;
}

function median(values: number[], freqs: number[]): number {
  const expanded: number[] = [];
  values.forEach((v, i) => {
    for (let k = 0; k < freqs[i]; k += 1) expanded.push(v);
  });
  expanded.sort((a, b) => a - b);
  return expanded[Math.floor(expanded.length / 2)];
}

function tableText(values: number[], freqs: number[]): string {
  return values.map((v, i) => `${v}:${freqs[i]}`).join(", ");
}

function buildTemplate(c: FreqCase): QuestionTemplate {
  const ans = c.kind === "mean" ? mean(c.values, c.freqs) : median(c.values, c.freqs);
  return {
    meta: {
      id: c.id,
      topicId: "data_summary_basic",
      title: c.title,
      difficulty: 1,
      tags: ["data", c.kind, "frequency"],
    },
    generate() {
      const lead = c.context ? `${c.context}\n\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}度数分布のデータから${c.kind === "mean" ? "平均" : "中央値"}を求めよ。\\n\\nデータ(値:度数) ${tableText(
          c.values,
          c.freqs
        )}`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, ans);
    },
    explain() {
      return `### この問題の解説\n度数を考慮して計算します。答えは **${ans}** です。`;
    },
  };
}

const CASES: FreqCase[] = [
  { id: "data_freq_mean_1", title: "度数分布の平均 1", values: [1, 2, 3], freqs: [2, 1, 2], kind: "mean", context: "あるクラスの小テスト得点を区分して度数分布を作った。", },
  { id: "data_freq_mean_2", title: "度数分布の平均 2", values: [2, 4, 6], freqs: [1, 2, 1], kind: "mean", context: "身長を区分して度数分布を作った。", },
  { id: "data_freq_mean_3", title: "度数分布の平均 3", values: [1, 3, 5], freqs: [1, 3, 1], kind: "mean", context: "1日の勉強時間を区分して度数分布を作った。", },
  { id: "data_freq_median_1", title: "度数分布の中央値 1", values: [1, 3, 5], freqs: [1, 3, 1], kind: "median", context: "ある商品の購入回数を区分して度数分布を作った。", },
  { id: "data_freq_median_2", title: "度数分布の中央値 2", values: [2, 4, 6], freqs: [2, 1, 2], kind: "median", context: "通学時間を区分して度数分布を作った。", },
  { id: "data_freq_median_3", title: "度数分布の中央値 3", values: [1, 2, 4], freqs: [1, 2, 2], kind: "median", context: "部活動の出席回数を区分して度数分布を作った。", },
];

export const dataSummaryFrequencyVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
