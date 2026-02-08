// src/lib/course/templates/mathA/int_mod_arithmetic_intro.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type ChoiceCase = {
  id: string;
  title: string;
  base: number;
  exp: number;
  choices: string[];
  context?: string;
};

type CongCase = {
  id: string;
  title: string;
  mod: number;
  rem: number;
  limit: number;
  kind: "min_ge" | "max_le";
  context?: string;
};

function lastDigit(base: number, exp: number): number {
  const cycle = [base % 10];
  let cur = base % 10;
  while (true) {
    cur = (cur * base) % 10;
    if (cur === cycle[0]) break;
    cycle.push(cur);
  }
  const idx = (exp - 1) % cycle.length;
  return cycle[idx];
}

function buildChoice(c: ChoiceCase): QuestionTemplate {
  const correct = String(lastDigit(c.base, c.exp));
  return {
    meta: {
      id: c.id,
      topicId: "int_mod_arithmetic_intro",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "mod", "last-digit"],
    },
    generate() {
      const lead = c.context ? `${c.context}\n\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}$${c.base}^${c.exp}$ の下1桁を選べ。`,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `
### この問題の解説
下1桁は $${correct}$ です。
`;
    },
  };
}

function answerFor(c: CongCase): number {
  if (c.kind === "min_ge") {
    const mod = c.limit % c.mod;
    const need = (c.rem - mod + c.mod) % c.mod;
    return c.limit + need;
  }
  const mod = c.limit % c.mod;
  const back = (mod - c.rem + c.mod) % c.mod;
  return c.limit - back;
}

function buildCong(c: CongCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_mod_arithmetic_intro",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "mod", c.kind],
    },
    generate() {
      const cond = `$x \\equiv ${c.rem} \\pmod{${c.mod}}$`;
      const bound = c.kind === "min_ge" ? `$x \\ge ${c.limit}$` : `$x \\le ${c.limit}$`;
      const tail = c.kind === "min_ge" ? "最小の $x$" : "最大の $x$";
      const lead = c.context ? `${c.context}\n\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}${cond} かつ ${bound} を満たす${tail}を求めよ。`,
        answerKind: "numeric",
        params: {},
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, answerFor(c));
    },
    explain() {
      return `
### この問題の解説
条件を満たす答えは $${answerFor(c)}$ です。
`;
    },
  };
}

const CHOICE_CASES: ChoiceCase[] = [
  {
    id: "int_mod_1",
    title: "下1桁 2^5",
    context: "2の累乗は下1桁が周期的に繰り返される。",
    base: 2,
    exp: 5,
    choices: ["2", "4", "6", "8"],
  },
  {
    id: "int_mod_2",
    title: "下1桁 2^7",
    context: "2の累乗の周期（2,4,8,6）を利用する。",
    base: 2,
    exp: 7,
    choices: ["2", "4", "6", "8"],
  },
  {
    id: "int_mod_3",
    title: "下1桁 3^4",
    context: "3の累乗の下1桁が4周期で回ることに注目する。",
    base: 3,
    exp: 4,
    choices: ["1", "3", "7", "9"],
  },
  {
    id: "int_mod_4",
    title: "下1桁 3^5",
    context: "3の累乗の周期を使って指数を割り算する。",
    base: 3,
    exp: 5,
    choices: ["1", "3", "7", "9"],
  },
  { id: "int_mod_5", title: "下1桁 4^3", base: 4, exp: 3, choices: ["4", "6", "8", "2"] },
  { id: "int_mod_6", title: "下1桁 5^7", base: 5, exp: 7, choices: ["0", "5", "2", "8"] },
  { id: "int_mod_7", title: "下1桁 6^8", base: 6, exp: 8, choices: ["6", "4", "8", "2"] },
  { id: "int_mod_8", title: "下1桁 7^3", base: 7, exp: 3, choices: ["3", "7", "9", "1"] },
  { id: "int_mod_9", title: "下1桁 7^4", base: 7, exp: 4, choices: ["1", "3", "7", "9"] },
  { id: "int_mod_10", title: "下1桁 8^5", base: 8, exp: 5, choices: ["8", "4", "2", "6"] },
  { id: "int_mod_11", title: "下1桁 9^2", base: 9, exp: 2, choices: ["1", "9", "7", "3"] },
  { id: "int_mod_12", title: "下1桁 9^3", base: 9, exp: 3, choices: ["9", "1", "7", "3"] },
];

const CONG_CASES: CongCase[] = [
  {
    id: "int_cong_1",
    title: "合同 最小 20以上",
    context: "5で割ると2余る数を、20以上で最小から探す。",
    mod: 5,
    rem: 2,
    limit: 20,
    kind: "min_ge",
  },
  {
    id: "int_cong_2",
    title: "合同 最小 30以上",
    context: "6で割ると1余る数を30以上で最小から求める。",
    mod: 6,
    rem: 1,
    limit: 30,
    kind: "min_ge",
  },
  {
    id: "int_cong_3",
    title: "合同 最小 40以上",
    context: "7で割ると3余る数を40以上で最小にする。",
    mod: 7,
    rem: 3,
    limit: 40,
    kind: "min_ge",
  },
  {
    id: "int_cong_4",
    title: "合同 最小 50以上",
    context: "8で割ると5余る数を50以上で探す。",
    mod: 8,
    rem: 5,
    limit: 50,
    kind: "min_ge",
  },
  { id: "int_cong_5", title: "合同 最大 60以下", mod: 5, rem: 2, limit: 60, kind: "max_le" },
  { id: "int_cong_6", title: "合同 最大 70以下", mod: 6, rem: 1, limit: 70, kind: "max_le" },
  { id: "int_cong_7", title: "合同 最大 80以下", mod: 7, rem: 3, limit: 80, kind: "max_le" },
  { id: "int_cong_8", title: "合同 最大 90以下", mod: 8, rem: 5, limit: 90, kind: "max_le" },
];

const extraChoiceCases: ChoiceCase[] = Array.from({ length: 16 }, (_, i) => {
  const basePool = [2, 3, 4, 7, 8, 9];
  const base = basePool[i % basePool.length];
  const exp = 2 + i;
  const correct = lastDigit(base, exp);
  const choices = Array.from(
    new Set([correct, (correct + 2) % 10, (correct + 4) % 10, (correct + 6) % 10])
  ).map(String);
  while (choices.length < 4) {
    choices.push(String((correct + choices.length + 1) % 10));
  }
  return {
    id: `int_mod_extra_choice_${i + 1}`,
    title: `下1桁 追加${i + 1}`,
    base,
    exp,
    choices,
  };
});

const extraCongCases: CongCase[] = Array.from({ length: 14 }, (_, i) => {
  const modPool = [5, 6, 7, 8, 9, 10];
  const mod = modPool[i % modPool.length];
  const rem = (2 * i + 1) % mod;
  const limit = 20 + i * 5;
  const kind: CongCase["kind"] = i % 2 === 0 ? "min_ge" : "max_le";
  return {
    id: `int_cong_extra_${i + 1}`,
    title: `合同 追加${i + 1}`,
    mod,
    rem,
    limit,
    kind,
  };
});

export const intModArithmeticIntroTemplates: QuestionTemplate[] = [
  ...CHOICE_CASES.map(buildChoice),
  ...CONG_CASES.map(buildCong),
  ...extraChoiceCases.map(buildChoice),
  ...extraCongCases.map(buildCong),
];
