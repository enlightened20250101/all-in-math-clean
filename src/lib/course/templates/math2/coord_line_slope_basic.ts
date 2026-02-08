// src/lib/course/templates/math2/coord_line_slope_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

const SLOPES = [-3, -2, -1, 1, 2, 3];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  m: number;
};

function buildParams(): Params {
  for (let i = 0; i < 50; i += 1) {
    const m = pick(SLOPES);
    const x1 = randInt(-3, 3);
    const dx = pick([1, 2, 3, 4]);
    const x2 = x1 + dx;
    const y1 = randInt(-4, 4);
    const y2 = y1 + m * dx;
    if (Math.abs(y2) <= 10) {
      return { x1, y1, x2, y2, m };
    }
  }
  return { x1: 0, y1: 0, x2: 1, y2: 1, m: 1 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_line_slope_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const { x1, y1, x2, y2 } = params;
      const statement = `地図上の2地点 $A(${x1},${y1})$, $B(${x2},${y2})$ を結ぶ直線の傾きを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).m);
    },
    explain(params) {
      const p = params as Params;
      const dy = p.y2 - p.y1;
      const dx = p.x2 - p.x1;
      return `
### この問題の解説
傾きは $\dfrac{y_2-y_1}{x_2-x_1}$ なので
$$
\\frac{${dy}}{${dx}}=${p.m}
$$
答えは **${p.m}** です。
`;
    },
  };
}

export const coordLineSlopeTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_line_slope_basic_${i + 1}`, `傾き ${i + 1}`)
);
