// src/lib/course/templates/mathC/complex_modulus_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, ans: 5 },
  { a: 5, b: 12, ans: 13 },
  { a: 7, b: 24, ans: 25 },
  { a: 8, b: 15, ans: 17 },
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
      topicId: "complex_modulus_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${formatComplex(params.a, params.b)}$ の絶対値 $|z|$ を求めよ。`;
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
$|a+bi|=\\sqrt{a^2+b^2}$。
ここでは **${p.ans}** です。
`;
    },
  };
}

export const complexModulusExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_basic2_${i + 1}`, `絶対値の計算 ${i + 1}`)
);
