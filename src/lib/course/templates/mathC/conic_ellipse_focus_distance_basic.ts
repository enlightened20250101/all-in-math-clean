// src/lib/course/templates/mathC/conic_ellipse_focus_distance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, dist: 8 },
  { a: 13, b: 5, dist: 24 },
  { a: 10, b: 6, dist: 16 },
  { a: 15, b: 9, dist: 24 },
  { a: 25, b: 7, dist: 48 },
  { a: 17, b: 15, dist: 16 },
];

type Params = {
  a: number;
  b: number;
  dist: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_focus_distance_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の2焦点間の距離を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).dist);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
焦点距離は $2c$、$c^2=a^2-b^2$。
ここでは **${p.dist}**。
`;
    },
  };
}

export const conicEllipseFocusDistanceTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_focus_distance_basic_${i + 1}`, `焦点間距離 ${i + 1}`)
);

const extraEllipseFocusDistanceTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_ellipse_focus_distance_basic_${i + 7}`, `焦点間距離 追加${i + 1}`)
);

conicEllipseFocusDistanceTemplates.push(...extraEllipseFocusDistanceTemplates);
