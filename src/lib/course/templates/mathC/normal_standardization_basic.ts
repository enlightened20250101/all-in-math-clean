// src/lib/course/templates/mathC/normal_standardization_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type StdParams = { mu: number; sigma: number; x: number; value: number };

function buildParams(): StdParams {
  const mu = randInt(-3, 4);
  const sigma = pick([1, 2, 3]);
  const k = randInt(-2, 2);
  const x = mu + k * sigma;
  const value = k;
  return { mu, sigma, x, value };
}

function explain(params: StdParams) {
  return `
### この問題の解説
標準化は
$$
z=\\frac{x-\\mu}{\\sigma}
$$
なので
$$
z=\\frac{${params.x}-${params.mu}}{${params.sigma}}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "normal_standardization_basic",
      title,
      difficulty: 1,
      tags: ["probability", "normal"],
    },
    generate() {
      const params = buildParams();
      const statement = `正規分布 $N(${params.mu},${params.sigma}^2)$ において $x=${params.x}$ を標準化した $z$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as StdParams).value);
    },
    explain(params) {
      return explain(params as StdParams);
    },
  };
}

export const normalStandardizationTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`normal_standardization_basic_${i + 1}`, `標準化 ${i + 1}`)
);
