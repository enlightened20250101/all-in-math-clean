// src/lib/course/templates/math2/coord_line_intercept_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

const SLOPES = [-3, -2, -1, 1, 2, 3];

type Params = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  m: number;
  b: number;
};

function buildParams(): Params {
  for (let i = 0; i < 50; i += 1) {
    const m = pick(SLOPES);
    const x1 = randInt(-3, 3);
    const dx = pick([1, 2, 3, 4]);
    const x2 = x1 + dx;
    const y1 = randInt(-4, 4);
    const y2 = y1 + m * dx;
    const b = y1 - m * x1;
    if (Math.abs(y2) <= 10 && Math.abs(b) <= 12) {
      return { x1, y1, x2, y2, m, b };
    }
  }
  return { x1: 0, y1: 0, x2: 1, y2: 1, m: 1, b: 0 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_line_intercept_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const { x1, y1, x2, y2 } = params;
      const statement = `2点 $A(${x1},${y1})$, $B(${x2},${y2})$ を通る直線の $y$ 切片を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
直線は $y=mx+b$ とおけるので、点 $A(${p.x1},${p.y1})$ を代入すると
$$
${p.y1}=${p.m}\cdot ${p.x1}+b
$$
より $b=${p.b}$。
答えは **${p.b}** です。
`;
    },
  };
}

export const coordLineInterceptTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_line_intercept_basic_${i + 1}`, `y切片 ${i + 1}`)
);
