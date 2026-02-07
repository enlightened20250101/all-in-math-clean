// src/lib/course/templates/math3/calc_limit_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

type DiffParams = {
  k: number;
  value: number;
};

type LinearParams = {
  k: number;
  a: number;
  b: number;
  value: number;
};

type PolyDiffParams = {
  k: number;
  a: number;
  b: number;
  c: number;
  value: number;
};

type CubicDiffParams = {
  k: number;
  value: number;
};

function buildDiffParams(): DiffParams {
  const k = pick([1, 2, 3, 4, 5]);
  return { k, value: 2 * k };
}

function buildLinearParams(): LinearParams {
  const k = randInt(-3, 3);
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-5, 5);
  return { k, a, b, value: a * k + b };
}

function buildSquareParams() {
  const k = pick([1, 2, 3]);
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const value = a * k * k + b * k + c;
  return { k, a, b, c, value };
}

function buildPolyDiffParams(): PolyDiffParams {
  const k = pick([-3, -2, -1, 1, 2, 3]);
  const a = pick([1, 2, -1, -2, 3]);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const value = 2 * a * k + b;
  return { k, a, b, c, value };
}

function buildCubicDiffParams(): CubicDiffParams {
  const k = pick([-3, -2, -1, 1, 2, 3]);
  return { k, value: 3 * k * k };
}

function wrapNum(n: number) {
  return n < 0 ? `(${n})` : `${n}`;
}

function xMinus(n: number) {
  return `x-${wrapNum(n)}`;
}

function subtractConst(expr: string, value: number) {
  return value < 0 ? `${expr}+${Math.abs(value)}` : `${expr}-${value}`;
}

const extraLimitTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_limit_basic_${idx + 21}`;
  const title = kind === 0 ? "極限（多項式差分）" : kind === 1 ? "極限（三次の差）" : "極限（二次一般形）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_limit_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      if (kind === 0) {
        const params = buildSquareParams();
        const { k, a, b, c } = params;
        const fx = texPoly2(a, b, c);
        const fk = a * k * k + b * k + c;
        return {
          templateId,
          statement: `次の極限を求めよ。\\n\\n$$\\lim_{x\\to ${k}} \\frac{${subtractConst(fx, fk)}}{${xMinus(k)}}$$`,
          answerKind: "numeric",
          params: { k, value: 2 * a * k + b },
        };
      }
      if (kind === 1) {
        const params = buildCubicDiffParams();
        const { k } = params;
        return {
          templateId,
          statement: `次の極限を求めよ。\\n\\n$$\\lim_{x\\to ${k}} \\frac{x^3-${wrapNum(k)}^3}{${xMinus(k)}}$$`,
          answerKind: "numeric",
          params,
        };
      }
      const params = buildPolyDiffParams();
      const { k, a, b, c } = params;
      const fx = texPoly2(a, b, c);
      const fk = a * k * k + b * k + c;
      return {
        templateId,
        statement: `次の極限を求めよ。\\n\\n$$\\lim_{x\\to ${k}} \\frac{${subtractConst(fx, fk)}}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const { k, value } = params as any;
      return `
### この問題の解説
分子は $x=${k}$ で 0 になる形なので、因数分解して約分できます。
$$
\\lim_{x\\to ${k}} \\frac{f(x)-f(${k})}{x-${k}} = f'(${k})
$$
答えは **${value}** です。
`;
    },
  };
});

export const calcLimitBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_limit_basic_1",
      topicId: "calc_limit_basic",
      title: "極限（差の形）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      return {
        templateId: "calc_limit_basic_1",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{x^2-${k}^2}{x-${k}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).value);
    },
    explain(params) {
      const { k, value } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{x^2-${k}^2}{x-${k}} = \\frac{(x-${k})(x+${k})}{x-${k}} = x+${k}
$$
したがって
$$
\lim_{x\\to ${k}} (x+${k}) = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_2",
      topicId: "calc_limit_basic",
      title: "極限（代入）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, b);
      return {
        templateId: "calc_limit_basic_2",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} (${fx})$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as LinearParams).value);
    },
    explain(params) {
      const { k, a, b, value } = params as LinearParams;
      const fx = texLinear(a, b);
      return `
### この問題の解説
連続な関数なので代入できます。
$$
\lim_{x\\to ${k}} (${fx}) = ${a}\\cdot ${k} + ${b} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_3",
      topicId: "calc_limit_basic",
      title: "極限（差の形 2）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      const numerator = texPoly2(1, -k, 0);
      return {
        templateId: "calc_limit_basic_3",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{${numerator}}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k } = params as DiffParams;
      return gradeNumeric(userAnswer, k);
    },
    explain(params) {
      const { k } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{${numerator}}{${xMinus(k)}} = \\frac{x(x-${k})}{${xMinus(k)}} = x
$$
で、$x\\to ${k}$ を考えると
$$
\\lim_{x\\to ${k}} x = ${k}
$$
答えは **${k}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_4",
      topicId: "calc_limit_basic",
      title: "極限（代入 2）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a + 1, b);
      return {
        templateId: "calc_limit_basic_4",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + k;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + k;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\\cdot ${k} + ${b} + ${k} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_5",
      topicId: "calc_limit_basic",
      title: "極限（差の形 3）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      return {
        templateId: "calc_limit_basic_5",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{x^2-${k}^2}{x-${k}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).value);
    },
    explain(params) {
      const { k, value } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{x^2-${k}^2}{x-${k}} = x+${k}
$$
したがって
$$
\\lim_{x\\to ${k}} (x+${k}) = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_6",
      topicId: "calc_limit_basic",
      title: "極限（代入 3）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, b + a);
      return {
        templateId: "calc_limit_basic_6",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + a;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\\cdot ${k} + ${b} + ${a} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_7",
      topicId: "calc_limit_basic",
      title: "極限（差の形 4）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      const numerator = texPoly2(1, -k, 0);
      return {
        templateId: "calc_limit_basic_7",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{${numerator}}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).k);
    },
    explain(params) {
      const { k } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{${numerator}}{${xMinus(k)}} = x
$$
したがって
$$
\\lim_{x\\to ${k}} x = ${k}
$$
答えは **${k}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_8",
      topicId: "calc_limit_basic",
      title: "極限（代入 4）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, 0);
      return {
        templateId: "calc_limit_basic_8",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a } = params as LinearParams;
      const value = a * k;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a } = params as LinearParams;
      const value = a * k;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\\cdot ${k} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_9",
      topicId: "calc_limit_basic",
      title: "極限（差の形 5）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      return {
        templateId: "calc_limit_basic_9",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{x^2-${k}^2}{x-${k}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).value);
    },
    explain(params) {
      const { k, value } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{x^2-${k}^2}{x-${k}} = x+${k}
$$
したがって
$$
\\lim_{x\\to ${k}} (x+${k}) = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_10",
      topicId: "calc_limit_basic",
      title: "極限（代入 5）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, 2 * b);
      return {
        templateId: "calc_limit_basic_10",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + 2 * b;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + 2 * b;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\\cdot ${k} + 2\\cdot ${b} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_11",
      topicId: "calc_limit_basic",
      title: "極限（二次式の代入）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildSquareParams();
      const { k, a, b, c } = params;
      const fx = texPoly2(a, b, c);
      return {
        templateId: "calc_limit_basic_11",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} (${fx})$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.value);
    },
    explain(params) {
      const { k, value } = params as { k: number; value: number };
      return `
### この問題の解説
連続な関数なので代入できます。
$$
\lim_{x\\to ${k}} f(x)=f(${k})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_12",
      topicId: "calc_limit_basic",
      title: "極限（一次式の比）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const a = pick([1, 2, 3, -1, -2]);
      const k = pick([1, 2, -1, -2]);
      return {
        templateId: "calc_limit_basic_12",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{${texLinear(a, 0)}}{x}$$`,
        answerKind: "numeric",
        params: { a, k, value: a },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.value);
    },
    explain(params) {
      const { a, k } = params as { a: number; k: number };
      return `
### この問題の解説
$x\\ne 0$ の範囲で $\\frac{${a}x}{x}=${a}$ なので
$$
\lim_{x\\to ${k}} \\frac{${a}x}{x}=${a}
$$
答えは **${a}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_13",
      topicId: "calc_limit_basic",
      title: "極限（差の形 6）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      return {
        templateId: "calc_limit_basic_13",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{x^2-${k}^2}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).value);
    },
    explain(params) {
      const { k, value } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{x^2-${k}^2}{x-${k}}=x+${k}
$$
したがって
$$
\lim_{x\\to ${k}} (x+${k})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_14",
      topicId: "calc_limit_basic",
      title: "極限（二次式の差の形）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const a = pick([1, 2, 3]);
      const k = pick([1, 2, 3]);
      const value = 2 * a * k;
      const numerator = texPoly2(a, -a * k, 0);
      return {
        templateId: "calc_limit_basic_14",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{${numerator}}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params: { a, k, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const { a, k, value } = params as { a: number; k: number; value: number };
      return `
### この問題の解説
$$
\\frac{${numerator}}{${xMinus(k)}}=\\frac{${a}x(x-${k})}{${xMinus(k)}}=${a}x
$$
したがって
$$
\lim_{x\\to ${k}} ${a}x=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_15",
      topicId: "calc_limit_basic",
      title: "極限（代入 6）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a - 1, b);
      return {
        templateId: "calc_limit_basic_15",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b - k;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b - k;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\cdot ${k} + ${b} - ${k} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_16",
      topicId: "calc_limit_basic",
      title: "極限（代入 7）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, b + a);
      return {
        templateId: "calc_limit_basic_16",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + b + a;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\cdot ${k} + ${b} + ${a} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_17",
      topicId: "calc_limit_basic",
      title: "極限（差の形 7）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildDiffParams();
      const { k } = params;
      const numerator = texPoly2(1, -k, 0);
      return {
        templateId: "calc_limit_basic_17",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\frac{${numerator}}{${xMinus(k)}}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).k);
    },
    explain(params) {
      const { k } = params as DiffParams;
      return `
### この問題の解説
$$
\\frac{${numerator}}{${xMinus(k)}}=x
$$
したがって
$$
\lim_{x\\to ${k}} x=${k}
$$
答えは **${k}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_18",
      topicId: "calc_limit_basic",
      title: "極限（一次式の比 2）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const a = pick([1, 2, 3, -1, -2]);
      const b = pick([1, 2, -1, -2]);
      return {
        templateId: "calc_limit_basic_18",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to 1} \\frac{${texLinear(a, b)}}{x}$$`,
        answerKind: "numeric",
        params: { a, b, value: a + b },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.value);
    },
    explain(params) {
      const { a, b, value } = params as { a: number; b: number; value: number };
      return `
### この問題の解説
$x\\to 1$ なので
$$
\lim_{x\\to 1} \\frac{${a}x+${b}}{x}=${a}+${b}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_19",
      topicId: "calc_limit_basic",
      title: "極限（代入 8）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildLinearParams();
      const { k, a, b } = params;
      const fx = texLinear(a, 2 * b);
      return {
        templateId: "calc_limit_basic_19",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} \\left(${fx}\\right)$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + 2 * b;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { k, a, b } = params as LinearParams;
      const value = a * k + 2 * b;
      return `
### この問題の解説
連続な関数なので代入できます。
$$
${a}\cdot ${k} + 2\cdot ${b} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_limit_basic_20",
      topicId: "calc_limit_basic",
      title: "極限（二次式の代入 2）",
      difficulty: 1,
      tags: ["calculus", "limit"],
    },
    generate() {
      const params = buildSquareParams();
      const { k, a, b, c } = params;
      const fx = texPoly2(a, b, c);
      return {
        templateId: "calc_limit_basic_20",
        statement: `次の極限を求めよ。\n\n$$\\lim_{x\\to ${k}} (${fx})$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.value);
    },
    explain(params) {
      const { k, value } = params as { k: number; value: number };
      return `
### この問題の解説
連続な関数なので代入できます。
$$
\lim_{x\\to ${k}} f(x)=f(${k})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  ...extraLimitTemplates,
];
