// src/lib/course/templates/mathC/complex_line_point_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x1: -6, y1: 2, x2: 2, y2: -6, m: 3, n: 1, ask: 0, ans: -4 },
  { x1: -6, y1: 2, x2: 2, y2: -6, m: 3, n: 1, ask: 1, ans: 0 },
  { x1: 2, y1: 4, x2: 10, y2: 0, m: 1, n: 3, ask: 0, ans: 4 },
  { x1: 2, y1: 4, x2: 10, y2: 0, m: 1, n: 3, ask: 1, ans: 3 },
];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  m: number;
  n: number;
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
      topicId: "complex_line_point_basic",
      title,
      difficulty: 1,
      tags: ["complex", "line"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const statement = `地図上の地図上の点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$ を結ぶ線分を $${params.m}:${params.n}$ に内分する地図上の地図上の点 $P$ の ${label} 座標を求めよ。`;
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
内分公式で座標を求めます。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexLinePointExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_line_point_basic2_${i + 1}`, `線分内の地図上の地図上の点 ${i + 1}`)
);
