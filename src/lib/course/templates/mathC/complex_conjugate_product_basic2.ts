// src/lib/course/templates/mathC/complex_conjugate_product_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 3, b: 4, ans: 25 },
  { a: 5, b: 12, ans: 169 },
  { a: 1, b: -7, ans: 50 },
  { a: -6, b: 2, ans: 40 },
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
      topicId: "complex_conjugate_product_basic",
      title,
      difficulty: 1,
      tags: ["complex", "conjugate"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ に対して、$z\\overline{z}$ の値を求めよ。`;
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
$z\\overline{z}=a^2+b^2$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexConjugateProductExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_conjugate_product_basic2_${i + 1}`, `共役積 ${i + 1}`)
);
