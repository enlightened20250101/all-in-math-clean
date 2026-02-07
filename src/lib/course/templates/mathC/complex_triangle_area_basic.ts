// src/lib/course/templates/mathC/complex_triangle_area_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x1: 0, y1: 0, x2: 2, y2: 0, x3: 0, y3: 3, area: 3 },
  { x1: 1, y1: 1, x2: 4, y2: 1, x3: 1, y3: 5, area: 6 },
  { x1: -1, y1: 0, x2: 2, y2: 0, x3: -1, y3: 4, area: 6 },
  { x1: 0, y1: 0, x2: 4, y2: 0, x3: 0, y3: 4, area: 8 },
  { x1: -2, y1: 0, x2: 2, y2: 0, x3: 0, y3: 4, area: 8 },
  { x1: 0, y1: 0, x2: 6, y2: 0, x3: 0, y3: 2, area: 6 },
];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  area: number;
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
      const statement = `複素数平面上の点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$, $C(${params.x3},${params.y3})$ が作る三角形の面積を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).area);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
面積は $\\frac{1}{2}|(x_2-x_1)(y_3-y_1)-(x_3-x_1)(y_2-y_1)|$。
ここでは **${p.area}**。
`;
    },
  };
}

export const complexTriangleAreaTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_triangle_area_basic_${i + 1}`, `三角形の面積 ${i + 1}`)
);

const extraTriangleAreaTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_triangle_area_basic_${i + 7}`, `三角形の面積 追加${i + 1}`)
);

complexTriangleAreaTemplates.push(...extraTriangleAreaTemplates);
