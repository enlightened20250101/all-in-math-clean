// src/lib/course/templates/math1/quad_maxmin_basic.ts
import type { QuestionTemplate } from "../../types";
import { texLinear, texPoly2, texQuadraticVertex } from "@/lib/format/tex";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { genQuadraticWithIntegerVertex, vertexX, vertexY } from "../_shared/quadratic";

function genVertexQuadratic(sign: 1 | -1) {
  const a = sign * pick([1, 2, 3]);
  const p = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
  const q = randInt(-6, 6);
  const b = -2 * a * p;
  const c = a * p * p + q;
  return { a, b, c, p, q };
}

function yAt(a: number, b: number, c: number, x: number) {
  return a * x * x + b * x + c;
}

export const quadMaxMinTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "quad_interval_max_endpoint",
      topicId: "quad_maxmin_basic",
      title: "区間内の最大値（端点）",
      difficulty: 2,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, p, q } = genVertexQuadratic(1); // a>0
      const l = p - 1;
      const r = p + 2;
      const yL = a * (l - p) * (l - p) + q;
      const yR = a * (r - p) * (r - p) + q;
      const maxVal = Math.max(yL, yR);
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_interval_max_endpoint",
        statement:
          `放物線の区間での最大値を調べる。二次関数 $y=${form}$ について、区間 $[${l},${r}]$ における最大値を求めよ。`,
        answerKind: "numeric",
        params: { a, p, q, l, r, maxVal },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).maxVal);
    },
    explain(params) {
      const { l, r, maxVal } = params as any;
      return `
### この問題の解説
$a>0$ なので下に凸。区間での最大値は端点で決まります。
$$
y(${l}),\\ y(${r}) を比較すると最大値は ${maxVal}
$$
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_unbounded",
      topicId: "quad_maxmin_basic",
      title: "最小値（範囲なし）",
      difficulty: 2,
      tags: ["min", "vertex"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex(); // a>0
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_value_unbounded",
        statement: `放物線の頂点を利用して最小値を求める。二次関数 $y = ${poly}$ の最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexY(params.a, params.b, params.c));
    },
    explain(params) {
      const q = vertexY(params.a, params.b, params.c);
      return `
### この問題の解説
$a>0$ なので上に開き、頂点で最小値を取ります。  
最小値は頂点の $y$ 座標です。答えは **${q}** です。
`;
    },
  },

  {
    meta: {
      id: "quad_min_x_unbounded",
      topicId: "quad_maxmin_basic",
      title: "最小となるx（範囲なし）",
      difficulty: 1,
      tags: ["min", "axis"],
    },
    generate() {
      const { a, b, c } = genQuadraticWithIntegerVertex();
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_x_unbounded",
        statement: `軸の位置を使って最小となる $x$ を求める。二次関数 $y = ${poly}$ が最小値をとるときの $x$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, vertexX(params.a, params.b));
    },
    explain(params) {
      const p = vertexX(params.a, params.b);
      return `
### この問題の解説
最小になる$x$は軸 $x=-\\frac{b}{2a}$ です。答えは **${p}** です。
`;
    },
  },

  {
    meta: {
      id: "quad_value_at_x",
      topicId: "quad_maxmin_basic",
      title: "値の計算（代入）",
      difficulty: 1,
      tags: ["substitution"],
    },
    generate() {
      const a = pick([1, 2, 3]);
      const b = randInt(-6, 6);
      const c = randInt(-6, 6);
      const x = pick([-3, -2, -1, 1, 2, 3]);
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_value_at_x",
        statement: `関数の値を具体的に計算する。二次関数 $y = ${poly}$ について、$x=${x}$ のときの $y$ の値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, x },
      };
    },
    grade(params, userAnswer) {
      const y = params.a * params.x * params.x + params.b * params.x + params.c;
      return gradeNumeric(userAnswer, y);
    },
    explain(params) {
      const poly = texPoly2(params.a, params.b, params.c);
      const y = params.a * params.x * params.x + params.b * params.x + params.c;
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
      id: "quad_min_value_unbounded_easy",
      topicId: "quad_maxmin_basic",
      title: "最小値（基本）",
      difficulty: 1,
      tags: ["min", "vertex"],
    },
    generate() {
      const { a, b, c, q } = genVertexQuadratic(1);
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_value_unbounded_easy",
        statement: `二次関数 $y = ${poly}$ の最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.q);
    },
    explain(params) {
      return `
### この問題の解説
$a>0$ なので頂点で最小値を取ります。最小値は ${params.q} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_value_unbounded_easy",
      topicId: "quad_maxmin_basic",
      title: "最大値（基本）",
      difficulty: 1,
      tags: ["max", "vertex"],
    },
    generate() {
      const { a, b, c, q } = genVertexQuadratic(-1);
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_max_value_unbounded_easy",
        statement: `二次関数 $y = ${poly}$ の最大値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, q },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.q);
    },
    explain(params) {
      return `
### この問題の解説
$a<0$ なので頂点で最大値を取ります。最大値は ${params.q} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_x_vertex_form",
      topicId: "quad_maxmin_basic",
      title: "最小となるx（頂点形式）",
      difficulty: 1,
      tags: ["min", "axis"],
    },
    generate() {
      const { a, p, q } = genVertexQuadratic(1);
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_min_x_vertex_form",
        statement: `二次関数 $y = ${form}$ が最小値をとるときの $x$ の値を求めなさい。`,
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
$y=${form}$ の軸は $${axis}=0$ なので、最小になる$x$は ${params.p} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_x_vertex_form",
      topicId: "quad_maxmin_basic",
      title: "最大となるx（頂点形式）",
      difficulty: 1,
      tags: ["max", "axis"],
    },
    generate() {
      const { a, p, q } = genVertexQuadratic(-1);
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_max_x_vertex_form",
        statement: `二次関数 $y = ${form}$ が最大値をとるときの $x$ の値を求めなさい。`,
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
$y=${form}$ の軸は $${axis}=0$ なので、最大になる$x$は ${params.p} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_interval_inside",
      topicId: "quad_maxmin_basic",
      title: "区間での最小値（頂点内）",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p, q } = genVertexQuadratic(1);
      const L = p - 2;
      const R = p + 2;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_value_interval_inside",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, q, L, R },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.q);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間内にあるので最小値は頂点の $y$ 座標です。答えは ${params.q} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_value_interval_inside",
      topicId: "quad_maxmin_basic",
      title: "区間での最大値（頂点内）",
      difficulty: 1,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, b, c, p, q } = genVertexQuadratic(-1);
      const L = p - 2;
      const R = p + 2;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_max_value_interval_inside",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最大値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, q, L, R },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.q);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間内にあるので最大値は頂点の $y$ 座標です。答えは ${params.q} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_interval_left",
      topicId: "quad_maxmin_basic",
      title: "区間での最小値（頂点が左）",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(1);
      const L = p + 2;
      const R = p + 5;
      const poly = texPoly2(a, b, c);
      const yL = yAt(a, b, c, L);
      return {
        templateId: "quad_min_value_interval_left",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R, yL },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yL);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間の左にあるので、区間内では右へ行くほど値が大きくなります。  
最小値は $x=${params.L}$ のときで、答えは ${params.yL} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_interval_right",
      topicId: "quad_maxmin_basic",
      title: "区間での最小値（頂点が右）",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(1);
      const L = p - 5;
      const R = p - 2;
      const poly = texPoly2(a, b, c);
      const yR = yAt(a, b, c, R);
      return {
        templateId: "quad_min_value_interval_right",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R, yR },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yR);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間の右にあるので、区間内では右へ行くほど値が小さくなります。  
最小値は $x=${params.R}$ のときで、答えは ${params.yR} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_value_interval_left",
      topicId: "quad_maxmin_basic",
      title: "区間での最大値（頂点が左）",
      difficulty: 1,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(-1);
      const L = p + 2;
      const R = p + 5;
      const poly = texPoly2(a, b, c);
      const yL = yAt(a, b, c, L);
      return {
        templateId: "quad_max_value_interval_left",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最大値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R, yL },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yL);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間の左にあるので、区間内では右へ行くほど値が小さくなります。  
最大値は $x=${params.L}$ のときで、答えは ${params.yL} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_value_interval_right",
      topicId: "quad_maxmin_basic",
      title: "区間での最大値（頂点が右）",
      difficulty: 1,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(-1);
      const L = p - 5;
      const R = p - 2;
      const poly = texPoly2(a, b, c);
      const yR = yAt(a, b, c, R);
      return {
        templateId: "quad_max_value_interval_right",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最大値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R, yR },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yR);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間の右にあるので、区間内では右へ行くほど値が大きくなります。  
最大値は $x=${params.R}$ のときで、答えは ${params.yR} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_x_interval",
      topicId: "quad_maxmin_basic",
      title: "区間で最小となるx",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(1);
      const L = p - 2;
      const R = p + 2;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_min_x_interval",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ で最小値をとる $x$ を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.p);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間内にあるので、最小になる$x$は ${params.p} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_x_interval",
      topicId: "quad_maxmin_basic",
      title: "区間で最大となるx",
      difficulty: 1,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(-1);
      const L = p - 2;
      const R = p + 2;
      const poly = texPoly2(a, b, c);
      return {
        templateId: "quad_max_x_interval",
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ で最大値をとる $x$ を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, L, R },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.p);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間内にあるので、最大になる$x$は ${params.p} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_halfline",
      topicId: "quad_maxmin_basic",
      title: "半直線での最小値",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(1);
      const k = p + 2;
      const poly = texPoly2(a, b, c);
      const yk = yAt(a, b, c, k);
      return {
        templateId: "quad_min_value_halfline",
        statement: `二次関数 $y = ${poly}$ について、$x \\ge ${k}$ のときの最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, k, yk },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yk);
    },
    explain(params) {
      return `
### この問題の解説
頂点が $x=${params.k}$ より左にあるので、最小値は境界 $x=${params.k}$ のときです。  
答えは ${params.yk} です。
`;
    },
  },
  {
    meta: {
      id: "quad_max_value_halfline",
      topicId: "quad_maxmin_basic",
      title: "半直線での最大値",
      difficulty: 1,
      tags: ["max", "interval"],
    },
    generate() {
      const { a, b, c, p } = genVertexQuadratic(-1);
      const k = p - 2;
      const poly = texPoly2(a, b, c);
      const yk = yAt(a, b, c, k);
      return {
        templateId: "quad_max_value_halfline",
        statement: `二次関数 $y = ${poly}$ について、$x \\le ${k}$ のときの最大値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, k, yk },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.yk);
    },
    explain(params) {
      return `
### この問題の解説
頂点が $x=${params.k}$ より右にあるので、最大値は境界 $x=${params.k}$ のときです。  
答えは ${params.yk} です。
`;
    },
  },
  {
    meta: {
      id: "quad_min_value_vertex_form",
      topicId: "quad_maxmin_basic",
      title: "最小値（頂点形式）",
      difficulty: 1,
      tags: ["min", "vertex"],
    },
    generate() {
      const { a, p, q } = genVertexQuadratic(1);
      const form = texQuadraticVertex(a, p, q);
      return {
        templateId: "quad_min_value_vertex_form",
        statement: `二次関数 $y = ${form}$ の最小値を求めなさい。`,
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
$y=${form}$ の頂点の $y$ 座標が最小値です。答えは ${params.q} です。
`;
    },
  },
];

const extraMaxMinTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, idx) => {
  const kind = idx % 3;
  const id = `quad_maxmin_extra_${idx + 1}`;
  if (kind === 0) {
    return {
      meta: {
        id,
        topicId: "quad_maxmin_basic",
        title: "最小値（追加）",
        difficulty: 1,
        tags: ["min", "vertex"],
      },
      generate() {
        const { a, b, c, q } = genVertexQuadratic(1);
        const poly = texPoly2(a, b, c);
        return {
          templateId: id,
          statement: `二次関数 $y = ${poly}$ の最小値を求めなさい。`,
          answerKind: "numeric",
          params: { a, b, c, q },
        };
      },
      grade(params, userAnswer) {
        return gradeNumeric(userAnswer, (params as any).q);
      },
      explain(params) {
        return `
### この問題の解説
$a>0$ なので頂点で最小値を取ります。答えは ${(params as any).q} です。
`;
      },
    };
  }
  if (kind === 1) {
    return {
      meta: {
        id,
        topicId: "quad_maxmin_basic",
        title: "最大値（追加）",
        difficulty: 1,
        tags: ["max", "vertex"],
      },
      generate() {
        const { a, b, c, q } = genVertexQuadratic(-1);
        const poly = texPoly2(a, b, c);
        return {
          templateId: id,
          statement: `二次関数 $y = ${poly}$ の最大値を求めなさい。`,
          answerKind: "numeric",
          params: { a, b, c, q },
        };
      },
      grade(params, userAnswer) {
        return gradeNumeric(userAnswer, (params as any).q);
      },
      explain(params) {
        return `
### この問題の解説
$a<0$ なので頂点で最大値を取ります。答えは ${(params as any).q} です。
`;
      },
    };
  }
  return {
    meta: {
      id,
      topicId: "quad_maxmin_basic",
      title: "区間での最小値（追加）",
      difficulty: 1,
      tags: ["min", "interval"],
    },
    generate() {
      const { a, b, c, p, q } = genVertexQuadratic(1);
      const L = p - 3;
      const R = p + 1;
      const poly = texPoly2(a, b, c);
      return {
        templateId: id,
        statement: `二次関数 $y = ${poly}$ について、区間 $${L} \\le x \\le ${R}$ での最小値を求めなさい。`,
        answerKind: "numeric",
        params: { a, b, c, p, q, L, R },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).q);
    },
    explain(params) {
      return `
### この問題の解説
頂点が区間内にあるので最小値は頂点の $y$ 座標です。答えは ${(params as any).q} です。
`;
    },
  };
});

quadMaxMinTemplates.push(...extraMaxMinTemplates);
