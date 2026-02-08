// src/lib/course/templates/mathB/stats_sampling_mean_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 50, n: 25 },
  { mu: 72, n: 36 },
  { mu: 80, n: 16 },
  { mu: 65, n: 49 },
  { mu: 60, n: 9 },
  { mu: 55, n: 4 },
  { mu: 68, n: 64 },
  { mu: 75, n: 100 },
  { mu: 90, n: 25 },
  { mu: 40, n: 16 },
  { mu: 85, n: 36 },
  { mu: 52, n: 49 },
  { mu: 58, n: 81 },
  { mu: 62, n: 121 },
  { mu: 70, n: 144 },
  { mu: 95, n: 64 },
  { mu: 45, n: 9 },
  { mu: 78, n: 49 },
];

type Params = {
  mu: number;
  n: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "stats_sampling_mean_basic",
      title,
      difficulty: 1,
      tags: ["statistics", "sampling", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `製品の重さの母平均が ${params.mu} とする。大きさ ${params.n} の標本を取ったとき、標本平均の平均を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).mu);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
標本平均の期待値は母平均に等しいので ${p.mu}。
`;
    },
  };
}

export const statsSamplingMeanTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`stats_sampling_mean_basic_${i + 1}`, `標本平均 ${i + 1}`)
);
