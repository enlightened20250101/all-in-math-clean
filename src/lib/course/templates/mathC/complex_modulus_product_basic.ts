// src/lib/course/templates/mathC/complex_modulus_product_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, c: 5, d: 12 },
  { a: 6, b: 8, c: 3, d: 4 },
  { a: 5, b: 12, c: 8, d: 15 },
  { a: 7, b: 24, c: 3, d: 4 },
  { a: 8, b: 15, c: 1, d: 2 },
  { a: 4, b: 3, c: 6, d: 8 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  value: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const r1 = Math.round(Math.sqrt(base.a * base.a + base.b * base.b));
  const r2 = Math.round(Math.sqrt(base.c * base.c + base.d * base.d));
  return { ...base, value: r1 * r2 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_modulus_product_basic",
      title,
      difficulty: 1,
      tags: ["complex", "modulus"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${params.a}+${params.b}i$, $z_2=${params.c}+${params.d}i$ のとき、$|z_1z_2|$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      const r1 = Math.round(Math.sqrt(p.a * p.a + p.b * p.b));
      const r2 = Math.round(Math.sqrt(p.c * p.c + p.d * p.d));
      return `
### この問題の解説
$|z_1z_2|=|z_1||z_2|$。
$|z_1|=${r1}, |z_2|=${r2}$ より
$$
|z_1z_2|=${r1}\times ${r2}=${p.value}
$$
`;
    },
  };
}

export const complexModulusProductTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_modulus_product_basic_${i + 1}`, `積の絶対値 ${i + 1}`)
);

const extraModulusProductTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`complex_modulus_product_basic_${i + 7}`, `積の絶対値 追加${i + 1}`)
);

complexModulusProductTemplates.push(...extraModulusProductTemplates);
