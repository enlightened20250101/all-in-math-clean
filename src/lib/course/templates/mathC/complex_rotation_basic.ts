// src/lib/course/templates/mathC/complex_rotation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

type RotParams = { a: number; b: number; value: number };

function buildParams(): RotParams {
  const a = randInt(-4, 4);
  const b = randInt(-4, 4);
  const value = -b; // Re(i(a+bi)) = -b
  return { a, b, value };
}

function explain(params: RotParams) {
  return `
### この問題の解説
$$
i(a+bi)=-b+ai
$$
なので実部は $-b$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_rotation_basic",
      title,
      difficulty: 1,
      tags: ["complex", "rotation"],
    },
    generate() {
      const params = buildParams();
      const statement = `複素数 $z=${texComplex(params.a, params.b)}$ について、$iz$ の実部を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as RotParams).value);
    },
    explain(params) {
      return explain(params as RotParams);
    },
  };
}

export const complexRotationTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`complex_rotation_basic_${i + 1}`, `複素数の回転 ${i + 1}`)
);

const extraComplexRotationTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`complex_rotation_basic_${i + 21}`, `複素数の回転 追加${i + 1}`)
);

complexRotationTemplates.push(...extraComplexRotationTemplates);
