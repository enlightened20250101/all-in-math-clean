// src/lib/course/templates/mathC/complex_modulus_square_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type ModParams = {
  a: number;
  b: number;
  value: number;
};

const CASES: ModParams[] = [
  { a: 1, b: 2, value: 5 },
  { a: 3, b: 4, value: 25 },
  { a: 2, b: 5, value: 29 },
  { a: 4, b: 1, value: 17 },
  { a: 6, b: 8, value: 100 },
  { a: 5, b: 12, value: 169 },
  { a: 7, b: 24, value: 625 },
  { a: 8, b: 15, value: 289 },
];

function buildParams(): ModParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_modulus_square_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${params.a}+${params.b}i$ の $|z|^2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ModParams).value);
    },
    explain(params) {
      const p = params as ModParams;
      return `
### この問題の解説
$|z|^2=a^2+b^2$ なので ${p.a}^2+${p.b}^2=${p.value} です。
答えは **${p.value}** です。
`;
    },
  };
}

export const complexModulusSquareTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_square_basic_${i + 1}`, `絶対値の二乗 ${i + 1}`)
);

const extraModulusSquareTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_modulus_square_basic_${i + 7}`, `絶対値の二乗 追加${i + 1}`)
);

complexModulusSquareTemplates.push(...extraModulusSquareTemplates);
