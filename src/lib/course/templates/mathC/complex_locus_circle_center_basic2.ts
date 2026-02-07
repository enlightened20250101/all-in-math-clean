// src/lib/course/templates/mathC/complex_locus_circle_center_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: -1, r: 3, ask: 0, ans: 2 },
  { a: -4, b: 5, r: 2, ask: 1, ans: 5 },
  { a: 0, b: 3, r: 4, ask: 0, ans: 0 },
  { a: 6, b: 1, r: 5, ask: 1, ans: 1 },
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
$|z-(a+bi)|=r$ は中心 $(a,b)$ の円。
${label} 座標は **${p.ans}**。
`;
    },
  };
}

export const complexLocusCircleCenterExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_locus_circle_center_basic2_${i + 1}`, `円の中心 ${i + 1}`)
);
