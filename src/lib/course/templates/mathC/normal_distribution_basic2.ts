// src/lib/course/templates/mathC/normal_distribution_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 50, sigma: 10, ask: 0, ans: 50 },
  { mu: 60, sigma: 5, ask: 1, ans: 25 },
  { mu: 80, sigma: 8, ask: 0, ans: 80 },
  { mu: 40, sigma: 4, ask: 1, ans: 16 },
  { mu: 70, sigma: 7, ask: 0, ans: 70 },
  { mu: 55, sigma: 6, ask: 1, ans: 36 },
  { mu: 90, sigma: 12, ask: 0, ans: 90 },
  { mu: 45, sigma: 3, ask: 1, ans: 9 },
  { mu: 65, sigma: 9, ask: 0, ans: 65 },
  { mu: 30, sigma: 2, ask: 1, ans: 4 },
  { mu: 75, sigma: 5, ask: 0, ans: 75 },
  { mu: 85, sigma: 11, ask: 1, ans: 121 },
];

type Params = {
  mu: number;
  sigma: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "normal_distribution_basic",
      title,
      difficulty: 1,
      tags: ["probability", "normal"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "平均" : "分散";
      const statement = `正規分布 $N(${params.mu},${params.sigma}^2)$ の${label}を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      const label = p.ask === 0 ? "平均" : "分散";
      return `
### この問題の解説
平均は $\\mu$、分散は $\\sigma^2$。
${label}は **${p.ans}**。
`;
    },
  };
}

export const normalDistributionExtraTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_distribution_basic2_${i + 1}`, `正規分布の基本 ${i + 1}`)
);
