// src/lib/course/templates/mathC/vector_plane_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type PlaneParams = { a: number; b: number; c: number; x0: number; y0: number; z0: number; value: number };

function buildParams(): PlaneParams {
  const a = randInt(-3, 3) || 1;
  const b = randInt(-3, 3);
  const c = randInt(-3, 3);
  const x0 = randInt(-3, 3);
  const y0 = randInt(-3, 3);
  const z0 = randInt(-3, 3);
  const value = a * x0 + b * y0 + c * z0;
  return { a, b, c, x0, y0, z0, value };
}

function explain(params: PlaneParams) {
  return `
### この問題の解説
平面 $ax+by+cz=d$ は点 $(x_0,y_0,z_0)$ を通るので
$$
d=ax_0+by_0+cz_0
$$
となり、$d=${params.value}$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_plane_basic",
      title,
      difficulty: 1,
      tags: ["vector", "plane", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `壁面を表す平面が法線ベクトル $(a,b,c)=(${params.a},${params.b},${params.c})$ をもち点 $P(${params.x0},${params.y0},${params.z0})$ を通るとき、方程式 $ax+by+cz=d$ における $d$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as PlaneParams).value);
    },
    explain(params) {
      return explain(params as PlaneParams);
    },
  };
}

const extraVectorPlaneTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_plane_basic_${i + 21}`, `平面方程式 追加${i + 1}`)
);

export const vectorPlaneTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_plane_basic_${i + 1}`, `平面方程式 ${i + 1}`)),
  ...extraVectorPlaneTemplates,
];
