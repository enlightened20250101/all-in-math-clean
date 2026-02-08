// src/lib/course/templates/math3/calc_parametric_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type ParamParams = {
  t0: number;
  value: number;
};

type DerivLinearQuadParams = {
  t0: number;
  a: number;
  b: number;
  c: number;
  value: number;
};

type DerivQuadCubicParams = {
  t0: number;
  a: number;
  b: number;
  value: number;
};

type CoordParams = {
  t0: number;
  a: number;
  b: number;
  c: number;
  value: number;
  ask: "x" | "y";
};

function buildSimple(): ParamParams {
  const t0 = randInt(1, 4);
  return { t0, value: 2 * t0 };
}

function buildScaled(): ParamParams {
  const t0 = randInt(1, 5);
  return { t0, value: t0 };
}

function buildDerivLinearQuad(): DerivLinearQuadParams {
  while (true) {
    const a = pick([1, 2, 3]);
    const b = pick([1, 2, 3, 4]);
    const c = pick([0, 2, 4, 6, -2, -4]);
    const t0 = randInt(1, 6);
    const numerator = 2 * b * t0 + c;
    if (numerator % a !== 0) continue;
    const value = numerator / a;
    return { t0, a, b, c, value };
  }
}

function buildDerivQuadCubic(): DerivQuadCubicParams {
  const a = pick([1, 2]);
  const b = pick([1, 2, 3]);
  const k = randInt(1, 3);
  const t0 = 2 * a * k;
  const value = 3 * b * k;
  return { t0, a, b, value };
}

function buildCoord(): CoordParams {
  const t0 = randInt(1, 5);
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-4, 4);
  const c = pick([1, 2, -1, -2, 3]);
  const ask = pick(["x", "y"] as const);
  const value = ask === "x" ? a * t0 + b : c * t0 * t0 + b;
  return { t0, a, b, c, value, ask };
}

const extraParametricTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_parametric_basic_${idx + 21}`;
  const title = kind === 0 ? "媒介変数（線形×二次）" : kind === 1 ? "媒介変数（平方×立方）" : "媒介変数（座標計算）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_parametric_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      if (kind === 0) {
        const params = buildDerivLinearQuad();
        const { t0, a, b, c } = params;
        const xtex = texTerm(a, "t", true);
        const ytex = `${texTerm(b, "t^2", true)}${texTerm(c, "t")}`;
        return {
          templateId,
          statement: `移動体の軌道を媒介変数表示 $x=${xtex},\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
          answerKind: "numeric",
          params,
        };
      }
      if (kind === 1) {
        const params = buildDerivQuadCubic();
        const { t0, a, b } = params;
        const xtex = texTerm(a, "t^2", true);
        const ytex = texTerm(b, "t^3", true);
        return {
          templateId,
          statement: `移動体の軌道を媒介変数表示 $x=${xtex},\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
          answerKind: "numeric",
          params,
        };
      }
      const params = buildCoord();
      const { t0, a, b, c, ask } = params;
      const ytex = `${texTerm(c, "t^2", true)}${texConst(b)}`;
      const xtex = `${texTerm(a, "t", true)}${texConst(b)}`;
      const target = ask === "x" ? "x" : "y";
      return {
        templateId,
        statement: `移動体の軌道を媒介変数表示 $x=${xtex},\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における ${target} 座標を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const p = params as any;
      if (p.a !== undefined && p.b !== undefined && p.c !== undefined && p.ask) {
        const { t0, a, b, c, value, ask } = p as CoordParams;
        return `
### この問題の解説
$t=${t0}$ を代入して ${ask} 座標を計算します。
${ask === "x" ? `x=${a}\\cdot${t0}+${b}=${value}` : `y=${c}\\cdot${t0}^2+${b}=${value}`}
答えは **${value}** です。
`;
      }
      if (p.a !== undefined && p.b !== undefined && p.c !== undefined) {
        const { t0, a, b, c, value } = p as DerivLinearQuadParams;
        return `
### この問題の解説
$$
\\frac{dx}{dt}=${a},\\quad \\frac{dy}{dt}=2\\cdot${b}t+${c}
$$
したがって
$$
\\frac{dy}{dx}=\\frac{2${b}t+${c}}{${a}}
$$
$t=${t0}$ のとき **${value}** です。
`;
      }
      const { t0, a, b, value } = p as DerivQuadCubicParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2${a}t,\\quad \\frac{dy}{dt}=3${b}t^2
$$
したがって
$$
\\frac{dy}{dx}=\\frac{3${b}t^2}{2${a}t}=\\frac{3${b}}{2${a}}t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  };
});

const extraParametricTemplates2: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_parametric_basic_${idx + 51}`;
  const title = kind === 0 ? "媒介変数（dx/dt, dy/dt）" : kind === 1 ? "媒介変数（傾き計算）" : "媒介変数（座標計算2）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_parametric_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      if (kind === 0) {
        const t0 = randInt(1, 5);
        const a = pick([1, 2, 3]);
        const b = pick([1, 2, 3]);
        const value = 2 * b * t0;
        const xtex = texTerm(a, "t", true);
        const ytex = texTerm(b, "t^2", true);
        return {
          templateId,
          statement: `移動体の軌道を媒介変数表示 $x=${xtex},\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dt}$ を求めよ。`,
          answerKind: "numeric",
          params: { t0, a, b, c: 0, value },
        };
      }
      if (kind === 1) {
        const a = pick([1, 2, 3]);
        const b = pick([1, 2, 3]);
        const k = randInt(1, 4);
        const t0 = a * k;
        const value = 2 * b * k;
        const xtex = texTerm(a, "t", true);
        const ytex = texTerm(b, "t^2", true);
        return {
          templateId,
          statement: `移動体の軌道を媒介変数表示 $x=${xtex},\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
          answerKind: "numeric",
          params: { t0, a, b, c: 0, value },
        };
      }
      const t0 = randInt(1, 5);
      const a = pick([1, 2, 3, -1, -2]);
      const b = randInt(-4, 4);
      const c = pick([1, 2, -1, -2]);
      const value = a * t0 * t0 + b * t0 + c;
      let ytex = texTerm(a, "t^2", true);
      const tTerm = texTerm(b, "t");
      if (tTerm) ytex = `${ytex} ${tTerm}`;
      const cTerm = texConst(c);
      if (cTerm) ytex = `${ytex} ${cTerm}`;
      return {
        templateId,
        statement: `移動体の軌道を媒介変数表示 $x=t,\\ y=${ytex}$ で表された曲線について、$t=${t0}$ における $y$ 座標を求めよ。`,
        answerKind: "numeric",
        params: { t0, a, b, c, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const p = params as any;
      if (p.a !== undefined && p.b !== undefined && p.c !== undefined) {
        return `
### この問題の解説
$t=${p.t0}$ を代入して $y$ を計算します。
答えは **${p.value}** です。
`;
      }
      return `
### この問題の解説
移動体の軌道を媒介変数表示の微分は
$$
\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}
$$
で求めます。答えは **${p.value}** です。
`;
    },
  };
});

export const calcParametricBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_parametric_basic_1",
      topicId: "calc_parametric_basic",
      title: "媒介変数（1）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const params = buildSimple();
      const { t0 } = params;
      return {
        templateId: "calc_parametric_basic_1",
        statement: `移動体の軌道を媒介変数表示 $x=t,\ y=t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=1,\quad \\frac{dy}{dt}=2t
$$
したがって
$$
\\frac{dy}{dx}=\\frac{2t}{1}=2t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_2",
      topicId: "calc_parametric_basic",
      title: "媒介変数（2）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const params = buildScaled();
      const { t0 } = params;
      return {
        templateId: "calc_parametric_basic_2",
        statement: `移動体の軌道を媒介変数表示 $x=2t,\ y=t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2,\quad \\frac{dy}{dt}=2t
$$
したがって
$$
\\frac{dy}{dx}=\\frac{2t}{2}=t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_3",
      topicId: "calc_parametric_basic",
      title: "媒介変数（3）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = pick([2, 4, 6]);
      const value = (3 * t0) / 2;
      return {
        templateId: "calc_parametric_basic_3",
        statement: `移動体の軌道を媒介変数表示 $x=t^2,\\ y=t^3$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2t,\\quad \\frac{dy}{dt}=3t^2
$$
したがって
$$
\\frac{dy}{dx}=\\frac{3t^2}{2t}=\\frac{3}{2}t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_4",
      topicId: "calc_parametric_basic",
      title: "媒介変数（4）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 2 * t0;
      return {
        templateId: "calc_parametric_basic_4",
        statement: `移動体の軌道を媒介変数表示 $x=3t,\\ y=3t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=3,\\quad \\frac{dy}{dt}=6t
$$
したがって
$$
\\frac{dy}{dx}=\\frac{6t}{3}=2t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_5",
      topicId: "calc_parametric_basic",
      title: "媒介変数（5）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 6 * t0;
      return {
        templateId: "calc_parametric_basic_5",
        statement: `移動体の軌道を媒介変数表示 $x=t,\\ y=3t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=1,\\quad \\frac{dy}{dt}=6t
$$
したがって
$$
\\frac{dy}{dx}=6t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_6",
      topicId: "calc_parametric_basic",
      title: "媒介変数（6）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 4 * t0;
      return {
        templateId: "calc_parametric_basic_6",
        statement: `移動体の軌道を媒介変数表示 $x=2t,\\ y=4t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2,\\quad \\frac{dy}{dt}=8t
$$
したがって
$$
\\frac{dy}{dx}=4t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_7",
      topicId: "calc_parametric_basic",
      title: "媒介変数（7）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = pick([1, 2, 3, 4]);
      const value = 1;
      return {
        templateId: "calc_parametric_basic_7",
        statement: `移動体の軌道を媒介変数表示 $x=t^2,\\ y=t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0 } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2t,\\quad \\frac{dy}{dt}=2t
$$
したがって
$$
\\frac{dy}{dx}=1
$$
$t=${t0}$ のとき **1** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_8",
      topicId: "calc_parametric_basic",
      title: "媒介変数（8）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = pick([2, 4, 6]);
      const value = t0 / 2;
      return {
        templateId: "calc_parametric_basic_8",
        statement: `移動体の軌道を媒介変数表示 $x=4t,\\ y=t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=4,\\quad \\frac{dy}{dt}=2t
$$
したがって
$$
\\frac{dy}{dx}=\\frac{2t}{4}=\\frac{t}{2}
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_9",
      topicId: "calc_parametric_basic",
      title: "媒介変数（9）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 2;
      return {
        templateId: "calc_parametric_basic_9",
        statement: `移動体の軌道を媒介変数表示 $x=t^2,\\ y=2t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0 } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2t,\\quad \\frac{dy}{dt}=4t
$$
したがって
$$
\\frac{dy}{dx}=2
$$
$t=${t0}$ のとき **2** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_10",
      topicId: "calc_parametric_basic",
      title: "媒介変数（10）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 3);
      const value = 3 * t0 * t0;
      return {
        templateId: "calc_parametric_basic_10",
        statement: `移動体の軌道を媒介変数表示 $x=t,\\ y=t^3$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=1,\\quad \\frac{dy}{dt}=3t^2
$$
したがって
$$
\\frac{dy}{dx}=3t^2
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_11",
      topicId: "calc_parametric_basic",
      title: "媒介変数（11）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 10 * t0;
      return {
        templateId: "calc_parametric_basic_11",
        statement: `移動体の軌道を媒介変数表示 $x=t,\\ y=5t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=1,\\quad \\frac{dy}{dt}=10t
$$
したがって
$$
\\frac{dy}{dx}=10t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_12",
      topicId: "calc_parametric_basic",
      title: "媒介変数（12）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = pick([3, 6]);
      const value = (2 * t0) / 3;
      return {
        templateId: "calc_parametric_basic_12",
        statement: `移動体の軌道を媒介変数表示 $x=3t,\\ y=t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=3,\\quad \\frac{dy}{dt}=2t
$$
したがって
$$
\\frac{dy}{dx}=\\frac{2t}{3}
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_13",
      topicId: "calc_parametric_basic",
      title: "媒介変数（13）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 3;
      return {
        templateId: "calc_parametric_basic_13",
        statement: `移動体の軌道を媒介変数表示 $x=t^2,\\ y=3t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0 } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2t,\\quad \\frac{dy}{dt}=6t
$$
したがって
$$
\\frac{dy}{dx}=3
$$
$t=${t0}$ のとき **3** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_14",
      topicId: "calc_parametric_basic",
      title: "媒介変数（14）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = pick([2, 4]);
      const value = (3 * t0 * t0) / 2;
      return {
        templateId: "calc_parametric_basic_14",
        statement: `移動体の軌道を媒介変数表示 $x=2t,\\ y=t^3$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2,\\quad \\frac{dy}{dt}=3t^2
$$
したがって
$$
\\frac{dy}{dx}=\\frac{3t^2}{2}
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_15",
      topicId: "calc_parametric_basic",
      title: "媒介変数（15）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 2 * t0;
      return {
        templateId: "calc_parametric_basic_15",
        statement: `移動体の軌道を媒介変数表示 $x=5t,\\ y=5t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=5,\\quad \\frac{dy}{dt}=10t
$$
したがって
$$
\\frac{dy}{dx}=2t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_16",
      topicId: "calc_parametric_basic",
      title: "媒介変数（16）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 8 * t0;
      return {
        templateId: "calc_parametric_basic_16",
        statement: `移動体の軌道を媒介変数表示 $x=t,\\ y=4t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=1,\\quad \\frac{dy}{dt}=8t
$$
したがって
$$
\\frac{dy}{dx}=8t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_17",
      topicId: "calc_parametric_basic",
      title: "媒介変数（17）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 2 * t0;
      return {
        templateId: "calc_parametric_basic_17",
        statement: `移動体の軌道を媒介変数表示 $x=4t,\\ y=4t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=4,\\quad \\frac{dy}{dt}=8t
$$
したがって
$$
\\frac{dy}{dx}=2t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_18",
      topicId: "calc_parametric_basic",
      title: "媒介変数（18）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 4 * t0;
      return {
        templateId: "calc_parametric_basic_18",
        statement: `移動体の軌道を媒介変数表示 $x=3t,\\ y=6t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=3,\\quad \\frac{dy}{dt}=12t
$$
したがって
$$
\\frac{dy}{dx}=4t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_19",
      topicId: "calc_parametric_basic",
      title: "媒介変数（19）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 5);
      const value = t0;
      return {
        templateId: "calc_parametric_basic_19",
        statement: `移動体の軌道を媒介変数表示 $x=6t,\\ y=3t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0, value } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=6,\\quad \\frac{dy}{dt}=6t
$$
したがって
$$
\\frac{dy}{dx}=t
$$
$t=${t0}$ のとき **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_parametric_basic_20",
      topicId: "calc_parametric_basic",
      title: "媒介変数（20）",
      difficulty: 1,
      tags: ["calculus", "parametric"],
    },
    generate() {
      const t0 = randInt(1, 4);
      const value = 4;
      return {
        templateId: "calc_parametric_basic_20",
        statement: `移動体の軌道を媒介変数表示 $x=t^2,\\ y=4t^2$ で表された曲線について、$t=${t0}$ における $\\dfrac{dy}{dx}$ を求めよ。`,
        answerKind: "numeric",
        params: { t0, value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ParamParams).value);
    },
    explain(params) {
      const { t0 } = params as ParamParams;
      return `
### この問題の解説
$$
\\frac{dx}{dt}=2t,\\quad \\frac{dy}{dt}=8t
$$
したがって
$$
\\frac{dy}{dx}=4
$$
$t=${t0}$ のとき **4** です。
`;
    },
  },
  ...extraParametricTemplates,
  ...extraParametricTemplates2,
];
