// src/lib/course/templates/math1/data_summary_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type SummaryKind = "mean" | "median" | "mode" | "range";

type SummaryCase = {
  id: string;
  title: string;
  kind: SummaryKind;
  data: number[];
};

function sum(data: number[]): number {
  return data.reduce((acc, v) => acc + v, 0);
}

function mean(data: number[]): number {
  return sum(data) / data.length;
}

function median(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid];
}

function mode(data: number[]): number {
  const counts = new Map<number, number>();
  data.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let best = data[0];
  let bestCount = -1;
  counts.forEach((cnt, v) => {
    if (cnt > bestCount) {
      best = v;
      bestCount = cnt;
    }
  });
  return best;
}

function range(data: number[]): number {
  const min = Math.min(...data);
  const max = Math.max(...data);
  return max - min;
}

function formatData(data: number[]): string {
  return data.join(", ");
}

function computeAnswer(kind: SummaryKind, data: number[]): number {
  if (kind === "mean") return mean(data);
  if (kind === "median") return median(data);
  if (kind === "mode") return mode(data);
  return range(data);
}

function buildTemplate(c: SummaryCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "data_summary_basic",
      title: c.title,
      difficulty: 1,
      tags: ["data", c.kind],
    },
    generate() {
      const statement =
        c.title.includes("文章題") && c.kind === "mean"
          ? `5日間の学習時間（時間）は ${formatData(c.data)} であった。平均の学習時間を求めよ。`
          : c.title.includes("文章題") && c.kind === "median"
          ? `5人の小テストの点数が ${formatData(c.data)} であった。中央値を求めよ。`
          : `次のデータの${c.title}を求めよ。\n\nデータ: ${formatData(c.data)}`;
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
      const sorted = [...c.data].sort((a, b) => a - b);
      const dataText = formatData(c.data);
      const sortedText = formatData(sorted);
      const n = c.data.length;
      const total = sum(c.data);
      const ans = computeAnswer(c.kind, c.data);
      if (c.kind === "mean") {
        return `
### この問題の解説
データの合計は ${total}、個数は ${n} なので平均は ${total} ÷ ${n} = ${ans} です。
`;
      }
      if (c.kind === "median") {
        return `
### この問題の解説
小さい順に並べると ${sortedText} です。真ん中の値は ${ans} なので中央値は ${ans} です。
`;
      }
      if (c.kind === "mode") {
        return `
### この問題の解説
${dataText} の中で最も多い値は ${ans} なので、最頻値は ${ans} です。
`;
      }
      return `
### この問題の解説
小さい順に並べると ${sortedText} です。最大値は ${sorted[sorted.length - 1]}、最小値は ${sorted[0]} なので範囲は ${ans} です。
`;
    },
  };
}

const CASES: SummaryCase[] = [
  { id: "data_mean_1", title: "平均", kind: "mean", data: [2, 4, 6, 8, 10] },
  { id: "data_mean_2", title: "平均", kind: "mean", data: [1, 3, 5, 7, 9] },
  { id: "data_mean_3", title: "平均", kind: "mean", data: [3, 3, 3, 3, 3] },
  { id: "data_mean_4", title: "平均", kind: "mean", data: [2, 2, 4, 6, 6] },
  { id: "data_mean_5", title: "平均", kind: "mean", data: [4, 5, 5, 6, 10] },
  { id: "data_mean_6", title: "平均", kind: "mean", data: [0, 2, 4, 6, 8] },
  { id: "data_mean_7", title: "平均", kind: "mean", data: [2, 2, 2, 6, 8] },
  { id: "data_mean_8", title: "平均", kind: "mean", data: [3, 5, 7, 9, 11] },
  { id: "data_mean_9", title: "平均", kind: "mean", data: [1, 2, 3, 4, 10] },
  { id: "data_mean_10", title: "平均", kind: "mean", data: [6, 6, 6, 6, 6] },
  { id: "data_mean_11", title: "平均", kind: "mean", data: [2, 4, 4, 4, 6] },
  { id: "data_mean_12", title: "平均", kind: "mean", data: [5, 5, 7, 7, 9] },

  { id: "data_median_1", title: "中央値", kind: "median", data: [1, 2, 3, 4, 9] },
  { id: "data_median_2", title: "中央値", kind: "median", data: [2, 2, 5, 7, 9] },
  { id: "data_median_3", title: "中央値", kind: "median", data: [0, 1, 1, 1, 8] },
  { id: "data_median_4", title: "中央値", kind: "median", data: [3, 4, 4, 4, 7] },
  { id: "data_median_5", title: "中央値", kind: "median", data: [6, 7, 8, 9, 10] },
  { id: "data_median_6", title: "中央値", kind: "median", data: [2, 3, 5, 5, 8] },
  { id: "data_median_7", title: "中央値", kind: "median", data: [1, 2, 2, 8, 9] },
  { id: "data_median_8", title: "中央値", kind: "median", data: [0, 4, 4, 6, 12] },
  { id: "data_median_9", title: "中央値", kind: "median", data: [5, 5, 6, 7, 9] },
  { id: "data_median_10", title: "中央値", kind: "median", data: [2, 6, 6, 6, 10] },

  { id: "data_mode_1", title: "最頻値", kind: "mode", data: [1, 2, 2, 3, 4] },
  { id: "data_mode_2", title: "最頻値", kind: "mode", data: [5, 5, 5, 7, 8] },
  { id: "data_mode_3", title: "最頻値", kind: "mode", data: [3, 3, 4, 4, 4, 6] },
  { id: "data_mode_4", title: "最頻値", kind: "mode", data: [2, 2, 2, 3, 5, 5] },
  { id: "data_mode_5", title: "最頻値", kind: "mode", data: [0, 1, 1, 1, 2, 3] },
  { id: "data_mode_6", title: "最頻値", kind: "mode", data: [6, 6, 7, 8, 9] },
  { id: "data_mode_7", title: "最頻値", kind: "mode", data: [4, 4, 4, 5, 7] },
  { id: "data_mode_8", title: "最頻値", kind: "mode", data: [1, 3, 3, 3, 5, 6] },
  { id: "data_mode_9", title: "最頻値", kind: "mode", data: [2, 2, 4, 6, 6, 6] },
  { id: "data_mode_10", title: "最頻値", kind: "mode", data: [7, 7, 8, 9, 10] },
  { id: "data_mean_word_1", title: "平均（文章題）", kind: "mean", data: [2, 3, 4, 5, 6] },
  { id: "data_median_word_1", title: "中央値（文章題）", kind: "median", data: [1, 4, 4, 6, 9] },

  { id: "data_range_1", title: "範囲", kind: "range", data: [1, 3, 4, 8, 9] },
  { id: "data_range_2", title: "範囲", kind: "range", data: [2, 2, 2, 2, 6] },
  { id: "data_range_3", title: "範囲", kind: "range", data: [0, 5, 5, 7, 10] },
  { id: "data_range_4", title: "範囲", kind: "range", data: [3, 6, 9, 12] },
  { id: "data_range_5", title: "範囲", kind: "range", data: [1, 1, 1, 4, 7] },
  { id: "data_range_6", title: "範囲", kind: "range", data: [5, 6, 6, 6, 7] },
  { id: "data_range_7", title: "範囲", kind: "range", data: [2, 4, 6, 8, 12] },
  { id: "data_range_8", title: "範囲", kind: "range", data: [0, 3, 3, 9, 9] },
  { id: "data_range_9", title: "範囲", kind: "range", data: [4, 4, 5, 7, 11] },
  { id: "data_range_10", title: "範囲", kind: "range", data: [1, 2, 2, 2, 10] },

  { id: "data_mean_13", title: "平均", kind: "mean", data: [2, 4, 6, 6, 8] },
  { id: "data_mean_14", title: "平均", kind: "mean", data: [1, 5, 5, 7, 12] },
  { id: "data_mean_15", title: "平均", kind: "mean", data: [0, 2, 4, 6, 10] },
  { id: "data_mean_16", title: "平均", kind: "mean", data: [3, 3, 5, 7, 7] },
  { id: "data_mean_17", title: "平均", kind: "mean", data: [4, 6, 6, 8, 10] },
  { id: "data_mean_18", title: "平均", kind: "mean", data: [2, 2, 4, 8, 12] },
  { id: "data_mean_19", title: "平均", kind: "mean", data: [5, 7, 7, 9, 12] },
  { id: "data_mean_20", title: "平均", kind: "mean", data: [1, 3, 5, 9, 12] },

  { id: "data_median_11", title: "中央値", kind: "median", data: [1, 1, 4, 7, 9] },
  { id: "data_median_12", title: "中央値", kind: "median", data: [0, 2, 2, 6, 8] },
  { id: "data_median_13", title: "中央値", kind: "median", data: [3, 3, 5, 8, 10] },
  { id: "data_median_14", title: "中央値", kind: "median", data: [4, 5, 5, 7, 11] },
  { id: "data_median_15", title: "中央値", kind: "median", data: [2, 4, 6, 8, 8] },
  { id: "data_median_16", title: "中央値", kind: "median", data: [1, 2, 5, 9, 12] },
  { id: "data_median_17", title: "中央値", kind: "median", data: [0, 3, 3, 3, 9] },

  { id: "data_mode_11", title: "最頻値", kind: "mode", data: [1, 1, 2, 3, 4] },
  { id: "data_mode_12", title: "最頻値", kind: "mode", data: [2, 3, 3, 4, 5] },
  { id: "data_mode_13", title: "最頻値", kind: "mode", data: [4, 4, 5, 6, 7] },
  { id: "data_mode_14", title: "最頻値", kind: "mode", data: [0, 2, 2, 2, 5] },
  { id: "data_mode_15", title: "最頻値", kind: "mode", data: [6, 6, 6, 7, 8] },
  { id: "data_mode_16", title: "最頻値", kind: "mode", data: [3, 3, 5, 7, 9] },
  { id: "data_mode_17", title: "最頻値", kind: "mode", data: [2, 2, 4, 6, 8] },

  { id: "data_range_11", title: "範囲", kind: "range", data: [2, 2, 3, 5, 9] },
  { id: "data_range_12", title: "範囲", kind: "range", data: [0, 1, 4, 4, 7] },
  { id: "data_range_13", title: "範囲", kind: "range", data: [3, 6, 6, 6, 12] },
  { id: "data_range_14", title: "範囲", kind: "range", data: [5, 5, 8, 9, 14] },
  { id: "data_range_15", title: "範囲", kind: "range", data: [1, 4, 4, 8, 10] },
  { id: "data_range_16", title: "範囲", kind: "range", data: [2, 3, 5, 7, 15] },
  { id: "data_range_17", title: "範囲", kind: "range", data: [0, 2, 2, 4, 6] },
  { id: "data_range_18", title: "範囲", kind: "range", data: [4, 4, 6, 10, 13] },
];

const extraSummaryCases: SummaryCase[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = (["mean", "median", "mode", "range"] as const)[idx % 4];
  const id = `data_summary_extra_${idx + 1}`;
  if (kind === "mean") {
    const m = pick([3, 4, 5, 6, 7, 8, 9]);
    return { id, title: "平均", kind, data: [m - 2, m - 1, m, m + 1, m + 2] };
  }
  if (kind === "median") {
    const m = pick([4, 5, 6, 7, 8, 9]);
    return { id, title: "中央値", kind, data: [m - 3, m - 1, m, m + 2, m + 4] };
  }
  if (kind === "mode") {
    const m = pick([2, 3, 4, 5, 6, 7]);
    return { id, title: "最頻値", kind, data: [m, m, m, m - 1, m + 1, m + 2] };
  }
  const min = pick([0, 1, 2, 3, 4, 5]);
  const max = min + pick([5, 6, 7, 8, 9]);
  const mid = Math.floor((min + max) / 2);
  return { id, title: "範囲", kind, data: [min, min + 1, mid, max - 1, max] };
});

export const dataSummaryTemplates: QuestionTemplate[] = [...CASES, ...extraSummaryCases].map(buildTemplate);
