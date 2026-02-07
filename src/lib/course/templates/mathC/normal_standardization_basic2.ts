// src/lib/course/templates/mathC/normal_standardization_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 50, sigma: 10, x: 70, ans: 2 },
  { mu: 60, sigma: 5, x: 50, ans: -2 },
  { mu: 80, sigma: 8, x: 88, ans: 1 },
  { mu: 40, sigma: 4, x: 32, ans: -2 },
  { mu: 72, sigma: 6, x: 78, ans: 1 },
  { mu: 90, sigma: 10, x: 100, ans: 1 },
  { mu: 65, sigma: 5, x: 75, ans: 2 },
  { mu: 55, sigma: 5, x: 45, ans: -2 },
  { mu: 30, sigma: 3, x: 27, ans: -1 },
  { mu: 45, sigma: 9, x: 54, ans: 1 },
  { mu: 70, sigma: 10, x: 80, ans: 1 },
  { mu: 80, sigma: 8, x: 72, ans: -1 },
];

type Params = {
  mu: number;
  sigma: number;
  x: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
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
      const statement = `正規分布 $N(${params.mu},${params.sigma}^2)$ に従う $X$ について、$Z=\\frac{X-${params.mu}}{${params.sigma}}$ とおく。$X=${params.x}$ のときの $Z$ を求めよ。`;
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
      return `
### この問題の解説
$Z=\\frac{x-\\mu}{\\sigma}$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const normalStandardizationExtraTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_standardization_basic2_${i + 1}`, `標準化 ${i + 1}`)
);
