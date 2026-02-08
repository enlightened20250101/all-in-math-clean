// src/lib/course/templates/mathC/vector_equation_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type VecCase = {
  id: string;
  title: string;
  u: [number, number];
  v: [number, number];
  w: [number, number];
  difficulty: 1 | 2 | 3;
};

function solve(u: [number, number], v: [number, number], w: [number, number]) {
  const det = u[0] * v[1] - u[1] * v[0];
  const a = (w[0] * v[1] - w[1] * v[0]) / det;
  const b = (u[0] * w[1] - u[1] * w[0]) / det;
  return { a, b };
}

function buildTemplate(c: VecCase): QuestionTemplate {
  const { a, b } = solve(c.u, c.v, c.w);
  const sum = a + b;
  return {
    meta: {
      id: c.id,
      topicId: "vector_equation_basic",
      title: c.title,
      difficulty: c.difficulty,
      tags: ["vector", "equation", "ct"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `合成移動として $a\\vec{u}+b\\vec{v}=\\vec{w}$ が成り立つとき、$a+b$ を求めよ。\\n\\n$\\vec{u}=(${c.u[0]},${c.u[1]})$, $\\vec{v}=(${c.v[0]},${c.v[1]})$, $\\vec{w}=(${c.w[0]},${c.w[1]})$`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, sum);
    },
    explain() {
      return `### この問題の解説\n連立方程式を解いて $a=${a}, b=${b}$。したがって $a+b=${sum}$。`;
    },
  };
}

const CASES: VecCase[] = [
  { id: "vec_eq_1", title: "ベクトル方程式 1", u: [1, 2], v: [2, 1], w: [5, 4], difficulty: 1 },
  { id: "vec_eq_2", title: "ベクトル方程式 2", u: [1, 0], v: [0, 1], w: [3, -2], difficulty: 1 },
  { id: "vec_eq_3", title: "ベクトル方程式 3", u: [2, 1], v: [1, -1], w: [4, -1], difficulty: 1 },
  { id: "vec_eq_4", title: "ベクトル方程式 4", u: [1, 3], v: [2, -1], w: [4, 5], difficulty: 1 },
  { id: "vec_eq_5", title: "ベクトル方程式 5", u: [2, -1], v: [1, 2], w: [5, 1], difficulty: 2 },
  { id: "vec_eq_6", title: "ベクトル方程式 6", u: [3, 1], v: [1, -2], w: [7, -3], difficulty: 2 },
  { id: "vec_eq_7", title: "ベクトル方程式 7", u: [1, -2], v: [2, 3], w: [3, 4], difficulty: 2 },
  { id: "vec_eq_8", title: "ベクトル方程式 8", u: [2, 1], v: [3, -1], w: [7, 1], difficulty: 3 },
  { id: "vec_eq_9", title: "ベクトル方程式 9", u: [1, 4], v: [2, -3], w: [5, 5], difficulty: 3 },
];

export const vectorEquationTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
