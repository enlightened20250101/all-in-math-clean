// src/lib/course/templates/mathC/complex_distance_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 0, b: 0, c: 3, d: 4, ans: 5 },
  { a: 1, b: 2, c: 4, d: 6, ans: 5 },
  { a: -2, b: 1, c: 1, d: 5, ans: 5 },
  { a: -6, b: 2, c: 6, d: 10, ans: 13 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
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
      topicId: "complex_distance_basic",
      title,
      difficulty: 1,
      tags: ["complex", "distance"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${formatComplex(params.a, params.b)}$ と $z_2=${formatComplex(params.c, params.d)}$ の距離を求めよ。`;
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
距離は $\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const complexDistanceExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_distance_basic2_${i + 1}`, `距離の計算 ${i + 1}`)
);
