// src/lib/course/templates/mathC/conic_ellipse_minor_axis_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, minor: 6 },
  { a: 4, b: 2, minor: 4 },
  { a: 6, b: 1, minor: 2 },
  { a: 7, b: 4, minor: 8 },
  { a: 8, b: 3, minor: 6 },
  { a: 9, b: 5, minor: 10 },
];

type Params = {
  a: number;
  b: number;
  minor: number;
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
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の短軸の長さを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).minor);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
短軸の長さは $2b$。
よって **${p.minor}** です。
`;
    },
  };
}

export const conicEllipseMinorAxisTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_minor_axis_basic_${i + 1}`, `短軸 ${i + 1}`)
);

const extraEllipseMinorAxisTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_ellipse_minor_axis_basic_${i + 7}`, `短軸 追加${i + 1}`)
);

conicEllipseMinorAxisTemplates.push(...extraEllipseMinorAxisTemplates);
