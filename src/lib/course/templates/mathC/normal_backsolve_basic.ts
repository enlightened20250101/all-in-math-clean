// src/lib/course/templates/mathC/normal_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type BacksolveParams = {
  mu: number;
  sigma: number;
  z: number;
  answer: number;
};

function buildParams(): BacksolveParams {
  const mu = pick([50, 60, 70]);
  const sigma = pick([5, 10]);
  const z = pick([-2, -1, 0, 1, 2]);
  const answer = mu + z * sigma;
  return { mu, sigma, z, answer };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "normal_backsolve_basic",
      title,
      difficulty: 1,
      tags: ["probability", "normal"],
    },
    generate() {
      const params = buildParams();
      const statement = `正規分布 $N(${params.mu},${params.sigma}^2)$ で $z=(x-${params.mu})/${params.sigma}$ とするとき、$z=${params.z}$ に対応する $x$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as BacksolveParams).answer);
    },
    explain(params) {
      const p = params as BacksolveParams;
      return `
### この問題の解説
$z=${p.z}$ なので
$$
${p.z}=\\frac{x-${p.mu}}{${p.sigma}}
$$
より $x=${p.answer}$ です。答えは **${p.answer}** です。
`;
    },
  };
}

export const normalBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_backsolve_basic_${i + 1}`, `標準化の逆 ${i + 1}`)
);
