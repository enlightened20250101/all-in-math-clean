// src/lib/course/templates/mathC/vector_distance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type DistParams = {
  x1: number;
  y1: number;
  z1: number;
  x2: number;
  y2: number;
  z2: number;
  value: number;
};

function buildParams(): DistParams {
  const x1 = randInt(-3, 3);
  const y1 = randInt(-3, 3);
  const z1 = randInt(-3, 3);
  const x2 = randInt(-3, 3);
  const y2 = randInt(-3, 3);
  const z2 = randInt(-3, 3);
  const value = (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2;
  return { x1, y1, z1, x2, y2, z2, value };
}

function explain(params: DistParams) {
  return `
### この問題の解説
距離の二乗は
$$
|AB|^2=(x_1-x_2)^2+(y_1-y_2)^2+(z_1-z_2)^2
$$
より
$$
${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_distance_basic",
      title,
      difficulty: 1,
      tags: ["vector", "distance", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `ドローンの位置を表す点 $A(${params.x1},${params.y1},${params.z1})$, $B(${params.x2},${params.y2},${params.z2})$ の距離の二乗 $|AB|^2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DistParams).value);
    },
    explain(params) {
      return explain(params as DistParams);
    },
  };
}

const extraVectorDistanceTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_distance_basic_${i + 21}`, `空間距離 追加${i + 1}`)
);

export const vectorDistanceTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_distance_basic_${i + 1}`, `空間距離 ${i + 1}`)),
  ...extraVectorDistanceTemplates,
];
