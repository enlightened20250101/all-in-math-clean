// src/lib/course/templates/mathC/vector_projection_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texEq } from "@/lib/format/tex";

type ProjectionParams = {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  value: number;
};

const CASES = [
  { ax: 1, ay: 3 },
  { ax: 2, ay: 4 },
  { ax: -1, ay: 3 },
  { ax: -2, ay: 0 },
  { ax: 4, ay: -2 },
  { ax: -3, ay: -1 },
];

function buildParams(): ProjectionParams {
  const base = pick(CASES);
  const ax = base.ax;
  const ay = base.ay;
  const bx = 1;
  const by = 1;
  const dot = ax + ay;
  const value = (dot * dot) / 2;
  return { ax, ay, bx, by, value };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_projection_basic",
      title,
      difficulty: 1,
      tags: ["vector", "projection", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `移動方向を表すベクトルとして、進行方向ベクトル $\\vec{a}=(${params.ax},${params.ay})$, $\\vec{b}=(${params.bx},${params.by})$ に対し、$\\vec{a}$ を $\\vec{b}$ に正射影したベクトルの長さの二乗を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ProjectionParams).value);
    },
    explain(params) {
      const p = params as ProjectionParams;
      const dot = p.ax + p.ay;
      return `
### この問題の解説
射影の長さの二乗は
$$
${texEq("(a\\cdot b)^2/|b|^2", `(${dot})^2/2=${p.value}`)}
$$
です。答えは **${p.value}** です。
`;
    },
  };
}

const extraVectorProjectionTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_projection_basic_${i + 21}`, `射影 追加${i + 1}`)
);

export const vectorProjectionTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_projection_basic_${i + 1}`, `射影 ${i + 1}`)),
  ...extraVectorProjectionTemplates,
];
