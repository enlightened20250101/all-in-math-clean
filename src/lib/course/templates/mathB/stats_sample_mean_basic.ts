// src/lib/course/templates/mathB/stats_sample_mean_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { d1: 4, d2: 6, d3: 8, d4: 2, mean: 5 },
  { d1: 3, d2: 3, d3: 6, d4: 8, mean: 5 },
  { d1: 10, d2: 6, d3: 8, d4: 4, mean: 7 },
  { d1: 9, d2: 5, d3: 7, d4: 3, mean: 6 },
  { d1: 12, d2: 4, d3: 6, d4: 2, mean: 6 },
  { d1: 11, d2: 7, d3: 5, d4: 1, mean: 6 },
  { d1: 2, d2: 8, d3: 10, d4: 4, mean: 6 },
  { d1: 14, d2: 6, d3: 2, d4: 6, mean: 7 },
  { d1: 16, d2: 8, d3: 4, d4: 4, mean: 8 },
  { d1: 5, d2: 9, d3: 7, d4: 3, mean: 6 },
  { d1: 15, d2: 9, d3: 3, d4: 5, mean: 8 },
  { d1: 18, d2: 6, d3: 4, d4: 8, mean: 9 },
  { d1: 6, d2: 8, d3: 4, d4: 2, mean: 5 },
  { d1: 7, d2: 5, d3: 3, d4: 9, mean: 6 },
  { d1: 20, d2: 4, d3: 8, d4: 8, mean: 10 },
  { d1: 1, d2: 5, d3: 9, d4: 5, mean: 5 },
  { d1: 13, d2: 7, d3: 5, d4: 3, mean: 7 },
  { d1: 22, d2: 6, d3: 2, d4: 10, mean: 10 },
];

type Params = {
  d1: number;
  d2: number;
  d3: number;
  d4: number;
  mean: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "stats_sample_mean_basic",
      title,
      difficulty: 1,
      tags: ["statistics", "mean", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `ある日の来客数データとする。平均を求めよ。\\n` +
        `${params.d1}, ${params.d2}, ${params.d3}, ${params.d4}`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).mean);
    },
    explain(params) {
      const p = params as Params;
      const sum = p.d1 + p.d2 + p.d3 + p.d4;
      return `
### この問題の解説
合計は ${sum}、個数は 4。
平均は $${sum}/4=${p.mean}$。
`;
    },
  };
}

export const statsSampleMeanTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`stats_sample_mean_basic_${i + 1}`, `平均 ${i + 1}`)
);
