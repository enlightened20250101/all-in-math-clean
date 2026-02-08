// src/lib/course/templates/mathC/complex_perpendicular_condition_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 0, c: 0, d: 1, ans: 0 },
  { a: 1, b: 1, c: 1, d: -1, ans: 0 },
  { a: 2, b: 1, c: 1, d: -2, ans: 0 },
  { a: 1, b: 2, c: 2, d: 1, ans: 1 },
  { a: 3, b: 0, c: 0, d: 3, ans: 0 },
  { a: -2, b: 3, c: 3, d: 2, ans: 0 },
  { a: 2, b: 1, c: 2, d: 1, ans: 1 },
  { a: -1, b: 2, c: 2, d: -1, ans: 0 },
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
      topicId: "complex_perpendicular_condition_basic",
      title,
      difficulty: 1,
      tags: ["complex", "geometry"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す地図上の点を表す複素数 $z_1=${texComplex(params.a, params.b)}$, $z_2=${texComplex(
        params.c,
        params.d
      )}$ に対して、$\\frac{z_1}{z_2}$ が純虚数なら 0、純虚数でなければ 1 を答えよ。`;
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
$\\frac{z_1}{z_2}$ が純虚数 ⇔ $z_1$ と $z_2$ が直交（直角）。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexPerpendicularConditionTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_perpendicular_condition_basic_${i + 1}`, `直交判定 ${i + 1}`)
);

const extraPerpendicularConditionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`complex_perpendicular_condition_basic_${i + 7}`, `直交判定 追加${i + 1}`)
);

complexPerpendicularConditionTemplates.push(...extraPerpendicularConditionTemplates);
