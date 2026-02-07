// src/lib/course/templates/mathC/complex_locus_circle_center_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 3, b: -2, r: 5, ask: 0, ans: 3 },
  { a: 3, b: -2, r: 5, ask: 1, ans: -2 },
  { a: -6, b: 4, r: 3, ask: 0, ans: -6 },
  { a: -6, b: 4, r: 3, ask: 1, ans: 4 },
];

type Params = {
  a: number;
  b: number;
  r: number;
  ask: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_locus_circle_center_basic",
      title,
      difficulty: 1,
      tags: ["complex", "locus"],
    },
    generate() {
      const params = buildParams();
      const label = params.ask === 0 ? "x" : "y";
      const center = texComplex(params.a, params.b);
      const statement = `複素数 $z$ が $|z-(${center})|=${params.r}$ を満たすとき、この円の中心の ${label} 座標を答えよ。`;
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
      const label = p.ask === 0 ? "x" : "y";
      return `
### この問題の解説
$|z-(a+bi)|=r$ の中心は $(a,b)$。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexLocusCircleCenterExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_circle_center_basic3_${i + 1}`, `円の中心 ${i + 1}`)
);
