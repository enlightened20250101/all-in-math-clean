// src/lib/course/templates/mathC/conic_ellipse_value_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, x: 3, ans: 4 },
  { a: 10, b: 6, x: 6, ans: 8 },
  { a: 13, b: 5, x: 12, ans: 5 },
  { a: 8, b: 6, x: 4, ans: 3 },
];

type Params = {
  a: number;
  b: number;
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
      topicId: "conic_ellipse_value_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ 上で $x=${params.x}$ のときの $y$ の値を求めよ（正の値）。`;
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
式に $x$ を代入して $y^2$ を求めます。
正の値は **${p.ans}**。
`;
    },
  };
}

export const conicEllipseValueExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_value_basic2_${i + 1}`, `楕円の値 ${i + 1}`)
);
