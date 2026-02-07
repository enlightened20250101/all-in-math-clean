// src/lib/course/templates/mathC/complex_rotation_imag_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 2, theta: 90, imag: 1 },
  { a: 2, b: 1, theta: 90, imag: 2 },
  { a: 3, b: 0, theta: 90, imag: 3 },
  { a: 0, b: 4, theta: 180, imag: -4 },
  { a: -2, b: 1, theta: 90, imag: -2 },
  { a: 4, b: -1, theta: 90, imag: 4 },
  { a: 0, b: 3, theta: 90, imag: 0 },
  { a: -3, b: 0, theta: 180, imag: 0 },
];

type Params = {
  a: number;
  b: number;
  theta: number;
  imag: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_imag_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${texComplex(params.a, params.b)}$ を $${params.theta}^\\circ$ 回転した複素数 $z'$ の虚部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).imag);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
回転は $z' = z(\\cos\\theta+i\\sin\\theta)$。
ここでは $\\theta=${p.theta}^\\circ$ なので虚部は **${p.imag}**。
`;
    },
  };
}

export const complexRotationImagTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_imag_basic_${i + 1}`, `回転の虚部 ${i + 1}`)
);

const extraRotationImagTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_rotation_imag_basic_${i + 7}`, `回転の虚部 追加${i + 1}`)
);

complexRotationImagTemplates.push(...extraRotationImagTemplates);
