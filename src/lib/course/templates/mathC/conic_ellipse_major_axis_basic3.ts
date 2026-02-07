// src/lib/course/templates/mathC/conic_ellipse_major_axis_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 4, b: 3, ans: 8 },
  { a: 7, b: 2, ans: 14 },
  { a: 9, b: 5, ans: 18 },
  { a: 12, b: 1, ans: 24 },
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
      topicId: "conic_ellipse_major_axis_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1\\ (a>b>0)$ の長軸の長さを求めよ。`;
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
長軸の長さは $2a$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicEllipseMajorAxisExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_major_axis_basic3_${i + 1}`, `長軸 ${i + 1}`)
);
