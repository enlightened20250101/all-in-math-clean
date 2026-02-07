// src/lib/course/templates/mathC/complex_locus_circle_radius_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 3, r: 5, ans: 5 },
  { a: -4, b: 1, r: 3, ans: 3 },
  { a: 0, b: -6, r: 7, ans: 7 },
  { a: 5, b: -2, r: 4, ans: 4 },
];

type Params = {
  a: number;
  b: number;
  r: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_locus_circle_radius_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const center = texComplex(params.a, params.b);
      const statement = `複素数 $z$ が $|z-(${center})|=${params.r}$ を満たすとき、この円の半径を答えよ。`;
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
$|z-(a+bi)|=r$ は半径 $r$ の円。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexLocusCircleRadiusExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_circle_radius_basic3_${i + 1}`, `円の半径 ${i + 1}`)
);
