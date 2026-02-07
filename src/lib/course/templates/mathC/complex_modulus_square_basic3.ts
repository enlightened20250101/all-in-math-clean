// src/lib/course/templates/mathC/complex_modulus_square_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 4, b: 3, ans: 25 },
  { a: 12, b: 5, ans: 169 },
  { a: -9, b: 12, ans: 225 },
  { a: 15, b: 8, ans: 289 },
];

type Params = {
  a: number;
  b: number;
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
      topicId: "complex_modulus_square_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${formatComplex(params.a, params.b)}$ の $|z|^2$ を求めよ。`;
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
$|z|^2=a^2+b^2$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexModulusSquareExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_square_basic3_${i + 1}`, `絶対値の二乗 ${i + 1}`)
);
