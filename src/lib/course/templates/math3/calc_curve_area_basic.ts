// src/lib/course/templates/math3/calc_curve_area_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

type AreaParams = {
  m: number;
  value: number;
};

type AreaParamAB = {
  a: number;
  b: number;
  value: number;
};

function buildParams(): AreaParams {
  const m = pick([1, 2, 3]);
  return { m, value: m };
}

function buildParamsAB(): AreaParamAB {
  const a = pick([1, 2, 3, 4, 5]);
  const b = pick([1, 2, 3, 4, 5]);
  const value = Math.abs(a - b);
  return { a, b, value };
}

const extraCurveAreaTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 2;
  const templateId = `calc_curve_area_basic_${idx + 21}`;
  const title = kind === 0 ? "曲線で囲まれた面積（ax vs bx^2）" : "曲線で囲まれた面積（ax^2 vs bx^3）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_curve_area_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      if (kind === 0) {
        const params = buildParamsAB();
        const { a, b } = params;
        const line = texLinear(a, 0);
        const quad = texPoly2(b, 0, 0);
        return {
          templateId,
          statement: `次の2曲線 $y=${line}$ と $y=${quad}$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
          answerKind: "numeric",
          params,
        };
      }
      const m = pick([1, 2, 3, 4]);
      const n = pick([1, 2, 3, 4]);
      const a = 12 * m;
      const b = 12 * n;
      const quad = texPoly2(a, 0, 0);
      const cubic = `${b}x^3`;
      const value = Math.abs(4 * m - 3 * n);
      return {
        templateId,
        statement: `次の2曲線 $y=${quad}$ と $y=${cubic}$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params: { a, b, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const { value } = params as any;
      return `
### この問題の解説
区間 $0\\le x\\le 1$ で上にある曲線から下の曲線を引いて積分します。
答えは **${value}** です。
`;
    },
  };
});

export const calcCurveAreaBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_curve_area_basic_1",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（1）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const params = buildParams();
      const coef = 6 * params.m;
      const line = texLinear(coef, 0);
      const quad = texPoly2(coef, 0, 0);
      return {
        templateId: "calc_curve_area_basic_1",
        statement: `次の2曲線 $y=${line}$ と $y=${quad}$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 6 * m;
      return `
### この問題の解説
$0\\le x\\le 1$ では直線が上にあります。
$$
\int_0^1 (${coef}x-${coef}x^2)\,dx = ${coef}\int_0^1 x(1-x)\,dx
$$
よって
$$
${coef}\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_2",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（2）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const params = buildParams();
      const coef = 6 * params.m;
      return {
        templateId: "calc_curve_area_basic_2",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 6 * m;
      return `
### この問題の解説
$0\\le x\\le 1$ では直線が上にあります。
$$
\int_0^1 (${coef}x-${coef}x^2)\,dx = ${coef}\int_0^1 x(1-x)\,dx
$$
よって
$$
${coef}\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_3",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（3）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const params = buildParams();
      const coef = 4 * params.m;
      return {
        templateId: "calc_curve_area_basic_3",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^3$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 4 * m;
      return `
### この問題の解説
$0\\le x\\le 1$ では直線が上にあります。
$$
\\int_0^1 (${coef}x-${coef}x^3)\\,dx = ${coef}\\int_0^1 (x-x^3)\\,dx
$$
よって
$$
${coef}\\cdot\\left(\\frac{1}{2}-\\frac{1}{4}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_4",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（4）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([2, 4, 6]);
      const params = { m, value: m / 2 };
      const coef = 3 * m;
      return {
        templateId: "calc_curve_area_basic_4",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^2$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 3 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^2)\\,dx = ${coef}\\cdot\\frac{1}{6}
$$
より ${value} です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_5",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（5）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const params = buildParams();
      const coef = 8 * params.m;
      return {
        templateId: "calc_curve_area_basic_5",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^3$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 8 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^3)\\,dx = ${coef}\\int_0^1 (x^2-x^3)\\,dx
$$
よって
$$
${coef}\\cdot\\left(\\frac{1}{3}-\\frac{1}{4}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_6",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（6）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const params = buildParams();
      const coef = 12 * params.m;
      return {
        templateId: "calc_curve_area_basic_6",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^2$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value * 2);
    },
    explain(params) {
      const { m } = params as AreaParams;
      const coef = 12 * m;
      const value = 2 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^2)\\,dx = ${coef}\\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_7",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（7）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([2, 4, 6]);
      const params = { m, value: m / 2 };
      const coef = 2 * m;
      return {
        templateId: "calc_curve_area_basic_7",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^3$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 2 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^3)\\,dx = ${coef}\\cdot\\left(\\frac{1}{2}-\\frac{1}{4}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_8",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（8）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 18 * m;
      const params = { m, value: 3 * m };
      return {
        templateId: "calc_curve_area_basic_8",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^2$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 18 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^2)\\,dx = ${coef}\\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_9",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（9）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 15 * m;
      const params = { m, value: 2 * m };
      return {
        templateId: "calc_curve_area_basic_9",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^4$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 15 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^4)\\,dx = ${coef}\\left(\\frac{1}{3}-\\frac{1}{5}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_10",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（10）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 30 * m;
      const params = { m, value: 5 * m };
      return {
        templateId: "calc_curve_area_basic_10",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^2$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 30 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^2)\\,dx = ${coef}\\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_11",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（11）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 10 * m;
      const params = { m, value: 3 * m };
      return {
        templateId: "calc_curve_area_basic_11",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^4$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 10 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^4)\\,dx = ${coef}\\left(\\frac{1}{2}-\\frac{1}{5}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_12",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（12）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 3 * m;
      const params = { m, value: m };
      return {
        templateId: "calc_curve_area_basic_12",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^5$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 3 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^5)\\,dx = ${coef}\\left(\\frac{1}{2}-\\frac{1}{6}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_13",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（13）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 12 * m;
      const params = { m, value: m };
      return {
        templateId: "calc_curve_area_basic_13",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^3$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 12 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^3)\\,dx = ${coef}\\left(\\frac{1}{3}-\\frac{1}{4}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_14",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（14）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 6 * m;
      const params = { m, value: m };
      return {
        templateId: "calc_curve_area_basic_14",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^5$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 6 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^5)\\,dx = ${coef}\\left(\\frac{1}{3}-\\frac{1}{6}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_15",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（15）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 20 * m;
      const params = { m, value: m };
      return {
        templateId: "calc_curve_area_basic_15",
        statement: `次の2曲線 $y=${coef}x^3$ と $y=${coef}x^4$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 20 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^3-${coef}x^4)\\,dx = ${coef}\\left(\\frac{1}{4}-\\frac{1}{5}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_16",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（16）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 12 * m;
      const params = { m, value: 3 * m };
      return {
        templateId: "calc_curve_area_basic_16",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^3$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 12 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^3)\\,dx = ${coef}\\left(\\frac{1}{2}-\\frac{1}{4}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_17",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（17）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 30 * m;
      const params = { m, value: 4 * m };
      return {
        templateId: "calc_curve_area_basic_17",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^4$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 30 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^4)\\,dx = ${coef}\\left(\\frac{1}{3}-\\frac{1}{5}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_18",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（18）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 18 * m;
      const params = { m, value: 3 * m };
      return {
        templateId: "calc_curve_area_basic_18",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^2$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 18 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^2)\\,dx = ${coef}\\cdot\\frac{1}{6}=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_19",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（19）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 21 * m;
      const params = { m, value: 4 * m };
      return {
        templateId: "calc_curve_area_basic_19",
        statement: `次の2曲線 $y=${coef}x^2$ と $y=${coef}x^6$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 21 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x^2-${coef}x^6)\\,dx = ${coef}\\left(\\frac{1}{3}-\\frac{1}{7}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_curve_area_basic_20",
      topicId: "calc_curve_area_basic",
      title: "曲線で囲まれた面積（20）",
      difficulty: 1,
      tags: ["calculus", "area"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const coef = 6 * m;
      const params = { m, value: 2 * m };
      return {
        templateId: "calc_curve_area_basic_20",
        statement: `次の2曲線 $y=${coef}x$ と $y=${coef}x^5$ によって $0\\le x\\le 1$ で囲まれる面積を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).value);
    },
    explain(params) {
      const { m, value } = params as AreaParams;
      const coef = 6 * m;
      return `
### この問題の解説
$$
\\int_0^1 (${coef}x-${coef}x^5)\\,dx = ${coef}\\left(\\frac{1}{2}-\\frac{1}{6}\\right)=${value}
$$
答えは **${value}** です。
`;
    },
  },
  ...extraCurveAreaTemplates,
];
