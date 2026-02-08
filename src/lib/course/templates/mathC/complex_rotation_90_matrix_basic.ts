// src/lib/course/templates/mathC/complex_rotation_90_matrix_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x: 2, y: 1, xr: -1 },
  { x: -3, y: 2, xr: -2 },
  { x: 0, y: 4, xr: -4 },
  { x: 5, y: 0, xr: 0 },
  { x: -2, y: -1, xr: 1 },
  { x: 3, y: -2, xr: 2 },
  { x: 0, y: -5, xr: 5 },
  { x: -4, y: 0, xr: 0 },
];

type Params = {
  x: number;
  y: number;
  xr: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_90_matrix_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const statement = `点 $(x,y)=(${params.x},${params.y})$ を原点中心に $90^\\circ$ 反時計回りに回転した地図上の点の $x$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).xr);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$90^\\circ$ 回転で $(x,y)\\\to(-y,x)$。
ここでは $x'=-${p.y}=${p.xr}$。
`;
    },
  };
}

export const complexRotation90MatrixTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_90_matrix_basic_${i + 1}`, `90度回転 ${i + 1}`)
);

const extraRotation90Templates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_rotation_90_matrix_basic_${i + 7}`, `90度回転 追加${i + 1}`)
);

complexRotation90MatrixTemplates.push(...extraRotation90Templates);
