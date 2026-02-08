// src/lib/course/templates/mathC/complex_equation_real_imag_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: -3, ans: 2 },
  { a: -1, b: 4, ans: -1 },
  { a: 5, b: 1, ans: 5 },
  { a: -2, b: -2, ans: -2 },
  { a: 3, b: 0, ans: 3 },
  { a: -4, b: 2, ans: -4 },
  { a: 6, b: -1, ans: 6 },
  { a: -5, b: 3, ans: -5 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_equation_real_imag_basic",
      title,
      difficulty: 1,
      tags: ["complex", "equation"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ の実部を求めよ。`;
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
実部は係数 $a$ なので **${p.ans}**。
`;
    },
  };
}

export const complexEquationRealImagTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_real_imag_basic_${i + 1}`, `実部 ${i + 1}`)
);

const extraEquationRealImagTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_equation_real_imag_basic_${i + 7}`, `実部 追加${i + 1}`)
);

complexEquationRealImagTemplates.push(...extraEquationRealImagTemplates);
