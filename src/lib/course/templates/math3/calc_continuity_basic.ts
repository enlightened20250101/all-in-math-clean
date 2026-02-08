// src/lib/course/templates/math3/calc_continuity_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear, texPoly2 } from "@/lib/format/tex";

type ContParams = {
  k: number;
  a: number;
  d: number;
  b: number;
  e: number;
  c: number;
};

type ContPatternParams = {
  k: number;
  c: number;
  leftValue: number;
  rightValue: number;
};

type ContPatternBuild = {
  params: ContPatternParams;
  leftTex: string;
  rightTex: string;
};

function buildParams(): ContParams {
  const k = pick([-2, -1, 0, 1, 2]);
  const a = pick([1, 2, 3, -1, -2]);
  const d = pick([1, 2, 3, -1, -2]);
  const c = randInt(-5, 5);
  const b = c - a * k;
  const e = c - d * k;
  return { k, a, d, b, e, c };
}

function buildLinearPiece(k: number) {
  const a = pick([1, 2, 3, -1, -2]);
  const b = randInt(-5, 5);
  return { a, b, value: a * k + b, tex: texLinear(a, b) };
}

function buildQuadraticPiece(k: number) {
  const a = pick([1, 2, -1, -2, 3, -3]);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  return { a, b, c, value: a * k * k + b * k + c, tex: texPoly2(a, b, c) };
}

function buildContinuityPattern(kind: number): ContPatternBuild {
  const k = pick([-2, -1, 0, 1, 2, 3]);
  if (kind === 0) {
    const left = buildLinearPiece(k);
    const d = pick([1, 2, -1, -2, 3]);
    const e = left.value - d * k;
    const right = { tex: texLinear(d, e), value: d * k + e };
    return {
      params: { k, c: left.value, leftValue: left.value, rightValue: right.value },
      leftTex: left.tex,
      rightTex: right.tex,
    };
  }
  if (kind === 1) {
    const left = buildLinearPiece(k);
    const q = buildQuadraticPiece(k);
    const rightC = left.value - q.a * k * k - q.b * k;
    const rightTex = texPoly2(q.a, q.b, rightC);
    return {
      params: { k, c: left.value, leftValue: left.value, rightValue: left.value },
      leftTex: left.tex,
      rightTex,
    };
  }
  if (kind === 2) {
    const left = buildQuadraticPiece(k);
    const d = pick([1, 2, -1, -2, 3]);
    const e = left.value - d * k;
    const rightTex = texLinear(d, e);
    return {
      params: { k, c: left.value, leftValue: left.value, rightValue: left.value },
      leftTex: left.tex,
      rightTex,
    };
  }
  const left = buildQuadraticPiece(k);
  const q = buildQuadraticPiece(k);
  const rightC = left.value - q.a * k * k - q.b * k;
  const rightTex = texPoly2(q.a, q.b, rightC);
  return {
    params: { k, c: left.value, leftValue: left.value, rightValue: left.value },
    leftTex: left.tex,
    rightTex,
  };
}

const extraContinuityTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 4;
  const templateId = `calc_continuity_basic_${idx + 7}`;
  const title =
    kind === 0 ? "連続条件（線形×線形）" :
    kind === 1 ? "連続条件（線形×二次）" :
    kind === 2 ? "連続条件（二次×線形）" :
    "連続条件（二次×二次）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_continuity_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const built = buildContinuityPattern(kind);
      const { params, leftTex, rightTex } = built;
      const { k } = params;
      return {
        templateId,
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${leftTex} & (x<${k})\\\\\\\\\n c & (x=${k})\\\\\\\\\n ${rightTex} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContPatternParams).c);
    },
    explain(params) {
      const { k, leftValue, rightValue, c } = params as ContPatternParams;
      return `
### この問題の解説
連続になるためには
$$
\\lim_{x\\\to ${k}-} f(x) = f(${k}) = \\lim_{x\\\to ${k}+} f(x)
$$
が必要です。左右の値は ${leftValue} と ${rightValue} なので、
$$
c = ${c}
$$
答えは **${c}** です。
`;
    },
  };
});

const extraContinuityTemplates2: QuestionTemplate[] = Array.from({ length: 30 }, (_, idx) => {
  const kind = idx % 4;
  const templateId = `calc_continuity_basic_${idx + 37}`;
  const title =
    kind === 0 ? "連続条件（線形×線形・入れ替え）" :
    kind === 1 ? "連続条件（線形×二次・入れ替え）" :
    kind === 2 ? "連続条件（二次×線形・入れ替え）" :
    "連続条件（二次×二次・入れ替え）";

  return {
    meta: {
      id: templateId,
      topicId: "calc_continuity_basic",
      title,
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const built = buildContinuityPattern(kind);
      const { params, leftTex, rightTex } = built;
      const { k } = params;
      return {
        templateId,
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${rightTex} & (x<${k})\\\\\\\\\n c & (x=${k})\\\\\\\\\n ${leftTex} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContPatternParams).c);
    },
    explain(params) {
      const { k, leftValue, rightValue, c } = params as ContPatternParams;
      return `
### この問題の解説
連続になるためには
$$
\\lim_{x\\\to ${k}-} f(x) = f(${k}) = \\lim_{x\\\to ${k}+} f(x)
$$
が必要です。左右の値は ${rightValue} と ${leftValue} なので、
$$
c = ${c}
$$
答えは **${c}** です。
`;
    },
  };
});

export const calcContinuityBasicTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "calc_continuity_basic_1",
      topicId: "calc_continuity_basic",
      title: "連続条件（一次関数）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_1",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\begin{cases}
 ${left} & (x<${k})\\\\
 c & (x=${k})\\\\
 ${right} & (x>${k})
 \end{cases}
$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, d, e, c } = params as ContParams;
      const leftValue = a * k + b;
      const rightValue = d * k + e;
      return `
### この問題の解説
連続になるためには
$$
\lim_{x\\\to ${k}-} f(x) = f(${k}) = \lim_{x\\\to ${k}+} f(x)
$$
が必要です。左側の値は ${leftValue}、右側の値は ${rightValue} なので、
$$
c = ${c}
$$
答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_2",
      topicId: "calc_continuity_basic",
      title: "連続条件（別パターン）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_2",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\begin{cases}
 ${left} & (x<${k})\\\\
 c & (x=${k})\\\\
 ${right} & (x>${k})
 \end{cases}
$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ の左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_3",
      topicId: "calc_continuity_basic",
      title: "連続条件（別パターン 2）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_3",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x<${k})\\\\\\\\\n c & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const leftValue = a * k + b;
      return `
### この問題の解説
連続になるためには
$$
${leftValue} = c
$$
が必要です。よって $c=${c}$ です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_4",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 1）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_4",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x<${k})\\\\\\\\\n c & (x=${k})\\\\\\\\\n ${right} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ で左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_5",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 2）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_5",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${right} & (x<${k})\\\\\\\\\n c & (x=${k})\\\\\\\\\n ${left} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ で左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_6",
      topicId: "calc_continuity_basic",
      title: "連続条件（cの決定 3）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_6",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n c & (x<${k})\\\\\\\\\n ${left} & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const rightValue = a * k + b;
      return `
### この問題の解説
連続であるためには左側の定数が右側の値に等しい必要があります。
$$
c = ${rightValue}
$$
答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_7",
      topicId: "calc_continuity_basic",
      title: "連続条件（cの決定 4）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_7",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x\\le ${k})\\\\\\\\\n c & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const leftValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
${leftValue} = c
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_8",
      topicId: "calc_continuity_basic",
      title: "連続条件（cの決定 5）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_8",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n c & (x<${k})\\\\\\\\\n ${left} & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const rightValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_9",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 3）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_9",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x<${k})\\\\\\\\\n ${right} & (x>${k})\\\\\\\\\n c & (x=${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ で左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_10",
      topicId: "calc_continuity_basic",
      title: "連続条件（cの決定 6）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, d, e } = params;
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_10",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n c & (x\\le ${k})\\\\\\\\\n ${right} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, d, e, c } = params as ContParams;
      const rightValue = d * k + e;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_11",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 4）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_11",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\\begin{cases}\n ${left} & (x\\le ${k})\\\\\\\\\n c & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const leftValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
${leftValue} = c
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_12",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 5）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, d, e } = params;
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_12",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\\begin{cases}\n c & (x<${k})\\\\\\\\\n ${right} & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, d, e, c } = params as ContParams;
      const rightValue = d * k + e;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_13",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 6）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, d, e } = params;
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_13",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\\begin{cases}\n ${right} & (x\\le ${k})\\\\\\\\\n c & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, d, e, c } = params as ContParams;
      const leftValue = d * k + e;
      return `
### この問題の解説
連続であるためには
$$
${leftValue} = c
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_14",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 7）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_14",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\n\n$$\n f(x)=\\begin{cases}\n c & (x\\le ${k})\\\\\\\\\n ${left} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const rightValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_15",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 8）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_15",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x<${k})\\\\\\\\\n ${right} & (x>${k})\\\\\\\\\n c & (x=${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ で左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_16",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 9）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b, d, e } = params;
      const left = texLinear(a, b);
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_16",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${right} & (x<${k})\\\\\\\\\n ${left} & (x>${k})\\\\\\\\\n c & (x=${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, c } = params as ContParams;
      return `
### この問題の解説
$x=${k}$ で左右極限が一致する値が $c$ です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_17",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 10）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_17",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${left} & (x<${k})\\\\\\\\\n c & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const leftValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
${leftValue} = c
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_18",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 11）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, d, e } = params;
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_18",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n c & (x\\le ${k})\\\\\\\\\n ${right} & (x>${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, d, e, c } = params as ContParams;
      const rightValue = d * k + e;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_19",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 12）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, d, e } = params;
      const right = texLinear(d, e);
      return {
        templateId: "calc_continuity_basic_19",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n ${right} & (x<${k})\\\\\\\\\n c & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, d, e, c } = params as ContParams;
      const leftValue = d * k + e;
      return `
### この問題の解説
連続であるためには
$$
${leftValue} = c
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  {
    meta: {
      id: "calc_continuity_basic_20",
      topicId: "calc_continuity_basic",
      title: "連続条件（左右一致 13）",
      difficulty: 1,
      tags: ["calculus", "continuity"],
    },
    generate() {
      const params = buildParams();
      const { k, a, b } = params;
      const left = texLinear(a, b);
      return {
        templateId: "calc_continuity_basic_20",
        statement: `水温の変化を分けて表した関数とする。$x=${k}$ で連続となるように $c$ を求めよ。\\n\\n$$\\n f(x)=\\begin{cases}\n c & (x<${k})\\\\\\\\\n ${left} & (x\\ge ${k})\n \\end{cases}\n$$`,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ContParams).c);
    },
    explain(params) {
      const { k, a, b, c } = params as ContParams;
      const rightValue = a * k + b;
      return `
### この問題の解説
連続であるためには
$$
c = ${rightValue}
$$
が必要です。答えは **${c}** です。
`;
    },
  },
  ...extraContinuityTemplates,
  ...extraContinuityTemplates2,
];
