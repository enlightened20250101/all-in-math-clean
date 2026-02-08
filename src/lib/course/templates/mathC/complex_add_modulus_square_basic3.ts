// src/lib/course/templates/mathC/complex_add_modulus_square_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 1, b: 2, c: 2, d: 1, ans: 9 },
  { a: -3, b: 4, c: 3, d: 0, ans: 16 },
  { a: 5, b: 0, c: 0, d: 12, ans: 169 },
  { a: -6, b: -8, c: 6, d: 0, ans: 64 },
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

export const complexAddModulusSquareExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_add_modulus_square_basic3_${i + 1}`, `和の絶対値二乗 ${i + 1}`)
);
