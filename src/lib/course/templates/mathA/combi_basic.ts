// src/lib/course/templates/mathA/combi_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  const kk = Math.min(k, n - k);
  for (let i = 1; i <= kk; i += 1) {
    res = (res * (n - kk + i)) / i;
  }
  return Math.round(res);
}

function perm(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let res = 1;
  for (let i = 0; i < k; i += 1) {
    res *= n - i;
  }
  return res;
}

function buildCombTemplate(id: string, title: string, k: number): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "combi_basic",
      title,
      difficulty: 1,
      tags: ["combination"],
    },
    generate() {
      const n = k === 3 ? pick([5, 6, 7, 8, 9, 10, 11]) : pick([6, 7, 8, 9, 10, 11, 12]);
      return {
        templateId: id,
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $${k}$ 個を選ぶ方法は何通りですか。`,
        answerKind: "numeric",
        params: { n, k },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      return gradeNumeric(userAnswer, comb(n, k));
    },
    explain(params) {
      const n = params.n;
      const ans = comb(n, k);
      return `
### この問題の解説
組合せなので $\\binom{${n}}{${k}}$。

$$
\\binom{${n}}{${k}}=${ans}
$$
`;
    },
  };
}

function buildPermTemplate(id: string, title: string, k: number): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "combi_basic",
      title,
      difficulty: 1,
      tags: ["permutation"],
    },
    generate() {
      const n = pick([5, 6, 7, 8, 9, 10, 11, 12]);
      return {
        templateId: id,
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $${k}$ 個を選んで順に並べる方法は何通りですか。`,
        answerKind: "numeric",
        params: { n, k },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      return gradeNumeric(userAnswer, perm(n, k));
    },
    explain(params) {
      const n = params.n;
      const ans = perm(n, k);
      return `
### この問題の解説
順序を区別するので順列 ${n}P${k} です。

$$
${n}P${k}=${ans}
$$
`;
    },
  };
}

function buildSumRuleTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "combi_basic",
      title,
      difficulty: 1,
      tags: ["rule"],
    },
    generate() {
      const a = randInt(3, 9);
      const b = randInt(3, 9);
      return {
        templateId: id,
        statement: `Aの選び方が ${a} 通り、Bの選び方が ${b} 通りある。AまたはBを選ぶとき、全体で何通りですか（重なりなし）。`,
        answerKind: "numeric",
        params: { a, b },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.a + params.b);
    },
    explain(params) {
      const ans = params.a + params.b;
      return `
### この問題の解説
AとBは重ならないので和の法則です。

$$
${params.a}+${params.b}=${ans}
$$
`;
    },
  };
}

const baseTemplates: QuestionTemplate[] = [
  {
    meta: {
      id: "combi_nC2_1",
      topicId: "combi_basic",
      title: "nC2",
      difficulty: 1,
      tags: ["combination"],
    },
    generate() {
      const n = pick([4, 5, 6, 7, 8, 9, 10, 12]);
      return {
        templateId: "combi_nC2_1",
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $2$ 個を選ぶ方法は何通りですか。`,
        answerKind: "numeric",
        params: { n },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      return gradeNumeric(userAnswer, (n * (n - 1)) / 2);
    },
    explain(params) {
      const n = params.n;
      const ans = (n * (n - 1)) / 2;
      return `
### この問題の解説
「${n}個から異なる2個を選ぶ」ので $\\binom{${n}}{2}$ です。

$$
\\binom{${n}}{2}=\\frac{${n}(${n}-1)}{2}=${ans}
$$
`;
    },
  },

  {
    meta: {
      id: "combi_nP2_1",
      topicId: "combi_basic",
      title: "nP2",
      difficulty: 1,
      tags: ["permutation"],
    },
    generate() {
      const n = pick([4, 5, 6, 7, 8, 9, 10, 12]);
      return {
        templateId: "combi_nP2_1",
        statement: `数列 $1,2,\\dots,${n}$ の中から異なる $2$ 個を選んで順に並べる方法は何通りですか。`,
        answerKind: "numeric",
        params: { n },
      };
    },
    grade(params, userAnswer) {
      const n = params.n;
      return gradeNumeric(userAnswer, n * (n - 1));
    },
    explain(params) {
      const n = params.n;
      const ans = n * (n - 1);
      return `
### この問題の解説
「選んで順に並べる」ので順列 ${n}P2 です。

$$
${n}P2=${n}(${n}-1)=${ans}
$$
`;
    },
  },

  {
    meta: {
      id: "combi_mult_rule_1",
      topicId: "combi_basic",
      title: "積の法則",
      difficulty: 1,
      tags: ["rule"],
    },
    generate() {
      const m = pick([2, 3, 4, 5, 6]);
      const n = pick([2, 3, 4, 5, 6]);
      return {
        templateId: "combi_mult_rule_1",
        statement: `A の選び方が ${m} 通り、B の選び方が ${n} 通りある。A を選んでから B を選ぶとき、全体で何通りですか。`,
        answerKind: "numeric",
        params: { m, n },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.m * params.n);
    },
    explain(params) {
      const ans = params.m * params.n;
      return `
### この問題の解説
Aの後にBを行うので積の法則です。

$$
${params.m}\\times ${params.n}=${ans}
$$
`;
    },
  },
];

const extraTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 6 }, (_, i) => buildCombTemplate(`combi_nC3_${i + 1}`, `nC3 ${i + 1}`, 3)),
  ...Array.from({ length: 6 }, (_, i) => buildCombTemplate(`combi_nC4_${i + 1}`, `nC4 ${i + 1}`, 4)),
  ...Array.from({ length: 6 }, (_, i) => buildPermTemplate(`combi_nP3_${i + 1}`, `nP3 ${i + 1}`, 3)),
  ...Array.from({ length: 6 }, (_, i) => buildSumRuleTemplate(`combi_sum_rule_${i + 1}`, `和の法則 ${i + 1}`)),
];

const moreTemplates: QuestionTemplate[] = [
  ...Array.from({ length: 8 }, (_, i) => buildCombTemplate(`combi_nC3_extra_${i + 1}`, `nC3 追加${i + 1}`, 3)),
  ...Array.from({ length: 8 }, (_, i) => buildCombTemplate(`combi_nC4_extra_${i + 1}`, `nC4 追加${i + 1}`, 4)),
  ...Array.from({ length: 7 }, (_, i) => buildPermTemplate(`combi_nP3_extra_${i + 1}`, `nP3 追加${i + 1}`, 3)),
  ...Array.from({ length: 7 }, (_, i) => buildSumRuleTemplate(`combi_sum_rule_extra_${i + 1}`, `和の法則 追加${i + 1}`)),
];

export const combiTemplates: QuestionTemplate[] = [...baseTemplates, ...extraTemplates, ...moreTemplates];
