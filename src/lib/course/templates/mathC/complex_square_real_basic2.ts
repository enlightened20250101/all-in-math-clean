// src/lib/course/templates/mathC/complex_square_real_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 3, b: 4, ans: -7 },
  { a: 5, b: 2, ans: 21 },
  { a: -2, b: 6, ans: -32 },
  { a: 1, b: -5, ans: -24 },
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
      topicId: "complex_square_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "square"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ の $z^2$ の実部を求めよ。`;
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
$(a+bi)^2=(a^2-b^2)+2abi$。
実部は **${p.ans}**。
`;
    },
  };
}

export const complexSquareRealExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_square_real_basic2_${i + 1}`, `平方の実部 ${i + 1}`)
);
