// src/lib/course/templates/mathC/complex_midpoint_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: -5, b: 1, c: 3, d: 5, ask: 0, ans: -1 },
  { a: -5, b: 1, c: 3, d: 5, ask: 1, ans: 3 },
  { a: 2, b: -6, c: 10, d: 2, ask: 0, ans: 6 },
  { a: 2, b: -6, c: 10, d: 2, ask: 1, ans: -2 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function formatComplex(a: number, b: number): string {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_midpoint_basic",
      title,
      difficulty: 1,
      tags: ["complex", "midpoint"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const statement = `複素数 $z_1=${formatComplex(params.a, params.b)}$ と $z_2=${formatComplex(params.c, params.d)}$ の中点の ${label} 座標を求めよ。`;
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
中点は $\\left(\\frac{x_1+x_2}{2},\\frac{y_1+y_2}{2}\\right)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexMidpointExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_midpoint_basic4_${i + 1}`, `中点 ${i + 1}`)
);
