// src/lib/course/templates/mathC/complex_equation_abs_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 1, r: 3, ans: 3 },
  { a: -3, b: 4, r: 5, ans: 5 },
  { a: 0, b: -6, r: 6, ans: 6 },
  { a: 5, b: 12, r: 13, ans: 13 },
];

type Params = {
  a: number;
  b: number;
  r: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_equation_abs_basic",
      title,
      difficulty: 1,
      tags: ["complex", "equation"],
    },
    generate() {
      const params = buildParams();
      const z0 = texComplex(params.a, params.b);
      const statement = `地図上の点を表す複素数 $z$ が $|z-(${z0})|=${params.r}$ を満たすとき、$|z-(${z0})|$ の値を答えよ。`;
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
与えられた条件そのものが絶対値の値です。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexEquationAbsExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_equation_abs_basic2_${i + 1}`, `絶対値方程式 ${i + 1}`)
);
