// src/lib/course/templates/mathC/conic_hyperbola_c_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, c: 5 },
  { a: 5, b: 12, c: 13 },
  { a: 6, b: 8, c: 10 },
  { a: 7, b: 24, c: 25 },
];

type Params = {
  a: number;
  b: number;
  c: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_c_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ に対して、$c$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).c);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$c^2=a^2+b^2$。
答えは **${p.c}**。
`;
    },
  };
}

export const conicHyperbolaCExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_c_basic2_${i + 1}`, `c の計算 ${i + 1}`)
);
