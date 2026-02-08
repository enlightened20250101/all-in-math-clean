// src/lib/course/templates/mathC/vector_midpoint_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type MidParams = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midx: number;
};

const CASES: MidParams[] = [
  { x1: 0, y1: 0, x2: 4, y2: 2, midx: 2 },
  { x1: -2, y1: 3, x2: 2, y2: -1, midx: 0 },
  { x1: 1, y1: -2, x2: 5, y2: 4, midx: 3 },
  { x1: -4, y1: 0, x2: 2, y2: 6, midx: -1 },
];

function buildParams(): MidParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_midpoint_basic",
      title,
      difficulty: 1,
      tags: ["vector", "midpoint", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `地点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$ の中継点の $x$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MidParams).midx);
    },
    explain(params) {
      const p = params as MidParams;
      return `
### この問題の解説
中点の $x$ 座標は $(${p.x1}+${p.x2})/2=${p.midx}$ です。
答えは **${p.midx}** です。
`;
    },
  };
}

const extraVectorMidpointTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_midpoint_basic_${i + 21}`, `中点 追加${i + 1}`)
);

export const vectorMidpointTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_midpoint_basic_${i + 1}`, `中点 ${i + 1}`)),
  ...extraVectorMidpointTemplates,
];
