// src/lib/course/templates/mathC/complex_rotation_180_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

const CASES = [
  { a: 2, b: 3, ans: -2 },
  { a: -1, b: 4, ans: 1 },
  { a: 5, b: -2, ans: -5 },
  { a: 0, b: 3, ans: 0 },
  { a: -4, b: -1, ans: 4 },
  { a: 3, b: 0, ans: -3 },
  { a: 6, b: 2, ans: -6 },
  { a: -2, b: 5, ans: 2 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_180_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const statement = `地図上の点を表す地図上の点を表す複素数 $z=${texComplex(params.a, params.b)}$ を $180^\\circ$ 回転した複素数 $z'$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$180^\\circ$ 回転は $z'=-z$ なので実部は **${p.ans}**。
`;
    },
  };
}

export const complexRotation180Templates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_rotation_180_basic_${i + 1}`, `180度回転 ${i + 1}`)
);

const extraRotation180Templates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_rotation_180_basic_${i + 7}`, `180度回転 追加${i + 1}`)
);

complexRotation180Templates.push(...extraRotation180Templates);
