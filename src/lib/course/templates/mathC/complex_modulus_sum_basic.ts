// src/lib/course/templates/mathC/complex_modulus_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, c: 0, d: 1, sum: 6 },
  { a: 5, b: 12, c: 0, d: 2, sum: 15 },
  { a: 6, b: 8, c: 0, d: 3, sum: 13 },
  { a: 7, b: 24, c: 0, d: 1, sum: 26 },
  { a: 8, b: 15, c: 0, d: 2, sum: 19 },
  { a: 9, b: 12, c: 0, d: 3, sum: 18 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  sum: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_modulus_sum_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${params.a}+${params.b}i$, $z_2=${params.c}+${params.d}i$ のとき、$|z_1|+|z_2|$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).sum);
    },
    explain(params) {
      const p = params as Params;
      const r1 = Math.round(Math.sqrt(p.a * p.a + p.b * p.b));
      const r2 = Math.round(Math.sqrt(p.c * p.c + p.d * p.d));
      return `
### この問題の解説
$|z_1|=${r1}, |z_2|=${r2}$ より
$$
|z_1|+|z_2|=${r1}+${r2}=${p.sum}
$$
`;
    },
  };
}

export const complexModulusSumTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_sum_basic_${i + 1}`, `絶対値の和 ${i + 1}`)
);

const extraModulusSumTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`complex_modulus_sum_basic_${i + 7}`, `絶対値の和 追加${i + 1}`)
);

complexModulusSumTemplates.push(...extraModulusSumTemplates);
