// src/lib/course/templates/mathC/normal_backsolve_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 50, sigma: 10, z: 1, ans: 60 },
  { mu: 80, sigma: 8, z: -1, ans: 72 },
  { mu: 40, sigma: 5, z: 2, ans: 50 },
  { mu: 30, sigma: 3, z: -2, ans: 24 },
  { mu: 70, sigma: 5, z: 1, ans: 75 },
  { mu: 90, sigma: 10, z: 0, ans: 90 },
  { mu: 60, sigma: 4, z: -1, ans: 56 },
  { mu: 55, sigma: 5, z: 2, ans: 65 },
  { mu: 65, sigma: 5, z: -2, ans: 55 },
  { mu: 75, sigma: 15, z: 1, ans: 90 },
  { mu: 40, sigma: 6, z: 1, ans: 46 },
  { mu: 85, sigma: 5, z: -1, ans: 80 },
];

type Params = {
  mu: number;
  sigma: number;
  z: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
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
      const statement = `正規分布 $N(${params.mu},${params.sigma}^2)$ に従う $X$ について、$Z=\\frac{X-${params.mu}}{${params.sigma}}$ とおく。$Z=${params.z}$ のときの $X$ を求めよ。`;
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
$X=\\mu+\\sigma Z$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const normalBacksolveExtraTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_backsolve_basic2_${i + 1}`, `逆算 ${i + 1}`)
);
