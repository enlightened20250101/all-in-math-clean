// src/lib/course/templates/mathC/conic_ellipse_tangent_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 2, x0: 3, y0: 0, ans: 1 },
  { a: 4, b: 1, x0: 4, y0: 0, ans: 1 },
  { a: 5, b: 3, x0: 5, y0: 0, ans: 1 },
  { a: 6, b: 2, x0: 6, y0: 0, ans: 1 },
  { a: 7, b: 4, x0: 7, y0: 0, ans: 1 },
  { a: 8, b: 3, x0: 8, y0: 0, ans: 1 },
];

type Params = {
  a: number;
  b: number;
  x0: number;
  y0: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_tangent_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の点 $(${params.x0},${params.y0})$ における接線の $x$ の係数を求めよ。`;
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
接線は $\\frac{xx_0}{a^2}+\\frac{yy_0}{b^2}=1$。
ここでは $x_0=a, y_0=0$ なので係数は 1。
`;
    },
  };
}

export const conicEllipseTangentTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_tangent_basic_${i + 1}`, `楕円の接線 ${i + 1}`)
);

const extraEllipseTangentTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_ellipse_tangent_basic_${i + 7}`, `楕円の接線 追加${i + 1}`)
);

conicEllipseTangentTemplates.push(...extraEllipseTangentTemplates);
