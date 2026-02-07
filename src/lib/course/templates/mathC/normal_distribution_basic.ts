// src/lib/course/templates/mathC/normal_distribution_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type NormParams = { mu: number; sigma2: number; ask: number; value: number };

function buildParams(): NormParams {
  const mu = randInt(-3, 5);
  const sigma2 = pick([1, 4, 9]);
  const ask = pick([0, 1]); // 0: mean, 1: variance
  const value = ask === 0 ? mu : sigma2;
  return { mu, sigma2, ask, value };
}

function explain(params: NormParams) {
  return `
### この問題の解説
正規分布 $N(\\mu,\\sigma^2)$ の平均は $\\mu$、分散は $\\sigma^2$。
答えは **${params.value}** です。
`;
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
      const statement =
        params.ask === 0
          ? `正規分布 $N(${params.mu},${params.sigma2})$ の平均を求めよ。`
          : `正規分布 $N(${params.mu},${params.sigma2})$ の分散を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as NormParams).value);
    },
    explain(params) {
      return explain(params as NormParams);
    },
  };
}

export const normalDistributionTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`normal_distribution_basic_${i + 1}`, `正規分布 ${i + 1}`)
);
