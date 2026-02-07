// src/lib/course/templates/mathB/stats_standard_error_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { sigma: 6, n: 9, se: 2 },
  { sigma: 8, n: 16, se: 2 },
  { sigma: 9, n: 9, se: 3 },
  { sigma: 12, n: 4, se: 6 },
  { sigma: 10, n: 25, se: 2 },
  { sigma: 15, n: 25, se: 3 },
  { sigma: 14, n: 49, se: 2 },
  { sigma: 21, n: 49, se: 3 },
  { sigma: 18, n: 36, se: 3 },
  { sigma: 24, n: 36, se: 4 },
  { sigma: 20, n: 100, se: 2 },
  { sigma: 30, n: 100, se: 3 },
  { sigma: 16, n: 64, se: 2 },
  { sigma: 25, n: 25, se: 5 },
  { sigma: 12, n: 36, se: 2 },
  { sigma: 27, n: 81, se: 3 },
  { sigma: 35, n: 49, se: 5 },
  { sigma: 40, n: 100, se: 4 },
];

type Params = {
  sigma: number;
  n: number;
  se: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "stats_standard_error_basic",
      title,
      difficulty: 1,
      tags: ["statistics", "standard-error", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `母標準偏差が ${params.sigma}、標本サイズが ${params.n} のとき、標本平均の標準偏差（標準誤差）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).se);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
標準誤差は $\sigma/\\sqrt{n}$。
$$
${p.sigma}/\\sqrt{${p.n}}=${p.se}
$$
`;
    },
  };
}

export const statsStandardErrorTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`stats_standard_error_basic_${i + 1}`, `標準誤差 ${i + 1}`)
);
