// src/lib/course/templates/mathC/complex_equation_conjugate_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 3, ans: 2 },
  { a: -1, b: 4, ans: -1 },
  { a: 5, b: -2, ans: 5 },
  { a: -3, b: -1, ans: -3 },
  { a: 4, b: 1, ans: 4 },
  { a: -2, b: 5, ans: -2 },
  { a: 6, b: -3, ans: 6 },
  { a: -5, b: 2, ans: -5 },
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
      topicId: "complex_equation_conjugate_basic",
      title,
      difficulty: 1,
      tags: ["complex", "conjugate"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ とする。$z+\\overline{z}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, 2 * (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$z+\overline{z}=2\Re(z)=2a$。
よって **${2 * p.ans}**。
`;
    },
  };
}

export const complexEquationConjugateTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_conjugate_basic_${i + 1}`, `共役 ${i + 1}`)
);

const extraEquationConjugateTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_equation_conjugate_basic_${i + 7}`, `共役 追加${i + 1}`)
);

complexEquationConjugateTemplates.push(...extraEquationConjugateTemplates);
