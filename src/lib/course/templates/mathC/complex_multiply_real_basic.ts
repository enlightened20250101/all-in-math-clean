// src/lib/course/templates/mathC/complex_multiply_real_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function wrapNum(v: number) {
  return v < 0 ? `(${v})` : `${v}`;
}

const CASES = [
  { a: 2, b: 1, c: 3, d: -2 },
  { a: -1, b: 2, c: 4, d: 1 },
  { a: 3, b: -1, c: 2, d: 2 },
  { a: -2, b: -3, c: 1, d: -2 },
  { a: 1, b: 3, c: -2, d: 1 },
  { a: -3, b: 1, c: 2, d: -1 },
  { a: 2, b: -2, c: -1, d: 3 },
  { a: -1, b: -2, c: -2, d: 1 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  d: number;
  real: number;
};

function buildParams(): Params {
  const base = pick(CASES);
  const real = base.a * base.c - base.b * base.d;
  return { ...base, real };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_multiply_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "multiply"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す複素数 $z_1=${texComplex(params.a, params.b)}$, $z_2=${texComplex(
        params.c,
        params.d
      )}$ とする。$z_1z_2$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).real);
    },
    explain(params) {
      const p = params as Params;
      const a = wrapNum(p.a);
      const b = wrapNum(p.b);
      const c = wrapNum(p.c);
      const d = wrapNum(p.d);
      return `
### この問題の解説
$z_1z_2=(ac-bd)+(ad+bc)i$ より実部は $ac-bd$。
$$
${a}\cdot ${c}-${b}\cdot ${d}=${p.real}
$$
`;
    },
  };
}

export const complexMultiplyRealTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_multiply_real_basic_${i + 1}`, `実部 ${i + 1}`)
);

const extraComplexMultiplyRealTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`complex_multiply_real_basic_${i + 7}`, `実部 追加${i + 1}`)
);

complexMultiplyRealTemplates.push(...extraComplexMultiplyRealTemplates);
