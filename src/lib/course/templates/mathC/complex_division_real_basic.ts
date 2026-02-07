// src/lib/course/templates/mathC/complex_division_real_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 2, c: 1, d: 1, real: 2 },
  { a: 3, b: -3, c: 1, d: -1, real: 3 },
  { a: 4, b: 0, c: 2, d: 0, real: 2 },
  { a: 6, b: 2, c: 2, d: 1, real: 2 },
  { a: 4, b: 2, c: 1, d: 1, real: 3 },
  { a: 2, b: -2, c: 1, d: -1, real: 2 },
  { a: 8, b: 0, c: 4, d: 0, real: 2 },
  { a: 6, b: -2, c: 2, d: -1, real: 2 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  real: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_division_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "division"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z_1=${texComplex(params.a, params.b)}$, $z_2=${texComplex(
        params.c,
        params.d
      )}$ とする。$\\frac{z_1}{z_2}$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).real);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$\\frac{z_1}{z_2}=\\frac{(a+bi)(c-di)}{c^2+d^2}$。
実部は $\\frac{ac+bd}{c^2+d^2}$。
ここでは **${p.real}**。
`;
    },
  };
}

export const complexDivisionRealTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_division_real_basic_${i + 1}`, `除法の実部 ${i + 1}`)
);

const extraDivisionRealTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_division_real_basic_${i + 7}`, `除法の実部 追加${i + 1}`)
);

complexDivisionRealTemplates.push(...extraDivisionRealTemplates);
