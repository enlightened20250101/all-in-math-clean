// src/lib/course/templates/mathC/conic_circle_tangent_point_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { r: 5, x: 3, y: 4, ans: 4 },
  { r: 10, x: 6, y: 8, ans: 6 },
  { r: 13, x: 5, y: 12, ans: 12 },
  { r: 25, x: 7, y: 24, ans: 7 },
];

type Params = {
  r: number;
  x: number;
  y: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_tangent_point_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle", "tangent"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=${params.r ** 2}$ 上の点 $(${params.x},${params.y})$ における接線 $${params.x}x+${params.y}y=${params.r ** 2}$ の $y$ 切片を求めよ。`;
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
接線 $ax+by=r^2$ の $y$ 切片は $r^2/b$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicCircleTangentPointExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_point_basic2_${i + 1}`, `接線の切片 ${i + 1}`)
);
