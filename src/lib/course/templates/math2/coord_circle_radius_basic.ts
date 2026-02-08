// src/lib/course/templates/math2/coord_circle_radius_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

const TRIPLES = [
  { dx: 3, dy: 4, r: 5 },
  { dx: 4, dy: 3, r: 5 },
  { dx: 0, dy: 5, r: 5 },
  { dx: 5, dy: 0, r: 5 },
  { dx: 6, dy: 8, r: 10 },
  { dx: 8, dy: 6, r: 10 },
];

type Params = {
  h: number;
  k: number;
  x1: number;
  y1: number;
  r: number;
};

function buildParams(): Params {
  const t = pick(TRIPLES);
  const h = randInt(-3, 3);
  const k = randInt(-3, 3);
  const sx = Math.random() < 0.5 ? -1 : 1;
  const sy = Math.random() < 0.5 ? -1 : 1;
  const x1 = h + sx * t.dx;
  const y1 = k + sy * t.dy;
  return { h, k, x1, y1, r: t.r };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_circle_radius_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement =
        `水面に広がる波を円とみなし、中心 $C(${params.h},${params.k})$ をもつ。` +
        `点 $P(${params.x1},${params.y1})$ を通る円の半径を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).r);
    },
    explain(params) {
      const p = params as Params;
      const dx = p.x1 - p.h;
      const dy = p.y1 - p.k;
      return `
### この問題の解説
半径は $\\sqrt{(${dx})^2+(${dy})^2}$ なので
$$
\\sqrt{${dx * dx + dy * dy}}=${p.r}
$$
答えは **${p.r}** です。
`;
    },
  };
}

export const coordCircleRadiusTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_circle_radius_basic_${i + 1}`, `半径 ${i + 1}`)
);
