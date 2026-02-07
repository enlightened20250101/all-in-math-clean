// src/lib/course/templates/mathC/complex_triangle_area_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 3, ans: 6 },
  { x1: -2, y1: 0, x2: 2, y2: 0, x3: 0, y3: 5, ans: 10 },
  { x1: 1, y1: 1, x2: 5, y2: 1, x3: 1, y3: 4, ans: 6 },
  { x1: -3, y1: -1, x2: 1, y2: -1, x3: -3, y3: 3, ans: 8 },
];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_triangle_area_basic",
      title,
      difficulty: 1,
      tags: ["complex", "geometry"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数平面上の三点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$, $C(${params.x3},${params.y3})$ が作る三角形の面積を求めよ。`;
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
底辺×高さの $\\frac12$、または行列式で求めます。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexTriangleAreaExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_triangle_area_basic2_${i + 1}`, `三角形の面積 ${i + 1}`)
);
