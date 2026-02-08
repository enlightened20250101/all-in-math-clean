// src/lib/course/templates/mathC/conic_hyperbola_asymptote_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, b: 2, slope: 1 },
  { a: 3, b: 3, slope: 1 },
  { a: 4, b: 4, slope: 1 },
  { a: 1, b: 2, slope: 2 },
  { a: 2, b: 4, slope: 2 },
  { a: 3, b: 6, slope: 2 },
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
      topicId: "conic_hyperbola_asymptote_equation_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の設計上の漸近線 $y=mx$ の係数 $m$ を求めよ。`;
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
設計上の漸近線は $y=\pm \\frac{b}{a}x$。
ここでは $b=a$ なので $m=1$。
`;
    },
  };
}

export const conicHyperbolaAsymptoteEquationTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_equation_basic_${i + 1}`, `設計上の漸近線 ${i + 1}`)
);


const extraAsymptoteEquationTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_equation_basic_${i + 7}`, `設計上の漸近線 追加${i + 1}`)
);

conicHyperbolaAsymptoteEquationTemplates.push(...extraAsymptoteEquationTemplates);
