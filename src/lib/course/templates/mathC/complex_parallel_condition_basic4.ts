// src/lib/course/templates/mathC/complex_parallel_condition_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 2, c: 3, d: 6, ans: 0 },
  { a: -2, b: 4, c: 1, d: -2, ans: 0 },
  { a: 3, b: 1, c: 2, d: -5, ans: 1 },
  { a: -5, b: -1, c: 10, d: 2, ans: 0 },
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
      const statement = `地図上の点を表す複素数 $z_1=${texComplex(params.a, params.b)}$ と $z_2=${texComplex(
        params.c,
        params.d
      )}$ が同一直線上（同一直線上）かどうかを調べ、平行なら 0、そうでなければ 1 を答えよ。`;
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
      return `
### この問題の解説
比が実数なら平行です。
答えは **${(params as Params).ans}**。
`;
    },
  };
}

export const complexParallelConditionExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_parallel_condition_basic4_${i + 1}`, `平行判定 ${i + 1}`)
);
