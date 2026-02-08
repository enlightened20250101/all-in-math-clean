// src/lib/course/templates/mathC/complex_add_modulus_square_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, c: 0, d: 0, ans: 25 },
  { a: 1, b: 2, c: 2, d: -2, ans: 9 },
  { a: -3, b: 4, c: 3, d: -4, ans: 0 },
  { a: 2, b: -1, c: 4, d: 3, ans: 40 },
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
      topicId: "complex_add_modulus_square_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${formatComplex(params.a, params.b)}$, $z_2=${formatComplex(params.c, params.d)}$ のとき、$|z_1+z_2|^2$ を求めよ。`;
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
$z_1+z_2$ を計算し、$|\\cdot|^2$ を求めます。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexAddModulusSquareExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_add_modulus_square_basic2_${i + 1}`, `和の絶対値二乗 ${i + 1}`)
);
