// src/lib/course/templates/mathC/complex_parallel_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 2, c: 2, d: 4, ans: 0 },
  { a: 2, b: -1, c: 4, d: -2, ans: 0 },
  { a: 1, b: 1, c: -2, d: -2, ans: 0 },
  { a: 1, b: 2, c: 1, d: -2, ans: 1 },
  { a: 3, b: 3, c: -6, d: -6, ans: 0 },
  { a: -2, b: 4, c: 1, d: -2, ans: 0 },
  { a: 2, b: 1, c: 1, d: 2, ans: 1 },
  { a: -3, b: 1, c: 2, d: 3, ans: 1 },
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

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_parallel_condition_basic",
      title,
      difficulty: 1,
      tags: ["complex", "geometry"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${texComplex(params.a, params.b)}$, $z_2=${texComplex(
        params.c,
        params.d
      )}$ に対して、$\\frac{z_1}{z_2}$ が実数なら 0、実数でなければ 1 を答えよ。`;
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
$\\frac{z_1}{z_2}$ が実数 ⇔ $z_1$ と $z_2$ が同一直線上。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexParallelConditionTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_parallel_condition_basic_${i + 1}`, `平行判定 ${i + 1}`)
);

const extraParallelConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`complex_parallel_condition_basic_${i + 7}`, `平行判定 追加${i + 1}`)
);

complexParallelConditionTemplates.push(...extraParallelConditionTemplates);
