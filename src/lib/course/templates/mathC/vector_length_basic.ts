// src/lib/course/templates/mathC/vector_length_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type LenParams = { x: number; y: number; value: number };

function buildParams(): LenParams {
  const x = randInt(-4, 4);
  const y = randInt(-4, 4);
  const value = x * x + y * y;
  return { x, y, value };
}

function explain(params: LenParams) {
  return `
### この問題の解説
$$
|\\vec{a}|^2 = x^2 + y^2
$$
より
$$
${params.x}^2 + ${params.y}^2 = ${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_length_basic",
      title,
      difficulty: 1,
      tags: ["vector", "length", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `移動量を表すベクトル $\\vec{a}=(${params.x},${params.y})$ の長さの二乗 $|\\vec{a}|^2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LenParams).value);
    },
    explain(params) {
      return explain(params as LenParams);
    },
  };
}

export const vectorLengthTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`vector_length_basic_${i + 1}`, `ベクトル長さ ${i + 1}`)
);

const extraVectorLengthTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`vector_length_basic_${i + 21}`, `ベクトル長さ 追加${i + 1}`)
);

vectorLengthTemplates.push(...extraVectorLengthTemplates);
