// src/lib/course/templates/math3/calc_derivative_advanced_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texConst, texLinear, texPoly2 } from "@/lib/format/tex";

type DerivParams = {
  a: number;
  b: number;
  x0: number;
  power: 2 | 3;
  value: number;
};

type DerivPolyParams = {
  a: number;
  b: number;
  x0: number;
  c: number;
  value: number;
};

function buildParams(power: 2 | 3): DerivParams {
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-4, 4);
  const x0 = randInt(-2, 2);
  const inner = a * x0 + b;
  const value = power === 2 ? 2 * a * inner : 3 * a * inner * inner;
  return { a, b, x0, power, value };
}

function buildPolyParams(): DerivPolyParams {
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const x0 = randInt(-2, 2);
  const value = 2 * a * x0 + b;
  return { a, b, c, x0, value };
}

function splitSigned(expr: string) {
  const s = expr.trim();
  if (s.startsWith("-")) return { sign: "-", body: s.slice(1).trim() };
  return { sign: "+", body: s };
}

function addExpr(base: string, expr: string) {
  const { sign, body } = splitSigned(expr);
  return `${base} ${sign} (${body})`;
}

function subExpr(base: string, expr: string) {
  const { sign, body } = splitSigned(expr);
  const op = sign === "-" ? "+" : "-";
  return `${base} ${op} (${body})`;
}

const extraDerivativeTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 3;
  const templateId = `calc_derivative_advanced_basic_${idx + 21}`;
  const title = kind === 0 ? "合成関数の微分（2乗）" : kind === 1 ? "合成関数の微分（3乗）" : "多項式の微分（2次）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_derivative_advanced_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      if (kind === 0) {
        const params = buildParams(2);
        const fx = `(${texLinear(params.a, params.b)})^2`;
        return {
          templateId,
          statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
          answerKind: "numeric",
          params,
        };
      }
      if (kind === 1) {
        const params = buildParams(3);
        const fx = `(${texLinear(params.a, params.b)})^3`;
        return {
          templateId,
          statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
          answerKind: "numeric",
          params,
        };
      }
      const params = buildPolyParams();
      const fx = texPoly2(params.a, params.b, params.c);
      return {
        templateId,
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).value);
    },
    explain(params) {
      const p = params as any;
      if (p.c !== undefined) {
        const { a, b, x0, value } = p as DerivPolyParams;
        const dfx = texLinear(2 * a, b);
        return `
### この問題の解説
$$
f'(x)=${dfx}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
      }
      const { a, b, x0, power, value } = p as DerivParams;
      const fx = `(${texLinear(a, b)})^${power}`;
      return `
### この問題の解説
$$
f(x)=${fx}
$$
より
$$
f'(x)=${power}(${texLinear(a, b)})^${power - 1}\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  };
});

export const calcDerivativeAdvancedBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_derivative_advanced_basic_1",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `(${texLinear(params.a, params.b)})^2`;
      return {
        templateId: "calc_derivative_advanced_basic_1",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\n\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DerivParams).value);
    },
    explain(params) {
      const { a, b, x0, value } = params as DerivParams;
      return `
### この問題の解説
$$
f(x) = (${texLinear(a, b)})^2
$$
より
$$
f'(x)=2(${texLinear(a, b)})\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_2",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `(${texLinear(params.a, params.b)})^3`;
      return {
        templateId: "calc_derivative_advanced_basic_2",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\n\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DerivParams).value);
    },
    explain(params) {
      const { a, b, x0, value } = params as DerivParams;
      return `
### この問題の解説
$$
f(x) = (${texLinear(a, b)})^3
$$
より
$$
f'(x)=3(${texLinear(a, b)})^2\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_3",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗+一次）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const linear = texLinear(params.a, params.b);
      const fx = addExpr(`(${linear})^2`, linear);
      return {
        templateId: "calc_derivative_advanced_basic_3",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner + p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner + a;
      const linear = texLinear(a, b);
      const fx = addExpr(`(${linear})^2`, linear);
      const tail = texConst(a);
      return `
### この問題の解説
$$
f(x)=${fx}
$$
より
$$
f'(x)=2(${linear})\\cdot ${a}${tail ? ` ${tail}` : ""}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_4",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗+一次）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const linear = texLinear(params.a, params.b);
      const fx = subExpr(`(${linear})^3`, linear);
      return {
        templateId: "calc_derivative_advanced_basic_4",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 3 * p.a * inner * inner - p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 3 * a * inner * inner - a;
      const linear = texLinear(a, b);
      const fx = subExpr(`(${linear})^3`, linear);
      const tail = texConst(-a);
      return `
### この問題の解説
$$
f(x)=${fx}
$$
より
$$
f'(x)=3(${linear})^2\\cdot ${a}${tail ? ` ${tail}` : ""}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_5",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗 差）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `(${texLinear(params.a, params.b)})^2-2`;
      return {
        templateId: "calc_derivative_advanced_basic_5",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner;
      return `
### この問題の解説
$$
f(x)=(${texLinear(a, b)})^2-2
$$
より
$$
f'(x)=2(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_6",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗 係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `2(${texLinear(params.a, params.b)})^3`;
      return {
        templateId: "calc_derivative_advanced_basic_6",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 6 * p.a * inner * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 6 * a * inner * inner;
      return `
### この問題の解説
$$
f(x)=2(${texLinear(a, b)})^3
$$
より
$$
f'(x)=6(${texLinear(a, b)})^2\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_7",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗 係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `3(${texLinear(params.a, params.b)})^2`;
      return {
        templateId: "calc_derivative_advanced_basic_7",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 6 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 6 * a * inner;
      return `
### この問題の解説
$$
f(x)=3(${texLinear(a, b)})^2
$$
より
$$
f'(x)=6(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_8",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗+定数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `(${texLinear(params.a, params.b)})^2+5`;
      return {
        templateId: "calc_derivative_advanced_basic_8",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner;
      return `
### この問題の解説
定数項の微分は 0 です。
$$
f'(x)=2(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_9",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗+定数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `(${texLinear(params.a, params.b)})^3+4`;
      return {
        templateId: "calc_derivative_advanced_basic_9",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 3 * p.a * inner * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 3 * a * inner * inner;
      return `
### この問題の解説
定数項の微分は 0 です。
$$
f'(x)=3(${texLinear(a, b)})^2\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_10",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗-一次）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const linear = texLinear(params.a, params.b);
      const fx = subExpr(`(${linear})^2`, linear);
      return {
        templateId: "calc_derivative_advanced_basic_10",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner - p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner - a;
      const linear = texLinear(a, b);
      const fx = subExpr(`(${linear})^2`, linear);
      const tail = texConst(-a);
      return `
### この問題の解説
$$
f'(x)=2(${linear})\\cdot ${a}${tail ? ` ${tail}` : ""}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_11",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗 係数マイナス）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `-(${texLinear(params.a, params.b)})^2`;
      return {
        templateId: "calc_derivative_advanced_basic_11",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = -2 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = -2 * a * inner;
      return `
### この問題の解説
$$
f(x)=-(\\,${texLinear(a, b)}\\,)^2
$$
より
$$
f'(x)=-2(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_12",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗 係数マイナス）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `-(${texLinear(params.a, params.b)})^3`;
      return {
        templateId: "calc_derivative_advanced_basic_12",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = -3 * p.a * inner * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = -3 * a * inner * inner;
      return `
### この問題の解説
$$
f(x)=-(\\,${texLinear(a, b)}\\,)^3
$$
より
$$
f'(x)=-3(${texLinear(a, b)})^2\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_13",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗+係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `(${texLinear(params.a, params.b)})^2+2(${texLinear(params.a, params.b)})`;
      return {
        templateId: "calc_derivative_advanced_basic_13",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner + 2 * p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner + 2 * a;
      return `
### この問題の解説
$$
f'(x)=2(${texLinear(a, b)})\\cdot ${a}+2${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_14",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗+係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `(${texLinear(params.a, params.b)})^3+2(${texLinear(params.a, params.b)})`;
      return {
        templateId: "calc_derivative_advanced_basic_14",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 3 * p.a * inner * inner + 2 * p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 3 * a * inner * inner + 2 * a;
      return `
### この問題の解説
$$
f'(x)=3(${texLinear(a, b)})^2\\cdot ${a}+2${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_15",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗 係数 4）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `4(${texLinear(params.a, params.b)})^2`;
      return {
        templateId: "calc_derivative_advanced_basic_15",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 8 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 8 * a * inner;
      return `
### この問題の解説
$$
f'(x)=8(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_16",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗 係数 -2）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `-2(${texLinear(params.a, params.b)})^3`;
      return {
        templateId: "calc_derivative_advanced_basic_16",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = -6 * p.a * inner * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = -6 * a * inner * inner;
      return `
### この問題の解説
$$
f'(x)=-6(${texLinear(a, b)})^2\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_17",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗-係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `(${texLinear(params.a, params.b)})^2-5(${texLinear(params.a, params.b)})`;
      return {
        templateId: "calc_derivative_advanced_basic_17",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 2 * p.a * inner - 5 * p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 2 * a * inner - 5 * a;
      return `
### この問題の解説
$$
f'(x)=2(${texLinear(a, b)})\\cdot ${a}-5${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_18",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（3乗-係数）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(3);
      const fx = `(${texLinear(params.a, params.b)})^3-2(${texLinear(params.a, params.b)})`;
      return {
        templateId: "calc_derivative_advanced_basic_18",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 3 * p.a * inner * inner - 2 * p.a;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 3 * a * inner * inner - 2 * a;
      return `
### この問題の解説
$$
f'(x)=3(${texLinear(a, b)})^2\\cdot ${a}-2${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_19",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗+定数 2）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `5(${texLinear(params.a, params.b)})^2+1`;
      return {
        templateId: "calc_derivative_advanced_basic_19",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = 10 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = 10 * a * inner;
      return `
### この問題の解説
定数項の微分は 0 です。
$$
f'(x)=10(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_derivative_advanced_basic_20",
      topicId: "calc_derivative_advanced_basic",
      title: "合成関数の微分（2乗 係数 -3）",
      difficulty: 1,
      tags: ["calculus", "derivative", "chain"],
    },
    generate() {
      const params = buildParams(2);
      const fx = `-3(${texLinear(params.a, params.b)})^2+4`;
      return {
        templateId: "calc_derivative_advanced_basic_20",
        statement: `速度のモデルとして次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${fx}$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      const p = params as DerivParams;
      const inner = p.a * p.x0 + p.b;
      const value = -6 * p.a * inner;
      return gradeNumeric(userAnswer, value);
    },
    explain(params) {
      const { a, b, x0 } = params as DerivParams;
      const inner = a * x0 + b;
      const value = -6 * a * inner;
      return `
### この問題の解説
定数項の微分は 0 です。
$$
f'(x)=-6(${texLinear(a, b)})\\cdot ${a}
$$
したがって
$$
f'(${x0})=${value}
$$
答えは **${value}** です。
`;
    },
  },
  ...extraDerivativeTemplates,
];
