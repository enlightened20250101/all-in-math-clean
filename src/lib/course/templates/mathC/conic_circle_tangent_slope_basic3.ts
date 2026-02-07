// src/lib/course/templates/mathC/conic_circle_tangent_slope_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x: 2, y: 1, r2: 5, ans: -2 },
  { x: -3, y: 1, r2: 10, ans: 3 },
  { x: 4, y: 2, r2: 20, ans: -2 },
  { x: -6, y: 2, r2: 40, ans: 3 },
];

type Params = {
  x: number;
  y: number;
  r2: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_tangent_slope_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle", "tangent"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=${params.r2}$ 上の点 $(${params.x},${params.y})$ における接線の傾きを求めよ。`;
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
接線は半径と直交するので、傾きは $-x/y$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicCircleTangentSlopeExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_slope_basic3_${i + 1}`, `接線の傾き ${i + 1}`)
);
