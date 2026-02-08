// src/lib/course/templates/mathC/complex_conjugate_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function wrapNum(v: number) {
  return v < 0 ? `(${v})` : `${v}`;
}

type ConjParams = { a: number; b: number; value: number };

function buildParams(): ConjParams {
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const value = a * a + b * b;
  return { a, b, value };
}

function explain(params: ConjParams) {
  const a = wrapNum(params.a);
  const b = wrapNum(params.b);
  return `
### この問題の解説
$$
z\\overline{z}=|z|^2=a^2+b^2
$$
なので
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
      topicId: "complex_conjugate_basic",
      title,
      difficulty: 1,
      tags: ["complex", "conjugate"],
    },
    generate() {
      const params = buildParams();
      const statement = `座標平面上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ について、$z\\overline{z}$ を求めよ。`;
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
      return explain(params as ConjParams);
    },
  };
}

export const complexConjugateTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_conjugate_basic_${i + 1}`, `共役（座標平面上の点を表す複素数） ${i + 1}`)
);

const extraComplexConjugateTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_conjugate_basic_${i + 21}`, `共役（座標平面上の点を表す複素数） 追加${i + 1}`)
);

complexConjugateTemplates.push(...extraComplexConjugateTemplates);
