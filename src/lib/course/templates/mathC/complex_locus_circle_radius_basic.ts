// src/lib/course/templates/mathC/complex_locus_circle_radius_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: -2, r: 3 },
  { a: -3, b: 1, r: 4 },
  { a: 2, b: 2, r: 2 },
  { a: 0, b: 0, r: 5 },
  { a: -4, b: -1, r: 6 },
  { a: 3, b: 3, r: 3 },
];

type Params = {
  a: number;
  b: number;
  r: number;
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
      const statement = `複素数 $z$ が $|z-(${center})|=${params.r}$ を満たすとき、この図形の半径を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$|z-(a+bi)|=r$ は中心 $(a,b)$、半径 $r$ の円。
よって半径は **${p.r}**。
`;
    },
  };
}

export const complexLocusCircleRadiusTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_circle_radius_basic_${i + 1}`, `軌跡の半径 ${i + 1}`)
);

const extraLocusCircleRadiusTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_locus_circle_radius_basic_${i + 7}`, `軌跡の半径 追加${i + 1}`)
);

complexLocusCircleRadiusTemplates.push(...extraLocusCircleRadiusTemplates);
