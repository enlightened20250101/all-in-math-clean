// src/lib/course/templates/mathC/conic_ellipse_minor_axis_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 2, ans: 4 },
  { a: 7, b: 3, ans: 6 },
  { a: 9, b: 4, ans: 8 },
  { a: 10, b: 1, ans: 2 },
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
      topicId: "conic_ellipse_minor_axis_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1\\ (a>b>0)$ の短軸の長さを求めよ。`;
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
短軸の長さは $2b$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicEllipseMinorAxisExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_minor_axis_basic2_${i + 1}`, `短軸 ${i + 1}`)
);
