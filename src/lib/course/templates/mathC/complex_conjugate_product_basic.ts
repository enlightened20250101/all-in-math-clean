// src/lib/course/templates/mathC/complex_conjugate_product_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type ConjParams = {
  a: number;
  b: number;
  value: number;
};

const CASES: ConjParams[] = [
  { a: 3, b: 4, value: 25 },
  { a: 1, b: 2, value: 5 },
  { a: 2, b: 5, value: 29 },
  { a: 4, b: 1, value: 17 },
  { a: 6, b: 8, value: 100 },
  { a: 5, b: 12, value: 169 },
  { a: 7, b: 24, value: 625 },
  { a: 8, b: 15, value: 289 },
];

function buildParams(): ConjParams {
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
      const statement = `複素数 $z=${params.a}+${params.b}i$ とする。$z\\overline{z}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ConjParams).value);
    },
    explain(params) {
      const p = params as ConjParams;
      return `
### この問題の解説
$z\\overline{z}=a^2+b^2$ なので
$$
${p.a}^2+${p.b}^2=${p.value}
$$
です。答えは **${p.value}** です。
`;
    },
  };
}

export const complexConjugateProductTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_conjugate_product_basic_${i + 1}`, `共役積 ${i + 1}`)
);

const extraConjugateProductTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_conjugate_product_basic_${i + 7}`, `共役積 追加${i + 1}`)
);

complexConjugateProductTemplates.push(...extraConjugateProductTemplates);
