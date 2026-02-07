// src/lib/course/templates/mathC/complex_rotation_90_matrix_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x: 3, y: 4, ask: 0, ans: -4 },
  { x: 3, y: 4, ask: 1, ans: 3 },
  { x: -2, y: 5, ask: 0, ans: -5 },
  { x: -2, y: 5, ask: 1, ans: -2 },
];

type Params = {
  x: number;
  y: number;
  ask: number;
  ans: number;
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
      const label = params.ask === 0 ? "x" : "y";
      const statement = `点 $(x,y)=(${params.x},${params.y})$ を $90^\\circ$ 回転した点の ${label} 座標を求めよ。`;
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
      const label = p.ask === 0 ? "x" : "y";
      return `
### この問題の解説
$(x,y)$ を $90^\\circ$ 回転すると $(-y,x)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexRotation90MatrixExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_90_matrix_basic2_${i + 1}`, `90度回転 ${i + 1}`)
);
