// src/lib/course/templates/mathC/complex_rotation_real_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 1, b: 2, theta: 90, real: -2 },
  { a: 2, b: 1, theta: 90, real: -1 },
  { a: 3, b: 0, theta: 90, real: 0 },
  { a: 0, b: 4, theta: 180, real: 0 },
  { a: -2, b: 1, theta: 90, real: -1 },
  { a: 4, b: -1, theta: 90, real: 1 },
  { a: 0, b: 3, theta: 90, real: -3 },
  { a: -3, b: 0, theta: 180, real: 3 },
];

type Params = {
  a: number;
  b: number;
  theta: number;
  real: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_real_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${texComplex(params.a, params.b)}$ を $${params.theta}^\\circ$ 回転した複素数 $z'$ の実部を求めよ。`;
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
      return `
### この問題の解説
回転は $z' = z(\\cos\\theta+i\\sin\\theta)$。
ここでは $\\theta=${p.theta}^\\circ$ なので実部は **${p.real}**。
`;
    },
  };
}

export const complexRotationRealTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_real_basic_${i + 1}`, `回転の実部 ${i + 1}`)
);

const extraRotationRealTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_rotation_real_basic_${i + 7}`, `回転の実部 追加${i + 1}`)
);

complexRotationRealTemplates.push(...extraRotationRealTemplates);
