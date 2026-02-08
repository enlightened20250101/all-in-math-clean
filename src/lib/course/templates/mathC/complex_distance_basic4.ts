// src/lib/course/templates/mathC/complex_distance_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: -1, b: -2, c: 5, d: 6, ans: 10 },
  { a: 3, b: 4, c: -3, d: -4, ans: 10 },
  { a: 0, b: 0, c: 9, d: 12, ans: 15 },
  { a: -6, b: 8, c: 0, d: 0, ans: 10 },
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
答えは **${p.ans}**。
`;
    },
  };
}

export const complexDistanceExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_distance_basic4_${i + 1}`, `距離の計算 ${i + 1}`)
);
