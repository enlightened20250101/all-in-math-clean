// src/lib/course/templates/mathC/complex_square_real_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type SquareParams = {
  a: number;
  b: number;
  value: number;
};

const CASES: SquareParams[] = [
  { a: 2, b: 1, value: 3 },
  { a: 3, b: 1, value: 8 },
  { a: 4, b: 2, value: 12 },
  { a: 5, b: 1, value: 24 },
  { a: 1, b: 2, value: -3 },
  { a: 2, b: 3, value: -5 },
  { a: 3, b: 2, value: 5 },
  { a: 6, b: 2, value: 32 },
];

function buildParams(): SquareParams {
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
      const statement = `複素数 $z=${params.a}+${params.b}i$ とする。$z^2$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SquareParams).value);
    },
    explain(params) {
      const p = params as SquareParams;
      return `
### この問題の解説
$z^2=(a+bi)^2=(a^2-b^2)+2abi$ なので実部は $a^2-b^2$ です。
$${p.a}^2-${p.b}^2=${p.value}$ より答えは **${p.value}** です。
`;
    },
  };
}

export const complexSquareRealTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_square_real_basic_${i + 1}`, `複素数の平方 ${i + 1}`)
);

const extraSquareRealTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_square_real_basic_${i + 7}`, `複素数の平方 追加${i + 1}`)
);

complexSquareRealTemplates.push(...extraSquareRealTemplates);
