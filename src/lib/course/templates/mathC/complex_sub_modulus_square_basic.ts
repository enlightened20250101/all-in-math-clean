// src/lib/course/templates/mathC/complex_sub_modulus_square_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 2, c: 3, d: -1 },
  { a: -2, b: 1, c: 4, d: 3 },
  { a: 3, b: -2, c: -1, d: 4 },
  { a: 0, b: 3, c: 4, d: 0 },
  { a: 2, b: 1, c: -1, d: -2 },
  { a: -3, b: 2, c: 1, d: -1 },
  { a: 4, b: -1, c: 0, d: 3 },
  { a: 1, b: 0, c: -2, d: 0 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  val: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const x = base.a - base.c;
  const y = base.b - base.d;
  return { ...base, val: x * x + y * y };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_sub_modulus_square_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z_1=${texComplex(params.a, params.b)}$, $z_2=${texComplex(
        params.c,
        params.d
      )}$ のとき、$|z_1-z_2|^2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).val);
    },
    explain(params) {
      const p = params as Params;
      const x = p.a - p.c;
      const y = p.b - p.d;
      return `
### この問題の解説
$z_1-z_2=${texComplex(x, y)}$ なので
$$
|z_1-z_2|^2=${x}^2+${y}^2=${p.val}
$$
`;
    },
  };
}

export const complexSubModulusSquareTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_sub_modulus_square_basic_${i + 1}`, `差の絶対値 ${i + 1}`)
);

const extraSubModulusSquareTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_sub_modulus_square_basic_${i + 7}`, `差の絶対値 追加${i + 1}`)
);

complexSubModulusSquareTemplates.push(...extraSubModulusSquareTemplates);
