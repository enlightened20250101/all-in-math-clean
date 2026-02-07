// src/lib/course/templates/mathC/vector_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

const T_VALUES = [2, 3];

type LineParams = {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  t: number;
  answer: number;
};

function buildParams(): LineParams {
  const x0 = randInt(-3, 3);
  const y0 = randInt(-3, 3);
  const vx = pick([-2, -1, 1, 2]);
  const vy = pick([-2, -1, 1, 2]);
  const t = pick(T_VALUES);
  const answer = x0 + t * vx;
  return { x0, y0, vx, vy, t, answer };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_line_basic",
      title,
      difficulty: 1,
      tags: ["vector", "line", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `点 $P(${params.x0},${params.y0})$ を通り方向ベクトル $\\vec{v}=(${params.vx},${params.vy})$ の直線を $P+t\\vec{v}$ と表す。$t=${params.t}$ のときの $x$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LineParams).answer);
    },
    explain(params) {
      const p = params as LineParams;
      return `
### この問題の解説
$x=${p.x0}+${p.t}\\times${p.vx}=${p.answer}$ です。
答えは **${p.answer}** です。
`;
    },
  };
}

const extraVectorLineTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_line_basic_${i + 21}`, `直線のパラメータ 追加${i + 1}`)
);

export const vectorLineTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 20 }, (_, i) => buildTemplate(`vector_line_basic_${i + 1}`, `直線のパラメータ ${i + 1}`)),
  ...extraVectorLineTemplates,
];
