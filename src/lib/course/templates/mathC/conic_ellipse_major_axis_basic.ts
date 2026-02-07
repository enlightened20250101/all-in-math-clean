// src/lib/course/templates/mathC/conic_ellipse_major_axis_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 2, major: 6 },
  { a: 4, b: 1, major: 8 },
  { a: 5, b: 3, major: 10 },
  { a: 6, b: 2, major: 12 },
  { a: 7, b: 4, major: 14 },
  { a: 8, b: 3, major: 16 },
];

type Params = {
  a: number;
  b: number;
  major: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_major_axis_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の長軸の長さを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).major);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
長軸の長さは $2a$。
よって **${p.major}** です。
`;
    },
  };
}

export const conicEllipseMajorAxisTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_major_axis_basic_${i + 1}`, `長軸 ${i + 1}`)
);

const extraEllipseMajorAxisTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_ellipse_major_axis_basic_${i + 7}`, `長軸 追加${i + 1}`)
);

conicEllipseMajorAxisTemplates.push(...extraEllipseMajorAxisTemplates);
