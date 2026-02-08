// src/lib/course/templates/mathC/conic_hyperbola_asymptote_equation_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, b: 4, ans: 2 },
  { a: 3, b: 6, ans: 2 },
  { a: 4, b: 8, ans: 2 },
  { a: 5, b: 10, ans: 2 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
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
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の測定された設計上の漸近線 $y=mx$ の係数 $m$ を求めよ。`;
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
測定された設計上の漸近線は $y=\\pm\\frac{b}{a}x$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaAsymptoteEquationExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_equation_basic2_${i + 1}`, `測定された設計上の漸近線 ${i + 1}`)
);
