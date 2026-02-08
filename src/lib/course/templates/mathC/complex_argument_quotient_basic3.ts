// src/lib/course/templates/mathC/complex_argument_quotient_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 210, b: 30, ans: 180 },
  { a: 60, b: 200, ans: 220 },
  { a: 10, b: 350, ans: 20 },
  { a: 300, b: 120, ans: 180 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function norm(theta: number): number {
  const t = theta % 360;
  return t < 0 ? t + 360 : t;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_quotient_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const params = buildParams();
      const statement = `観測点を表す複素数 $z_1,z_2$ の点の偏角がそれぞれ ${params.a}^\\circ, ${params.b}^\\circ$ のとき、$\\frac{z_1}{z_2}$ の点の偏角を $0^\\circ\\le\\theta<360^\\circ$ で答えよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params: { ...params, ans: norm(params.ans) },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$\\arg\\left(\\frac{z_1}{z_2}\\right)=\\arg z_1-\\arg z_2$。
よって **${p.ans}^\\circ**。
`;
    },
  };
}

export const complexArgumentQuotientExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_quotient_basic3_${i + 1}`, `点の偏角の差 ${i + 1}`)
);
