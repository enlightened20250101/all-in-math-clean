// src/lib/course/templates/mathC/normal_standardization_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 72, sigma: 6, x: 84, ans: 2 },
  { mu: 90, sigma: 10, x: 70, ans: -2 },
  { mu: 100, sigma: 20, x: 120, ans: 1 },
  { mu: 30, sigma: 5, x: 20, ans: -2 },
  { mu: 60, sigma: 10, x: 50, ans: -1 },
  { mu: 40, sigma: 5, x: 45, ans: 1 },
  { mu: 55, sigma: 5, x: 65, ans: 2 },
  { mu: 75, sigma: 15, x: 60, ans: -1 },
  { mu: 80, sigma: 8, x: 88, ans: 1 },
  { mu: 68, sigma: 4, x: 72, ans: 1 },
  { mu: 92, sigma: 6, x: 80, ans: -2 },
  { mu: 36, sigma: 3, x: 39, ans: 1 },
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
答えは **${p.ans}**。
`;
    },
  };
}

export const normalStandardizationExtraTemplates3: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_standardization_basic4_${i + 1}`, `標準化 ${i + 1}`)
);
