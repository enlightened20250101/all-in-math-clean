// src/lib/course/templates/mathC/complex_midpoint_distance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x1: 0, y1: 0, x2: 4, y2: 0, dist: 2 },
  { x1: -2, y1: 0, x2: 2, y2: 0, dist: 2 },
  { x1: 0, y1: -3, x2: 0, y2: 3, dist: 3 },
  { x1: -4, y1: 0, x2: 4, y2: 0, dist: 4 },
  { x1: 0, y1: -6, x2: 0, y2: 6, dist: 6 },
  { x1: -3, y1: 0, x2: 3, y2: 0, dist: 3 },
];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dist: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_midpoint_distance_basic",
      title,
      difficulty: 1,
      tags: ["complex", "geometry"],
    },
    generate() {
      const params = buildParams();
      const mx = (params.x1 + params.x2) / 2;
      const my = (params.y1 + params.y2) / 2;
      const statement = `複素平面上で、点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$ の中点 $M(${mx},${my})$ と点 $A$ の距離を求めよ。`;
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
中点は $\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\right)$。
$AM$ は $AB$ の半分なので距離は **${p.dist}**。
`;
    },
  };
}

export const complexMidpointDistanceTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_midpoint_distance_basic_${i + 1}`, `中点と距離 ${i + 1}`)
);

const extraMidpointDistanceTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_midpoint_distance_basic_${i + 7}`, `中点と距離 追加${i + 1}`)
);

complexMidpointDistanceTemplates.push(...extraMidpointDistanceTemplates);
