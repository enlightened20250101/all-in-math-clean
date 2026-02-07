// src/lib/course/templates/mathC/conic_hyperbola_asymptote_slope_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 1, b: 2, m: 2 },
  { a: 2, b: 2, m: 1 },
  { a: 2, b: 4, m: 2 },
  { a: 3, b: 6, m: 2 },
  { a: 3, b: 3, m: 1 },
];

type Params = {
  a: number;
  b: number;
  m: number;
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
      const statement = `双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の漸近線の傾き（正の方）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).m);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
漸近線は $y=\pm \\frac{b}{a}x$。
よって傾きは **${p.m}** です。
`;
    },
  };
}

export const conicHyperbolaAsymptoteSlopeTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_slope_basic_${i + 1}`, `漸近線 ${i + 1}`)
);

const extraHyperbolaAsymptoteSlopeTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_slope_basic_${i + 7}`, `漸近線 追加${i + 1}`)
);

conicHyperbolaAsymptoteSlopeTemplates.push(...extraHyperbolaAsymptoteSlopeTemplates);
