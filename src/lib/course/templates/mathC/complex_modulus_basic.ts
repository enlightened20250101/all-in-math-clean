// src/lib/course/templates/mathC/complex_modulus_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function wrapNum(v: number) {
  return v < 0 ? `(${v})` : `${v}`;
}

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  const abs = Math.abs(b);
  return `${a}${sign}${abs}i`;
}

type ModParams = { a: number; b: number; value: number };

function buildParams(): ModParams {
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const value = a * a + b * b;
  return { a, b, value };
}

function explain(params: ModParams) {
  const a = wrapNum(params.a);
  const b = wrapNum(params.b);
  return `
### この問題の解説
$$
|a+bi|^2=a^2+b^2
$$
より
$$
${a}^2+${b}^2=${params.value}
$$
答えは **${params.value}** です。
`;
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
      const statement = `座標平面上の点を表す複素数 $${texComplex(params.a, params.b)}$ の絶対値の二乗 $|z|^2$ を求めよ。`;
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
      return explain(params as ModParams);
    },
  };
}

export const complexModulusTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_modulus_basic_${i + 1}`, `複素数の絶対値 ${i + 1}`)
);

const extraComplexModulusTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_modulus_basic_${i + 21}`, `複素数の絶対値 追加${i + 1}`)
);

complexModulusTemplates.push(...extraComplexModulusTemplates);
