// src/lib/course/templates/math1/algebra_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texEquation, texInequality, texLinear, texPoly2 } from "@/lib/format/tex";

/**
 * 方針:
 * - answerKind: numeric のみ
 * - gradeNumeric は完全一致なので、原則「整数が答え」になるよう生成
 * - “式そのもの”ではなく、代入値/解/最小整数解などで安定採点
 */

export const algebraTemplates: QuestionTemplate[] = [
  // -----------------------------
  // 展開: (ax+b)(cx+d) を展開して x=k を代入した値
  // -----------------------------
  {
    meta: {
      id: "alg_expand_eval_1",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=1）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3]);
      const b = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const c = pick([1, 2, 3]);
      const d = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);

      // 代入は固定で 1（採点が安定）
      const k = 1;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_1",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
まず $x=${k}$ を代入してから計算してもOKです（値を聞いているため）。

$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_eval_2",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=2）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const k = 2;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_2",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
値だけを求めるので、先に代入して計算してもOKです。

$$
x=${k}\\Rightarrow (${left})=(${A}),\\quad
(${right})=(${B})
$$

$$
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_eval_3",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=3）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const k = 3;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_3",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
まず $x=${k}$ を代入します。

$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_eval_neg1",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=-1）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const c = pick([1, 2, 3]);
      const d = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);

      const k = -1;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_neg1",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_eval_zero",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=0）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3, 4]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const k = 0;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_zero",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_eval_neg2",
      topicId: "algebra_expand_basic",
      title: "展開して代入値（x=-2）",
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const k = -2;

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      return {
        templateId: "alg_expand_eval_neg2",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params;
      const val = (a * k + b) * (c * k + d);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, c, d, k } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_square_eval_1",
      topicId: "algebra_expand_basic",
      title: "平方の展開と代入 1",
      difficulty: 1,
      tags: ["expand", "square", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3]);
      const b = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = 1;

      const factor = texLinear(a, b);

      return {
        templateId: "alg_expand_square_eval_1",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${factor})^2$$`,
        answerKind: "numeric",
        params: { a, b, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, k } = params;
      const val = (a * k + b) ** 2;
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, k } = params;
      const factor = texLinear(a, b);
      const A = a * k + b;
      const ans = A * A;
      return `
### この問題の解説
$$
(${factor})^2
\\xrightarrow{x=${k}}
(${A})^2=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_square_eval_2",
      topicId: "algebra_expand_basic",
      title: "平方の展開と代入 2",
      difficulty: 1,
      tags: ["expand", "square", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = -1;

      const factor = texLinear(a, b);

      return {
        templateId: "alg_expand_square_eval_2",
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${factor})^2$$`,
        answerKind: "numeric",
        params: { a, b, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, k } = params;
      const val = (a * k + b) ** 2;
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { a, b, k } = params;
      const factor = texLinear(a, b);
      const A = a * k + b;
      const ans = A * A;
      return `
### この問題の解説
$$
(${factor})^2
\\xrightarrow{x=${k}}
(${A})^2=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_expand_coeff_x_1",
      topicId: "algebra_expand_basic",
      title: "展開後のx係数",
      difficulty: 1,
      tags: ["expand", "coeff"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      const A = a * c;
      const B = a * d + b * c;
      const C = b * d;

      return {
        templateId: "alg_expand_coeff_x_1",
        statement: `次を展開したときの $x$ の係数を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, A, B, C },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.B);
    },
    explain(params) {
      const { a, b, c, d, A, B, C } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const expanded = texPoly2(A, B, C);
      return `
### この問題の解説
$$
(${left})(${right})=${expanded}
$$
よって $x$ の係数は ${B} です。
`;
    },
  },
  {
    meta: {
      id: "alg_expand_const_term_1",
      topicId: "algebra_expand_basic",
      title: "展開後の定数項",
      difficulty: 1,
      tags: ["expand", "constant"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3, 4]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const left = texLinear(a, b);
      const right = texLinear(c, d);

      const A = a * c;
      const B = a * d + b * c;
      const C = b * d;

      return {
        templateId: "alg_expand_const_term_1",
        statement: `次を展開したときの定数項を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, A, B, C },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.C);
    },
    explain(params) {
      const { a, b, c, d, A, B, C } = params;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const expanded = texPoly2(A, B, C);
      return `
### この問題の解説
$$
(${left})(${right})=${expanded}
$$
よって定数項は ${C} です。
`;
    },
  },

  // -----------------------------
  // 因数分解: (x+p)(x+q) 型の多項式の「値」を答えさせる
  // （因数分解そのものを入力させず、代入値で安定採点）
  // -----------------------------
  {
    meta: {
      id: "alg_factor_eval_1",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=1）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const q = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = 1;

      // 展開形を出す
      // x^2 + (p+q)x + pq
      const b = p + q;
      const c = p * q;

      const poly = texPoly2(1, b, c);

      return {
        templateId: "alg_factor_eval_1",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const ans = (k + p) * (k + q);
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      return `
### この問題の解説
与式は
$$
${poly}=(${f1})(${f2})
$$
よって $x=${k}$ を代入すると
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_2",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=2）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const q = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = 2;

      const b = p + q;
      const c = p * q;

      const poly = texPoly2(1, b, c);

      return {
        templateId: "alg_factor_eval_2",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const ans = (k + p) * (k + q);
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      return `
### この問題の解説
与式は
$$
${poly}=(${f1})(${f2})
$$
なので、$x=${k}$ を代入して
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_3",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=0）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const q = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = 0;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_3",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_4",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=-1）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const q = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = -1;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_4",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_5",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=-2）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const q = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = -2;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_5",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_6",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=3）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const q = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = 3;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_6",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_7",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=4）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const q = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const k = 4;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_7",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_8",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=5）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const q = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = 5;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_8",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_9",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=6）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const q = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const k = 6;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_9",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_factor_eval_10",
      topicId: "algebra_factor_basic",
      title: "因数分解できる式の代入値（x=-3）",
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const q = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const k = -3;

      const poly = texPoly2(1, p + q, p * q);

      return {
        templateId: "alg_factor_eval_10",
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$
${poly}
$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params;
      const val = (k + p) * (k + q);
      return gradeNumeric(userAnswer, val);
    },
    explain(params) {
      const { p, q, k } = params;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  },

  // -----------------------------
  // 一次方程式: ax+b = cx+d の解（整数になるよう生成）
  // -----------------------------
  {
    meta: {
      id: "alg_linear_eq_int_1",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）1",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      // 先に解 x を決めて、係数を組み立てる（必ず整数解）
      const x = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);

      const a = pick([1, 2, 3, 4]);
      const c = pick([0, 1, 2, 3]); // 左右の差を作る
      const b = randInt(-10, 10);
      const d = a * x + b - c * x; // ax+b = cx+d を満たすように調整

      return {
        templateId: "alg_linear_eq_int_1",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
移項して $x$ をまとめます。

$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },      
  },
  {
    meta: {
      id: "alg_linear_eq_int_2",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）2",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);

      const a = pick([2, 3, 4, 5]);
      const c = pick([0, 1, 2, 3, 4]);
      const b = randInt(-12, 12);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_2",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },      
  },
  {
    meta: {
      id: "alg_linear_eq_int_3",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）3",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const a = pick([-4, -3, -2, 2, 3, 4]);
      let c = pick([-3, -2, -1, 0, 1, 2, 3]);
      while (a === c) {
        c = pick([-3, -2, -1, 0, 1, 2, 3]);
      }
      const b = randInt(-10, 10);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_3",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_4",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）4",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const a = pick([2, 3, 4, 5]);
      let c = pick([-4, -3, -2, -1, 0, 1, 2]);
      while (a === c) {
        c = pick([-4, -3, -2, -1, 0, 1, 2]);
      }
      const b = randInt(-12, 12);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_4",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_5",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）5",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const a = pick([2, 3, 4, 5, 6]);
      const c = 0;
      const b = randInt(-10, 10);
      const d = a * x + b;

      return {
        templateId: "alg_linear_eq_int_5",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_6",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）6",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const a = 0;
      const c = pick([2, 3, 4, 5, 6]);
      const b = randInt(-10, 10);
      const d = b - c * x;

      return {
        templateId: "alg_linear_eq_int_6",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_7",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）7",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      const k = pick([2, 3, 4, 5]);
      const a = pick([k + 1, k + 2, k + 3]);
      const c = a - k;
      const b = randInt(-8, 8);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_7",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_8",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）8",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]);
      const a = pick([3, 4, 5, 6]);
      let c = pick([0, 1, 2]);
      while (a === c) {
        c = pick([0, 1, 2]);
      }
      const b = randInt(-14, 14);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_8",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },
  {
    meta: {
      id: "alg_linear_eq_int_9",
      topicId: "algebra_linear_eq_basic",
      title: "一次方程式（整数解）9",
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-8, -6, -4, -2, 2, 4, 6, 8]);
      const a = pick([2, 4, 6]);
      let c = pick([-3, -2, -1, 0, 1]);
      while (a === c) {
        c = pick([-3, -2, -1, 0, 1]);
      }
      const b = randInt(-12, 12);
      const d = a * x + b - c * x;

      return {
        templateId: "alg_linear_eq_int_9",
        statement: `次の方程式を解け。\n\n$$
${texEquation(a, b, c, d)}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, d, x } = params;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  },

  // -----------------------------
  // 不等式: ax+b > cx+d の最小の整数解
  // -----------------------------
  {
    meta: {
      id: "alg_ineq_min_int_1",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最小整数解 1",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      // 先に「解が x > t になる」形にして、最小整数解は t+1
      // (a-c)x > d-b で、(a-c)>0 にして t=(d-b)/(a-c) を整数にする
      const k = pick([1, 2, 3, 4]); // a-c
      const t = pick([-3, -2, -1, 0, 1, 2, 3]); // 境界を整数に
      const minInt = t + 1;

      const a = pick([k + 1, k + 2, k + 3]);
      const c = a - k;

      const b = randInt(-8, 8);
      // (a-c)x + b > cx + d ではなく、a x + b > c x + d
      // 条件: k*x > d-b で、境界 t を作るため d-b = k*t
      const d = b + k * t;

      return {
        templateId: "alg_ineq_min_int_1",
        statement: `次の不等式を満たす **最小の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, ">")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, minInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, minInt } = params;
      const ineq = texInequality(a, b, c, d, ">");
      const reduced = texInequality(a - c, 0, 0, d - b, ">");
      const bound = texInequality(1, 0, 0, t, ">");
      return `
### この問題の解説
移項して $x$ をまとめます。

$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, ">")}
\\Rightarrow ${bound}
$$

したがって最小の整数解は $x=${minInt}$ です。
`;
    },      
  },
  {
    meta: {
      id: "alg_ineq_min_int_2",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最小整数解 2",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([1, 2, 3, 4, 5]); // a-c
      const t = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
      const minInt = t + 1;

      const a = pick([k + 2, k + 3, k + 4, k + 5]);
      const c = a - k;

      const b = randInt(-10, 10);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_min_int_2",
        statement: `次の不等式を満たす **最小の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, ">")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, minInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, minInt } = params;
      const ineq = texInequality(a, b, c, d, ">");
      const reduced = texInequality(a - c, 0, 0, d - b, ">");
      const bound = texInequality(1, 0, 0, t, ">");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, ">")}
\\Rightarrow ${bound}
$$

最小の整数解は $x=${minInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_min_int_ge_1",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最小整数解（>=）1",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([1, 2, 3, 4]);
      const t = pick([-3, -2, -1, 0, 1, 2, 3]);
      const minInt = t;

      const a = pick([k + 1, k + 2, k + 3]);
      const c = a - k;
      const b = randInt(-8, 8);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_min_int_ge_1",
        statement: `次の不等式を満たす **最小の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, ">=")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, minInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, minInt } = params;
      const ineq = texInequality(a, b, c, d, ">=");
      const reduced = texInequality(a - c, 0, 0, d - b, ">=");
      const bound = texInequality(1, 0, 0, t, ">=");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, ">=")}
\\Rightarrow ${bound}
$$

最小の整数解は $x=${minInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_min_int_ge_2",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最小整数解（>=）2",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([2, 3, 4, 5]);
      const t = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
      const minInt = t;

      const a = pick([k + 2, k + 3, k + 4]);
      const c = a - k;
      const b = randInt(-10, 10);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_min_int_ge_2",
        statement: `次の不等式を満たす **最小の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, ">=")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, minInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, minInt } = params;
      const ineq = texInequality(a, b, c, d, ">=");
      const reduced = texInequality(a - c, 0, 0, d - b, ">=");
      const bound = texInequality(1, 0, 0, t, ">=");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, ">=")}
\\Rightarrow ${bound}
$$

最小の整数解は $x=${minInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_max_int_lt_1",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最大整数解（<）1",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([1, 2, 3, 4]);
      const t = pick([-3, -2, -1, 0, 1, 2, 3]);
      const maxInt = t - 1;

      const a = pick([k + 1, k + 2, k + 3]);
      const c = a - k;
      const b = randInt(-8, 8);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_max_int_lt_1",
        statement: `次の不等式を満たす **最大の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, "<")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, maxInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.maxInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, maxInt } = params;
      const ineq = texInequality(a, b, c, d, "<");
      const reduced = texInequality(a - c, 0, 0, d - b, "<");
      const bound = texInequality(1, 0, 0, t, "<");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, "<")}
\\Rightarrow ${bound}
$$

最大の整数解は $x=${maxInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_max_int_lt_2",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最大整数解（<）2",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([2, 3, 4, 5]);
      const t = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
      const maxInt = t - 1;

      const a = pick([k + 2, k + 3, k + 4]);
      const c = a - k;
      const b = randInt(-10, 10);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_max_int_lt_2",
        statement: `次の不等式を満たす **最大の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, "<")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, maxInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.maxInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, maxInt } = params;
      const ineq = texInequality(a, b, c, d, "<");
      const reduced = texInequality(a - c, 0, 0, d - b, "<");
      const bound = texInequality(1, 0, 0, t, "<");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, "<")}
\\Rightarrow ${bound}
$$

最大の整数解は $x=${maxInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_max_int_le_1",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最大整数解（<=）1",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([1, 2, 3, 4]);
      const t = pick([-3, -2, -1, 0, 1, 2, 3]);
      const maxInt = t;

      const a = pick([k + 1, k + 2, k + 3]);
      const c = a - k;
      const b = randInt(-8, 8);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_max_int_le_1",
        statement: `次の不等式を満たす **最大の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, "<=")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, maxInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.maxInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, maxInt } = params;
      const ineq = texInequality(a, b, c, d, "<=");
      const reduced = texInequality(a - c, 0, 0, d - b, "<=");
      const bound = texInequality(1, 0, 0, t, "<=");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, "<=")}
\\Rightarrow ${bound}
$$

最大の整数解は $x=${maxInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_max_int_le_2",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最大整数解（<=）2",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([2, 3, 4, 5]);
      const t = pick([-4, -3, -2, -1, 0, 1, 2, 3, 4]);
      const maxInt = t;

      const a = pick([k + 2, k + 3, k + 4]);
      const c = a - k;
      const b = randInt(-10, 10);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_max_int_le_2",
        statement: `次の不等式を満たす **最大の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, "<=")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, maxInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.maxInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, maxInt } = params;
      const ineq = texInequality(a, b, c, d, "<=");
      const reduced = texInequality(a - c, 0, 0, d - b, "<=");
      const bound = texInequality(1, 0, 0, t, "<=");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, "<=")}
\\Rightarrow ${bound}
$$

最大の整数解は $x=${maxInt}$ です。
`;
    },
  },
  {
    meta: {
      id: "alg_ineq_min_int_gt_3",
      topicId: "algebra_ineq_basic",
      title: "一次不等式の最小整数解（>）3",
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([2, 3, 4, 5]);
      const t = pick([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
      const minInt = t + 1;

      const a = pick([k + 2, k + 3, k + 4]);
      const c = a - k;
      const b = randInt(-10, 10);
      const d = b + k * t;

      return {
        templateId: "alg_ineq_min_int_gt_3",
        statement: `次の不等式を満たす **最小の整数** $x$ を答えよ。\n\n$$
${texInequality(a, b, c, d, ">")}
$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, minInt },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minInt);
    },
    explain(params) {
      const { a, b, c, d, k, t, minInt } = params;
      const ineq = texInequality(a, b, c, d, ">");
      const reduced = texInequality(a - c, 0, 0, d - b, ">");
      const bound = texInequality(1, 0, 0, t, ">");
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, ">")}
\\Rightarrow ${bound}
$$

最小の整数解は $x=${minInt}$ です。
`;
    },
  },
  // -----------------------------
  // 文章題: 一次方程式（数量関係）
  // -----------------------------
  {
    meta: {
      id: "alg_linear_word_1",
      topicId: "algebra_linear_eq_basic",
      title: "数量関係の文章題",
      difficulty: 1,
      tags: ["linear_eq", "word"],
    },
    generate() {
      const x = randInt(-2, 8);
      const a = pick([2, 3, 4]);
      const b = pick([3, 4, 5, 6]);
      const c = a * (x + b);
      return {
        templateId: "alg_linear_word_1",
        statement:
          `ある数に ${b} を足して ${a} 倍すると ${c} になる。` +
          `その数を求めよ。`,
        answerKind: "numeric",
        params: { x, a, b, c },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.x);
    },
    explain(params) {
      const { a, b, c, x } = params;
      return `
### この問題の解説
「ある数」を $x$ とおくと
$$
${a}(x+${b})=${c}
$$
より $x=${x}$。
`;
    },
  },
  // -----------------------------
  // 因数分解と解: (x-a)(x-b)=0 の解の選択
  // -----------------------------
  {
    meta: {
      id: "alg_factor_root_1",
      topicId: "algebra_factor_basic",
      title: "因数分解と解の選択",
      difficulty: 1,
      tags: ["factor", "root"],
    },
    generate() {
      const a = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
      let b = pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      if (b === a) b = a + 1;
      const bigger = Math.max(a, b);
      return {
        templateId: "alg_factor_root_1",
        statement: `次の方程式の解のうち、大きい方を答えよ。\n\n$$ (x-${a})(x-${b})=0 $$`,
        answerKind: "numeric",
        params: { a, b, bigger },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.bigger);
    },
    explain(params) {
      const { a, b, bigger } = params;
      return `
### この問題の解説
$(x-${a})(x-${b})=0$ より解は $x=${a},${b}$。
大きい方は $${bigger}$$。
`;
    },
  },
  // -----------------------------
  // 不等式: 最小の整数
  // -----------------------------
  {
    meta: {
      id: "alg_ineq_min_int_1",
      topicId: "algebra_ineq_basic",
      title: "不等式の最小整数",
      difficulty: 1,
      tags: ["inequality", "min_int"],
    },
    generate() {
      const a = pick([2, 3, 4, 5]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
      const c = pick([1, 2, 3, 4, 5]);
      // ax + b >= c の最小整数解
      const minX = Math.ceil((c - b) / a);
      const left = texLinear(a, b);
      const right = String(c);
      return {
        templateId: "alg_ineq_min_int_1",
        statement: `次の不等式を満たす $x$ の最小の整数を求めよ。\n\n$$ ${texInequality(left, "\\\\ge", right)} $$`,
        answerKind: "numeric",
        params: { a, b, c, minX },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.minX);
    },
    explain(params) {
      const { a, b, c, minX } = params;
      return `
### この問題の解説
$$
${a}x+${b} \\ge ${c}
\\Rightarrow x \\ge ${((c - b) / a).toFixed(2)}
$$
よって最小の整数は $${minX}$$。
`;
    },
  },
];

const extraLinearEqTemplates: QuestionTemplate[] = Array.from({ length: 41 }, (_, idx) => {
  const id = `alg_linear_eq_extra_${idx + 1}`;
  return {
    meta: {
      id,
      topicId: "algebra_linear_eq_basic",
      title: `一次方程式（追加）${idx + 1}`,
      difficulty: 1,
      tags: ["linear", "equation"],
    },
    generate() {
      const x = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const a = pick([-4, -3, -2, 2, 3, 4]);
      let c = pick([-3, -2, -1, 0, 1, 2, 3]);
      while (a === c) {
        c = pick([-3, -2, -1, 0, 1, 2, 3]);
      }
      const b = randInt(-10, 10);
      const d = a * x + b - c * x;
      return {
        templateId: id,
        statement: `次の方程式を解け。\n\n$$\n${texEquation(a, b, c, d)}\n$$`,
        answerKind: "numeric",
        params: { a, b, c, d, x },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).x);
    },
    explain(params) {
      const { a, b, c, d, x } = params as any;
      const eq = texEquation(a, b, c, d);
      const reduced = texEquation(a - c, 0, 0, d - b);
      const solved = texEquation(1, 0, 0, x);
      return `
### この問題の解説
$$
${eq}
\\Rightarrow ${reduced}
$$

$$
${solved}
$$
`;
    },
  };
});

const extraIneqTemplates: QuestionTemplate[] = Array.from({ length: 41 }, (_, idx) => {
  const id = `alg_ineq_extra_${idx + 1}`;
  const isGreater = idx % 2 === 0;
  return {
    meta: {
      id,
      topicId: "algebra_ineq_basic",
      title: `一次不等式（追加）${idx + 1}`,
      difficulty: 1,
      tags: ["inequality", "integer"],
    },
    generate() {
      const k = pick([1, 2, 3, 4, 5]);
      const t = pick([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
      const a = pick([k + 1, k + 2, k + 3, k + 4]);
      const c = a - k;
      const b = randInt(-10, 10);
      const d = b + k * t;
      const sign = isGreater ? ">" : "<";
      const signNum = isGreater ? 1 : -1;
      const target = isGreater ? t + 1 : t - 1;
      return {
        templateId: id,
        statement: `次の不等式を満たす **${isGreater ? "最小" : "最大"}の整数** $x$ を答えよ。\n\n$$\n${texInequality(a, b, c, d, sign)}\n$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k, t, target, sign: signNum },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as any).target);
    },
    explain(params) {
      const { a, b, c, d, k, t, target, sign } = params as any;
      const signStr = sign > 0 ? ">" : "<";
      const ineq = texInequality(a, b, c, d, signStr);
      const reduced = texInequality(a - c, 0, 0, d - b, signStr);
      const bound = texInequality(1, 0, 0, t, signStr);
      return `
### この問題の解説
$$
${ineq}
\\Rightarrow ${reduced}
$$

$$
${texInequality(k, 0, 0, k * t, signStr)}
\\Rightarrow ${bound}
$$

答えは $x=${target}$ です。
`;
    },
  };
});

const extraExpandTemplates: QuestionTemplate[] = Array.from({ length: 40 }, (_, idx) => {
  const id = `alg_expand_extra_${idx + 1}`;
  const k = pick([-2, -1, 1, 2, 3]);
  return {
    meta: {
      id,
      topicId: "algebra_expand_basic",
      title: `展開して代入値（追加）${idx + 1}`,
      difficulty: 1,
      tags: ["expand", "eval"],
    },
    generate() {
      const a = pick([1, 2, 3, 4]);
      const b = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const c = pick([1, 2, 3, 4]);
      const d = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      return {
        templateId: id,
        statement: `次を展開し、$x=${k}$ を代入した値を答えよ。\n\n$$(${left})(${right})$$`,
        answerKind: "numeric",
        params: { a, b, c, d, k },
      };
    },
    grade(params, userAnswer) {
      const { a, b, c, d, k } = params as any;
      return gradeNumeric(userAnswer, (a * k + b) * (c * k + d));
    },
    explain(params) {
      const { a, b, c, d, k } = params as any;
      const left = texLinear(a, b);
      const right = texLinear(c, d);
      const A = a * k + b;
      const B = c * k + d;
      const ans = A * B;
      return `
### この問題の解説
$$
(${left})(${right})
\\xrightarrow{x=${k}}
(${A})(${B})=${ans}
$$
`;
    },
  };
});

const extraFactorTemplates: QuestionTemplate[] = Array.from({ length: 40 }, (_, idx) => {
  const id = `alg_factor_extra_${idx + 1}`;
  const k = pick([-3, -2, -1, 1, 2, 3]);
  return {
    meta: {
      id,
      topicId: "algebra_factor_basic",
      title: `因数分解できる式の代入値（追加）${idx + 1}`,
      difficulty: 1,
      tags: ["factor", "eval"],
    },
    generate() {
      const p = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const q = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const poly = texPoly2(1, p + q, p * q);
      return {
        templateId: id,
        statement: `次の式は因数分解できます。$x=${k}$ を代入した値を答えよ。\n\n$$\n${poly}\n$$`,
        answerKind: "numeric",
        params: { p, q, k },
      };
    },
    grade(params, userAnswer) {
      const { p, q, k } = params as any;
      return gradeNumeric(userAnswer, (k + p) * (k + q));
    },
    explain(params) {
      const { p, q, k } = params as any;
      const poly = texPoly2(1, p + q, p * q);
      const f1 = texLinear(1, p);
      const f2 = texLinear(1, q);
      const ans = (k + p) * (k + q);
      return `
### この問題の解説
$$
${poly}=(${f1})(${f2})
$$
$$
(${f1})(${f2})\\Big|_{x=${k}}=(${k + p})(${k + q})=${ans}
$$
`;
    },
  };
});

algebraTemplates.push(
  ...extraLinearEqTemplates,
  ...extraIneqTemplates,
  ...extraExpandTemplates,
  ...extraFactorTemplates
);
