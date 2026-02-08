// src/lib/course/templates/mathC/vector_line_point_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

const T_VALUES = [1, 2, 3];

type LinePointParams = {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  t: number;
  y: number;
};

function buildParams(): LinePointParams {
  const x0 = randInt(-2, 2);
  const y0 = randInt(-2, 2);
  const vx = pick([-2, -1, 1, 2]);
  const vy = pick([-2, -1, 1, 2]);
  const t = pick(T_VALUES);
  const y = y0 + t * vy;
  return { x0, y0, vx, vy, t, y };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_line_point_basic",
      title,
      difficulty: 1,
      tags: ["vector", "line", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `道路の進行線が点 $P(${params.x0},${params.y0})$ を通り方向ベクトル $\\vec{v}=(${params.vx},${params.vy})$ をもつとする。$t=${params.t}$ のときの $y$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LinePointParams).y);
    },
    explain(params) {
      const p = params as LinePointParams;
      return `
### この問題の解説
$y=${p.y0}+${p.t}\\times${p.vy}=${p.y}$ です。
答えは **${p.y}** です。
`;
    },
  };
}

export const vectorLinePointTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) =>
  buildTemplate(`vector_line_point_basic_${i + 1}`, `直線上の点 ${i + 1}`)
);

const extraVectorLinePointTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_line_point_basic_${i + 21}`, `直線上の点 追加${i + 1}`)
);

vectorLinePointTemplates.push(...extraVectorLinePointTemplates);
