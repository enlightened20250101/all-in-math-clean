// src/lib/course/templates/math1/quad_graph_basic.ts
import type { QuestionTemplate } from "../../types";
import { texLinear, texPoly2, texQuadraticVertex } from "@/lib/format/tex";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { genQuadraticWithIntegerVertex, vertexX, vertexY } from "../_shared/quadratic";

function genVertexForm() {
  const a = pick([1, 2, 3]);
  const p = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  const q = randInt(-6, 6);
  const b = -2 * a * p;
  const c = a * p * p + q;
  return { a, b, c, p, q };
}

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

function yAt(a: number, b: number, c: number, x: number) {
  return a * x * x + b * x + c;
}

const extraGraphTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 2;
  const templateId = `quad_graph_value_${idx + 1}`;
  const title = kind === 0 ? "二次関数の値（x指定）" : "二次関数の値（x指定2）";
  return {
    meta: {
      id: templateId,
      topicId: "quad_graph_basic",
      title,
      difficulty: 1,
      tags: ["quadratic", "value"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      const offset = pick([-3, -2, -1, 1, 2, 3]);
      const x = p + offset;
      const value = yAt(a, b, c, x);
      const poly = texPoly2(a, b, c);
      return {
        templateId,
        statement: `二次関数 $y=${poly}$ において、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const { a, b, c, x, value } = params as any;
      const poly = texPoly2(a, b, c);
      return `
### この問題の解説
$$
y=${poly}
$$
に $x=${x}$ を代入します。

$$
y=${value}
$$
よって答えは **${value}** です。
`;
    },
  };
});

export const quadGraphTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "quad_vertex_x",
      topicId: "quad_graph_basic",
      title: "頂点のx座標",
      difficulty: 1,
      tags: ["vertex"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_x",
        statement: `二次関数 $y = ${poly}$ の頂点の $x$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexX(params.a, params.b));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      const axis = texLinear(1, -p);
      return `
### この問題の解説
軸（頂点の$x$）は $x=-\\frac{b}{2a}$ です。

$$
x=-\\frac{${params.b}}{2\\cdot ${params.a}}=${p}
$$
また、軸の方程式は $${axis}=0$ と表せます。
よって答えは **${p}** です。
`;
    },
  },

  {
    meta: {
      id: "quad_axis_p",
      topicId: "quad_graph_basic",
      title: "軸のp",
      difficulty: 1,
      tags: ["axis"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_axis_p",
        statement: `二次関数 $y = ${poly}$ の軸の方程式は $x=p$ と表せる。$p$ を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexX(params.a, params.b));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      const axis = texLinear(1, -p);
      return `
### この問題の解説
軸は $x=-\\frac{b}{2a}$ なので、$p=-\\frac{b}{2a}$ です。

$$
p=-\\frac{${params.b}}{2\\cdot ${params.a}}=${p}
$$
また、軸の方程式は $${axis}=0$ です。
`;
    },
  },

  {
    meta: {
      id: "quad_vertex_y",
      topicId: "quad_graph_basic",
      title: "頂点のy座標",
      difficulty: 2,
      tags: ["vertex"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_y",
        statement: `二次関数 $y = ${poly}$ の頂点の $y$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexY(params.a, params.b, params.c));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      const q = vertexY(params.a, params.b, params.c);
      const poly = texPoly2(params.a, params.b, params.c);
      return `
### この問題の解説
まず $p=-\\frac{b}{2a}$ を求め、$x=p$ を代入します。

$$
p=-\\frac{${params.b}}{2\\cdot ${params.a}}=${p}
$$

$$
y=${poly}
$$

$$
x=${p}\\Rightarrow y=${q}
$$
`;
    },
  },

  {
    meta: {
      id: "quad_vertex_x_2",
      topicId: "quad_graph_basic",
      title: "頂点のx座標（別パターン）",
      difficulty: 1,
      tags: ["vertex"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_x_2",
        statement: `関数 $y = ${poly}$ の頂点の $x$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexX(params.a, params.b));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      const axis = texLinear(1, -p);
      return `
### この問題の解説
軸の公式より $x=-\\frac{b}{2a}$ です。

$$
x=-\\frac{${params.b}}{2\\cdot ${params.a}}=${p}
$$
軸の方程式は $${axis}=0$ です。
`;
    },
  },
  {
    meta: {
      id: "quad_vertex_y_easy",
      topicId: "quad_graph_basic",
      title: "頂点のy座標（基本）",
      difficulty: 1,
      tags: ["vertex"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_vertex_y_easy",
        statement: `二次関数 $y = ${poly}$ の頂点の $y$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexY(params.a, params.b, params.c));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      const q = vertexY(params.a, params.b, params.c);
      const poly = texPoly2(params.a, params.b, params.c);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${p}\\Rightarrow y=${q}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_axis_from_vertex_form",
      topicId: "quad_graph_basic",
      title: "頂点形式から軸",
      difficulty: 1,
      tags: ["axis"],
    },
    generate() {
      const { a, p, q } = genVertexForm();
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_axis_from_vertex_form",
        statement: `二次関数 $y = ${form}$ の軸の方程式は $x=p$ と表せる。$p$ を求めなさい。`,
        answerKind: "numeric",
        params: { a, p, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.p);
    },
    explain(params) {
      const form = texQuadraticVertex(params.a, params.p, params.q);
      const axis = texLinear(1, -params.p);
      return `
### この問題の解説
頂点形式では $y=${form}$ なので、軸は $${axis}=0$ です。
`;
    },
  },
  {
    meta: {
      id: "quad_vertex_y_from_vertex_form",
      topicId: "quad_graph_basic",
      title: "頂点形式から頂点のy",
      difficulty: 1,
      tags: ["vertex"],
    },
    generate() {
      const { a, p, q } = genVertexForm();
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_vertex_y_from_vertex_form",
        statement: `二次関数 $y = ${form}$ の頂点の $y$ 座標を求めなさい。`,
        answerKind: "numeric",
        params: { a, p, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.q);
    },
    explain(params) {
      const form = texQuadraticVertex(params.a, params.p, params.q);
      return `
### この問題の解説
$y=${form}$ は頂点が $(${params.p}, ${params.q})$ です。  \n頂点の $y$ 座標は ${params.q} です。
`;
    },
  },
  {
    meta: {
      id: "quad_x_coeff_from_vertex_form",
      topicId: "quad_graph_basic",
      title: "頂点形式からx係数",
      difficulty: 1,
      tags: ["expand", "coefficient"],
    },
    generate() {
      const { a, b, c, p, q } = genVertexForm();
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_x_coeff_from_vertex_form",
        statement: `二次関数 $y = ${form}$ を展開したときの $x$ の係数を答えなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.b);
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      return `
### この問題の解説
展開すると
$$
y=${poly}
$$
となるので、$x$ の係数は ${params.b} です。
`;
    },
  },
  {
    meta: {
      id: "quad_const_from_vertex_form",
      topicId: "quad_graph_basic",
      title: "頂点形式から定数項",
      difficulty: 1,
      tags: ["expand", "constant"],
    },
    generate() {
      const { a, b, c, p, q } = genVertexForm();
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_const_from_vertex_form",
        statement: `二次関数 $y = ${form}$ を展開したときの定数項を答えなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.c);
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      return `
### この問題の解説
展開すると
$$
y=${poly}
$$
となるので、定数項は ${params.c} です。
`;
    },
  },
  {
    meta: {
      id: "quad_y_intercept",
      topicId: "quad_graph_basic",
      title: "y切片",
      difficulty: 1,
      tags: ["intercept"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_y_intercept",
        statement: `二次関数 $y = ${poly}$ の $y$ 切片を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.c);
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      return `
### この問題の解説
$y$ 切片は $x=0$ のときの値です。

$$
y=${poly}
$$

$$
x=0\\Rightarrow y=${params.c}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_x1_graph",
      topicId: "quad_graph_basic",
      title: "値の計算（x=1）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      const x = 1;
      return {
        templateId: "quad_value_at_x1_graph",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_xm1_graph",
      topicId: "quad_graph_basic",
      title: "値の計算（x=-1）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      const x = -1;
      return {
        templateId: "quad_value_at_xm1_graph",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_x2_graph",
      topicId: "quad_graph_basic",
      title: "値の計算（x=2）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      const x = 2;
      return {
        templateId: "quad_value_at_x2_graph",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_x3_graph",
      topicId: "quad_graph_basic",
      title: "値の計算（x=3）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      const x = 3;
      return {
        templateId: "quad_value_at_x3_graph",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_xm2_graph",
      topicId: "quad_graph_basic",
      title: "値の計算（x=-2）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      const x = -2;
      return {
        templateId: "quad_value_at_xm2_graph",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_axis_from_factored",
      topicId: "quad_graph_basic",
      title: "軸の方程式（係数から）",
      difficulty: 1,
      tags: ["axis"],
    },
    generate() {
      const { A, B, C } = genFactoredQuadratic();
      const poly = texPoly2(A, B, C);
      const axis = vertexX(A, B);
      return {
        templateId: "quad_axis_from_factored",
        statement: `二次関数 $y = ${poly}$ の軸の方程式は $x=p$ と表せる。$p$ を求めなさい。`,
        answerKind: "numeric",
        params: { A, B, C, axis },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.axis);
    },
    explain(params) {
      return `
### この問題の解説
軸は $x=-\\frac{b}{2a}$ です。

$$
x=-\\frac{${params.B}}{2\\cdot ${params.A}}=${params.axis}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_axis_plus1",
      topicId: "quad_graph_basic",
      title: "軸から1右の値",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      const x = p + 1;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_value_at_axis_plus1",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_value_at_axis_minus1",
      topicId: "quad_graph_basic",
      title: "軸から1左の値",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      const x = p - 1;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_value_at_axis_minus1",
        statement: `二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, yAt(params.a, params.b, params.c, params.x));
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = yAt(params.a, params.b, params.c, params.x);
      return `
### この問題の解説
$$
y=${poly}
$$

$$
x=${params.x}\\Rightarrow y=${y}
$$
`;
    },
  },
  ...extraGraphTemplates,
];

const extraGraphTemplates2: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `quad_graph_extra_${idx + 1}`;
  const title = kind === 0 ? "二次関数の値（軸から±2）" : kind === 1 ? "二次関数の値（軸から±3）" : "二次関数の値（指定点）";
  return {
    meta: {
      id: templateId,
      topicId: "quad_graph_basic",
      title,
      difficulty: 1,
      tags: ["quadratic", "value"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const p = vertexX(a, b);
      if (kind === 0) {
        const x = p + pick([-2, 2]);
        const value = yAt(a, b, c, x);
        const poly = texPoly2(a, b, c);
        return {
          templateId,
          statement: `二次関数 $y=${poly}$ において、$x=${x}$ のときの $y$ の値を求めなさい。`,
          answerKind: "numeric",
          params: { a, b, c, x, value },
        };
      }
      if (kind === 1) {
        const x = p + pick([-3, 3]);
        const value = yAt(a, b, c, x);
        const poly = texPoly2(a, b, c);
        return {
          templateId,
          statement: `二次関数 $y=${poly}$ において、$x=${x}$ のときの $y$ の値を求めなさい。`,
          answerKind: "numeric",
          params: { a, b, c, x, value },
        };
      }
      const x = randInt(-4, 4);
      const value = yAt(a, b, c, x);
      const poly = texPoly2(a, b, c);
      return {
        templateId,
        statement: `二次関数 $y=${poly}$ において、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const { a, b, c, x, value } = params as any;
      const poly = texPoly2(a, b, c);
      return `
### この問題の解説
$$
y=${poly}
$$
に $x=${x}$ を代入します。

$$
y=${value}
$$
よって答えは **${value}** です。
`;
    },
  };
});

quadGraphTemplates.push(...extraGraphTemplates2);
