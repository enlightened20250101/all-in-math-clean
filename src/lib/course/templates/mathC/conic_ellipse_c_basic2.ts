// src/lib/course/templates/mathC/conic_ellipse_c_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 4, c: 3 },
  { a: 13, b: 12, c: 5 },
  { a: 10, b: 6, c: 8 },
  { a: 25, b: 7, c: 24 },
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
      topicId: "conic_ellipse_c_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ に対して、$c$ を求めよ。`;
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
$c^2=a^2-b^2$。
答えは **${p.c}**。
`;
    },
  };
}

export const conicEllipseCExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_c_basic2_${i + 1}`, `c の計算 ${i + 1}`)
);
