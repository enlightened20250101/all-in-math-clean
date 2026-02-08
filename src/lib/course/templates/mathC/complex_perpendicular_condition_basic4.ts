// src/lib/course/templates/mathC/complex_perpendicular_condition_basic4.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 3, c: 3, d: -1, ans: 0 },
  { a: -2, b: 5, c: 5, d: 2, ans: 0 },
  { a: 4, b: 1, c: 2, d: 3, ans: 1 },
  { a: -3, b: -4, c: 4, d: -3, ans: 0 },
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
      const statement = `地図上の点を表す複素数 $z_1=${texComplex(params.a, params.b)}$ と $z_2=${texComplex(
        params.c,
        params.d
      )}$ が直交（直角）するかを調べ、直交なら 0、そうでなければ 1 を答えよ。`;
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
内積が 0 なら直交します。
答えは **${(params as Params).ans}**。
`;
    },
  };
}

export const complexPerpendicularConditionExtraTemplates3: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_perpendicular_condition_basic4_${i + 1}`, `直交判定 ${i + 1}`)
);
