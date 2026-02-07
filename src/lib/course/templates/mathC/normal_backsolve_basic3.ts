// src/lib/course/templates/mathC/normal_backsolve_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { mu: 70, sigma: 10, z: 2, ans: 90 },
  { mu: 65, sigma: 5, z: -2, ans: 55 },
  { mu: 80, sigma: 8, z: -1, ans: 72 },
  { mu: 50, sigma: 10, z: 1, ans: 60 },
  { mu: 72, sigma: 6, z: 2, ans: 84 },
  { mu: 90, sigma: 10, z: -1, ans: 80 },
  { mu: 60, sigma: 5, z: 2, ans: 70 },
  { mu: 55, sigma: 5, z: -1, ans: 50 },
  { mu: 68, sigma: 4, z: 1, ans: 72 },
  { mu: 95, sigma: 5, z: -2, ans: 85 },
  { mu: 40, sigma: 6, z: 1, ans: 46 },
  { mu: 82, sigma: 4, z: -1, ans: 78 },
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
答えは **${p.ans}**。
`;
    },
  };
}

export const normalBacksolveExtraTemplates2: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`normal_backsolve_basic3_${i + 1}`, `逆算 ${i + 1}`)
);
