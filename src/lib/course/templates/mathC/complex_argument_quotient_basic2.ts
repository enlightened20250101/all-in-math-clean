// src/lib/course/templates/mathC/complex_argument_quotient_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 200, b: 30, ans: 170 },
  { a: 60, b: 150, ans: 270 },
  { a: 330, b: 90, ans: 240 },
  { a: 10, b: 200, ans: 170 },
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
      const statement = `複素数 $z_1,z_2$ の偏角がそれぞれ ${params.a}^\\circ, ${params.b}^\\circ$ のとき、$\\frac{z_1}{z_2}$ の偏角を $0^\\circ\\le\\theta<360^\\circ$ で答えよ。`;
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

export const complexArgumentQuotientExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_quotient_basic2_${i + 1}`, `偏角の差 ${i + 1}`)
);
