// src/lib/course/templates/mathC/complex_conjugate_modulus_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, ans: 5 },
  { a: 5, b: 12, ans: 13 },
  { a: -8, b: 15, ans: 17 },
  { a: 7, b: -24, ans: 25 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function formatComplex(a: number, b: number): string {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_conjugate_modulus_basic",
      title,
      difficulty: 1,
      tags: ["complex", "conjugate"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${formatComplex(params.a, params.b)}$ の共役 $\\overline{z}$ の絶対値 $|\\overline{z}|$ を求めよ。`;
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
$|\\overline{z}|=|z|$。
答えは **${p.ans}**。
`;
    },
  };
}

export const complexConjugateModulusExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_conjugate_modulus_basic2_${i + 1}`, `共役の絶対値 ${i + 1}`)
);
