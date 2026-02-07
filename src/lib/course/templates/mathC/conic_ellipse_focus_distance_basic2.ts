// src/lib/course/templates/mathC/conic_ellipse_focus_distance_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, ans: 8 },
  { a: 10, b: 6, ans: 16 },
  { a: 13, b: 5, ans: 24 },
  { a: 8, b: 6, ans: 10 },
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
      topicId: "conic_ellipse_focus_distance_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の2つの焦点間の距離を求めよ。`;
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
$c^2=a^2-b^2$ より焦点間の距離は $2c$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicEllipseFocusDistanceExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_focus_distance_basic2_${i + 1}`, `焦点間距離 ${i + 1}`)
);
