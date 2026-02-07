// src/lib/course/templates/mathC/complex_conjugate_modulus_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, r: 5 },
  { a: 5, b: 12, r: 13 },
  { a: 8, b: 15, r: 17 },
  { a: 6, b: 8, r: 10 },
  { a: 7, b: 24, r: 25 },
  { a: 9, b: 12, r: 15 },
  { a: 4, b: 3, r: 5 },
  { a: 1, b: 0, r: 1 },
];

type Params = {
  a: number;
  b: number;
  r: number;
};

function buildParams(): Params {
  return pick(CASES);
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
      const statement = `複素数 $z=${params.a}+${params.b}i$ の共役 $\\overline{z}$ の絶対値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$|\overline{z}|=|z|=\\sqrt{a^2+b^2}$。
ここでは **${p.r}**。
`;
    },
  };
}

export const complexConjugateModulusTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_conjugate_modulus_basic_${i + 1}`, `共役の絶対値 ${i + 1}`)
);

const extraConjugateModulusTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_conjugate_modulus_basic_${i + 7}`, `共役の絶対値 追加${i + 1}`)
);

complexConjugateModulusTemplates.push(...extraConjugateModulusTemplates);
