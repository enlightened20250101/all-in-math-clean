// src/lib/course/templates/math1/quad_graph_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

function genFactoredQuadratic() {
  const a = pick([1, 2]);
  const evenPool = [-6, -4, -2, 0, 2, 4, 6];
  const oddPool = [-5, -3, -1, 1, 3, 5];
  const pool = pick([evenPool, oddPool]);
  const r1 = pick(pool);
  let r2 = pick(pool);
  while (pool.length > 1 && r2 === r1) {
    r2 = pick(pool);
  }
  const A = a;
  const B = -a * (r1 + r2);
  const C = a * r1 * r2;
  return { A, B, C, r1, r2 };
}

function buildAxisTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_graph_basic",
      title,
      difficulty: 1,
      tags: ["quadratic", "axis"],
    },
    generate() {
      const { A, B, C, r1, r2 } = genFactoredQuadratic();
      const poly = texPoly2(A, B, C);
      const axis = (r1 + r2) / 2;
      return {
        templateId: id,
        statement: `二次関数 $y=${poly}$ の軸の方程式 $x=p$ の $p$ を求めよ。`,
        answerKind: "numeric",
        params: { axis },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { axis: number }).axis);
    },
    explain(params) {
      const axis = (params as { axis: number }).axis;
      return `
### この問題の解説
二次関数 $y=a(x-r_1)(x-r_2)$ の軸は $x=\\dfrac{r_1+r_2}{2}$。
答えは **${axis}** です。
`;
    },
  };
}

function buildInterceptTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "quad_graph_basic",
      title,
      difficulty: 1,
      tags: ["quadratic", "intercept"],
    },
    generate() {
      const { A, B, C } = genFactoredQuadratic();
      const poly = texPoly2(A, B, C);
      return {
        templateId: id,
        statement: `二次関数 $y=${poly}$ の $y$ 切片を求めよ。`,
        answerKind: "numeric",
        params: { C },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { C: number }).C);
    },
    explain(params) {
      const c = (params as { C: number }).C;
      return `
### この問題の解説
$y$ 切片は $x=0$ のときの値なので、定数項です。
答えは **${c}** です。
`;
    },
  };
}

export const quadGraphVariantTemplates: QuestionTemplate[] = [
  buildAxisTemplate("quad_graph_axis_v1", "軸（因数分解形）1"),
  buildAxisTemplate("quad_graph_axis_v2", "軸（因数分解形）2"),
  buildAxisTemplate("quad_graph_axis_v3", "軸（因数分解形）3"),
  buildInterceptTemplate("quad_graph_intercept_v1", "切片（因数分解形）1"),
  buildInterceptTemplate("quad_graph_intercept_v2", "切片（因数分解形）2"),
  buildInterceptTemplate("quad_graph_intercept_v3", "切片（因数分解形）3"),
];
