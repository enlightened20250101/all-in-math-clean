// src/lib/course/templates/mathC/complex_distance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function wrapNum(v: number) {
  return v < 0 ? `(${v})` : `${v}`;
}

type DistParams = { a1: number; b1: number; a2: number; b2: number; value: number };

function buildParams(): DistParams {
  const a1 = randInt(-4, 4);
  const b1 = randInt(-4, 4);
  const a2 = randInt(-4, 4);
  const b2 = randInt(-4, 4);
  const value = (a1 - a2) ** 2 + (b1 - b2) ** 2;
  return { a1, b1, a2, b2, value };
}

function explain(params: DistParams) {
  const a1 = wrapNum(params.a1);
  const a2 = wrapNum(params.a2);
  const b1 = wrapNum(params.b1);
  const b2 = wrapNum(params.b2);
  return `
### この問題の解説
距離の二乗は
$$
(${a1}-${a2})^2+(${b1}-${b2})^2=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_distance_basic",
      title,
      difficulty: 1,
      tags: ["complex", "distance"],
    },
    generate() {
      const params = buildParams();
      const z1 = texComplex(params.a1, params.b1);
      const z2 = texComplex(params.a2, params.b2);
      const statement = `座標平面上の点を表す複素数 $z_1=${z1}$, $z_2=${z2}$ に対応する点の距離の二乗を求めよ。`;
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

export const complexDistanceTemplates: QuestionTemplate[] = Array.from(
  { length: 32 },
  (_, i) => buildTemplate(`complex_distance_basic_${i + 1}`, `複素数距離 ${i + 1}`)
);
