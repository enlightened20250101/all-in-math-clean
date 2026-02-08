// src/lib/course/templates/math3/calc_integral_advanced_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type IntParams1 = {
  m: number;
  value: number;
};

type IntParams2 = {
  p: number;
  value: number;
};

type ExtraIntegralParams = {
  m: number;
  b: number;
  value: number;
};

type ExtraIntegralParams2 = {
  m: number;
  value: number;
};

function buildU1(): IntParams1 {
  const m = pick([1, 2, 3]);
  const value = 9 * m;
  return { m, value };
}

function buildU2(): IntParams2 {
  const p = pick([1, 2, 3]);
  const value = 40 * p;
  return { p, value };
}

function buildU3(): ExtraIntegralParams {
  const m = pick([1, 2, 3, 4]);
  const value = 13 * m;
  return { m, b: 0, value };
}

function buildU4(): ExtraIntegralParams {
  const m = pick([1, 2, 3, 4]);
  const b = pick([1, 2, 3, 4]);
  const value = m * (2 * b + 1);
  return { m, b, value };
}

function buildU5(): ExtraIntegralParams {
  const m = pick([1, 2, 3, 4, 5]);
  const value = 7 * m;
  return { m, b: 0, value };
}

function buildU6(): ExtraIntegralParams2 {
  const m = pick([1, 2, 3, 4]);
  const value = 242 * m;
  return { m, value };
}

function buildU7(): ExtraIntegralParams2 {
  const m = pick([1, 2, 3, 4]);
  const value = 255 * m;
  return { m, value };
}

function buildU8(): ExtraIntegralParams2 {
  const m = pick([1, 2, 3, 4, 5]);
  const value = 17 * m;
  return { m, value };
}

const extraIntegralTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_integral_advanced_basic_${idx + 21}`;
  const title = kind === 0 ? "置換積分（2次）" : kind === 1 ? "置換積分（x(x^2+b)）" : "置換積分（(3x+1)^2）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_advanced_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      if (kind === 0) {
        const params = buildU3();
        const coef = 3 * params.m;
        return {
          templateId,
          statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${coef}(2x+1)^2\\\\,dx$$`,
          answerKind: "numeric",
          params,
        };
      }
      if (kind === 1) {
        const params = buildU4();
        const coef = 4 * params.m;
        const b = params.b;
        return {
          templateId,
          statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${coef}x(x^2+${b})\\\\,dx$$`,
          answerKind: "numeric",
          params,
        };
      }
      const params = buildU5();
      const coef = params.m;
      const coefText = coef === 1 ? "" : `${coef}`;
      return {
        templateId,
        statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${coefText}(3x+1)^2\\\\,dx$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ExtraIntegralParams).value);
    },
    explain(params) {
      const { value } = params as ExtraIntegralParams;
      return `
### この問題の解説
置換積分で $u$ を設定し、定積分の値を計算します。
答えは **${value}** です。
`;
    },
  };
});

const extraIntegralTemplates2: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_integral_advanced_basic_${idx + 51}`;
  const title = kind === 0 ? "置換積分（(2x+1)^4）" : kind === 1 ? "置換積分（(3x+1)^3）" : "置換積分（x(2x+1)^2）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_integral_advanced_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      if (kind === 0) {
        const params = buildU6();
        return {
          templateId,
          statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${10 * params.m}(2x+1)^4\\\\,dx$$`,
          answerKind: "numeric",
          params,
        };
      }
      if (kind === 1) {
        const params = buildU7();
        return {
          templateId,
          statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${12 * params.m}(3x+1)^3\\\\,dx$$`,
          answerKind: "numeric",
          params,
        };
      }
      const params = buildU8();
      return {
        templateId,
        statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${6 * params.m}x(2x+1)^2\\\\,dx$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ExtraIntegralParams2).value);
    },
    explain(params) {
      const { value } = params as ExtraIntegralParams2;
      return `
### この問題の解説
置換積分で $u$ を設定し、定積分の値を計算します。
答えは **${value}** です。
`;
    },
  };
});

export const calcIntegralAdvancedBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_integral_advanced_basic_1",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（1）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const params = buildU1();
      const coef = 6 * params.m;
      return {
        templateId: "calc_integral_advanced_basic_1",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${coef}x(x^2+1)\\,dx$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      const coef = 6 * m;
      return `
### この問題の解説
$u=x^2+1$ と置くと $du=2x\,dx$ なので
$$
\int_0^1 ${coef}x(x^2+1)\,dx = 3${m}\int_1^2 u\,du
$$
よって
$$
3${m}\cdot \left[\\frac{u^2}{2}\right]_1^2 = 3${m}\cdot\\frac{4-1}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_2",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（2）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const params = buildU2();
      const coef = 4 * params.p;
      return {
        templateId: "calc_integral_advanced_basic_2",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${coef}(2x+1)^3\\,dx$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      const coef = 4 * p;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\,dx$ なので
$$
\int_0^1 ${coef}(2x+1)^3\,dx = ${p}\int_1^3 2u^3\,du
$$
よって
$$
${p}\cdot \left[\\frac{u^4}{2}\right]_1^3 = ${p}\cdot\\frac{81-1}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_3",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（3）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 14 * p;
      return {
        templateId: "calc_integral_advanced_basic_3",
        statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${2 * p}(3x+1)^2\\\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${2 * p}(3x+1)^2\\,dx = \\frac{2${p}}{3}\\int_1^4 u^2\\,du
$$
よって
$$
\\frac{2${p}}{3}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_4",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（4）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 5 * m;
      return {
        templateId: "calc_integral_advanced_basic_4",
        statement: `流量の合計として次の定積分を求めよ。\\n\\n$$\\\\int_0^1 ${4 * m}x(x^2+2)\\\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+2$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${4 * m}x(x^2+2)\\,dx = 2${m}\\int_2^3 u\\,du
$$
よって
$$
2${m}\\cdot\\left[\\frac{u^2}{2}\\right]_2^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_5",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（5）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 3 * m;
      return {
        templateId: "calc_integral_advanced_basic_5",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${4 * m}x(x^2+1)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+1$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${4 * m}x(x^2+1)\\,dx = 2${m}\\int_1^2 u\\,du
$$
よって
$$
2${m}\\cdot\\left[\\frac{u^2}{2}\\right]_1^2 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_6",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（6）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 13 * p;
      return {
        templateId: "calc_integral_advanced_basic_6",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${3 * p}(2x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\\,dx$ なので
$$
\\int_0^1 ${3 * p}(2x+1)^2\\,dx = \\frac{3${p}}{2}\\int_1^3 u^2\\,du
$$
よって
$$
\\frac{3${p}}{2}\\cdot\\left[\\frac{u^3}{3}\\right]_1^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_7",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（7）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 7 * m;
      return {
        templateId: "calc_integral_advanced_basic_7",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${m}(3x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${m}(3x+1)^2\\,dx = \\frac{${m}}{3}\\int_1^4 u^2\\,du
$$
よって
$$
\\frac{${m}}{3}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_8",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（8）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 10 * p;
      return {
        templateId: "calc_integral_advanced_basic_8",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${p}(2x+1)^3\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\\,dx$ なので
$$
\\int_0^1 ${p}(2x+1)^3\\,dx = \\frac{${p}}{2}\\int_1^3 u^3\\,du
$$
よって
$$
\\frac{${p}}{2}\\cdot\\left[\\frac{u^4}{4}\\right]_1^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_9",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（9）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 6 * m;
      return {
        templateId: "calc_integral_advanced_basic_9",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${8 * m}x(x^2+1)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+1$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${8 * m}x(x^2+1)\\,dx = 4${m}\\int_1^2 u\\,du
$$
よって
$$
4${m}\\cdot\\left[\\frac{u^2}{2}\\right]_1^2 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_10",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（10）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 21 * p;
      return {
        templateId: "calc_integral_advanced_basic_10",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${3 * p}(3x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${3 * p}(3x+1)^2\\,dx = ${p}\\int_1^4 u^2\\,du
$$
よって
$$
${p}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_11",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（11）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 9 * m;
      return {
        templateId: "calc_integral_advanced_basic_11",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${12 * m}x(x^2+1)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+1$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${12 * m}x(x^2+1)\\,dx = 6${m}\\int_1^2 u\\,du
$$
よって
$$
6${m}\\cdot\\frac{4-1}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_12",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（12）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 12 * m;
      return {
        templateId: "calc_integral_advanced_basic_12",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${16 * m}x(x^2+1)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+1$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${16 * m}x(x^2+1)\\,dx = 8${m}\\int_1^2 u\\,du
$$
よって
$$
8${m}\\cdot\\frac{4-1}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_13",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（13）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 20 * p;
      return {
        templateId: "calc_integral_advanced_basic_13",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${2 * p}(2x+1)^3\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\\,dx$ なので
$$
\\int_0^1 ${2 * p}(2x+1)^3\\,dx = ${p}\\int_1^3 u^3\\,du
$$
よって
$$
${p}\\cdot\\left[\\frac{u^4}{4}\\right]_1^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_14",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（14）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 50 * p;
      return {
        templateId: "calc_integral_advanced_basic_14",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${5 * p}(2x+1)^3\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\\,dx$ なので
$$
\\int_0^1 ${5 * p}(2x+1)^3\\,dx = \\frac{5${p}}{2}\\int_1^3 u^3\\,du
$$
よって
$$
\\frac{5${p}}{2}\\cdot\\left[\\frac{u^4}{4}\\right]_1^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_15",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（15）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 26 * p;
      return {
        templateId: "calc_integral_advanced_basic_15",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${6 * p}(2x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=2x+1$ と置くと $du=2\\,dx$ なので
$$
\\int_0^1 ${6 * p}(2x+1)^2\\,dx = 3${p}\\int_1^3 u^2\\,du
$$
よって
$$
3${p}\\cdot\\left[\\frac{u^3}{3}\\right]_1^3 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_16",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（16）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 63 * p;
      return {
        templateId: "calc_integral_advanced_basic_16",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${9 * p}(3x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${9 * p}(3x+1)^2\\,dx = 3${p}\\int_1^4 u^2\\,du
$$
よって
$$
3${p}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_17",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（17）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 15 * m;
      return {
        templateId: "calc_integral_advanced_basic_17",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${12 * m}x(x^2+2)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+2$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${12 * m}x(x^2+2)\\,dx = 6${m}\\int_2^3 u\\,du
$$
よって
$$
6${m}\\cdot\\frac{9-4}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_18",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（18）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const m = pick([1, 2, 3]);
      const value = 25 * m;
      return {
        templateId: "calc_integral_advanced_basic_18",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${20 * m}x(x^2+2)\\,dx$$`,
        answerKind: "numeric",
        params: { m, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams1).value);
    },
    explain(params) {
      const { m, value } = params as IntParams1;
      return `
### この問題の解説
$u=x^2+2$ と置くと $du=2x\\,dx$ なので
$$
\\int_0^1 ${20 * m}x(x^2+2)\\,dx = 10${m}\\int_2^3 u\\,du
$$
よって
$$
10${m}\\cdot\\frac{9-4}{2} = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_19",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（19）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 28 * p;
      return {
        templateId: "calc_integral_advanced_basic_19",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${4 * p}(3x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${4 * p}(3x+1)^2\\,dx = \\frac{4${p}}{3}\\int_1^4 u^2\\,du
$$
よって
$$
\\frac{4${p}}{3}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_integral_advanced_basic_20",
      topicId: "calc_integral_advanced_basic",
      title: "置換積分（20）",
      difficulty: 1,
      tags: ["calculus", "integral", "substitution"],
    },
    generate() {
      const p = pick([1, 2, 3]);
      const value = 35 * p;
      return {
        templateId: "calc_integral_advanced_basic_20",
        statement: `流量の合計として次の定積分を求めよ。\n\n$$\\int_0^1 ${5 * p}(3x+1)^2\\,dx$$`,
        answerKind: "numeric",
        params: { p, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as IntParams2).value);
    },
    explain(params) {
      const { p, value } = params as IntParams2;
      return `
### この問題の解説
$u=3x+1$ と置くと $du=3\\,dx$ なので
$$
\\int_0^1 ${5 * p}(3x+1)^2\\,dx = \\frac{5${p}}{3}\\int_1^4 u^2\\,du
$$
よって
$$
\\frac{5${p}}{3}\\cdot\\left[\\frac{u^3}{3}\\right]_1^4 = ${value}
$$
答えは **${value}** です。
`;
    },
  },
  ...extraIntegralTemplates,
  ...extraIntegralTemplates2,
];
