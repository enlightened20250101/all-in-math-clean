// src/lib/course/templates/mathC/complex_section_external_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { x1: -4, y1: 2, x2: 6, y2: -2, m: 2, n: 1, ask: 0, ans: -14 },
  { x1: -4, y1: 2, x2: 6, y2: -2, m: 2, n: 1, ask: 1, ans: 6 },
  { x1: 1, y1: -3, x2: 5, y2: 5, m: 1, n: 2, ask: 0, ans: -3 },
  { x1: 1, y1: -3, x2: 5, y2: 5, m: 1, n: 2, ask: 1, ans: -11 },
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
      topicId: "complex_section_external_basic",
      title,
      difficulty: 1,
      tags: ["complex", "section"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const statement = `点 $A(${params.x1},${params.y1})$, $B(${params.x2},${params.y2})$ を $${params.m}:${params.n}$ に外分する点 $P$ の ${label} 座標を求めよ。`;
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
外分点は $\\left(\\frac{nx_1-mx_2}{n-m},\\frac{ny_1-my_2}{n-m}\\right)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexSectionExternalExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_section_external_basic2_${i + 1}`, `外分点 ${i + 1}`)
);
