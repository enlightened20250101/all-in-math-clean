// src/lib/course/templates/mathC/conic_hyperbola_asymptote_slope_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, b: 8, slope: 4 },
  { a: 3, b: 9, slope: 3 },
  { a: 4, b: 12, slope: 3 },
  { a: 5, b: 15, slope: 3 },
];

type Params = {
  a: number;
  b: number;
  slope: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_asymptote_slope_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の漸近線の傾きを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).slope);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
漸近線の傾きは $\\frac{b}{a}$。
ここでは **${p.slope}**。
`;
    },
  };
}

export const conicHyperbolaAsymptoteSlopeExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_slope_basic3_${i + 1}`, `漸近線の傾き ${i + 1}`)
);
