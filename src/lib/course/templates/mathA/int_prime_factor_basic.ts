// src/lib/course/templates/mathA/int_prime_factor_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type FactorCase = {
  id: string;
  title: string;
  n: number;
  correct: string;
  choices: string[];
};

type PrimeCase = {
  id: string;
  title: string;
  n: number;
  correct: "素数" | "合成数";
};

type DivisorCountCase = {
  id: string;
  title: string;
  n: number;
  count: number;
};

function buildFactorTemplate(c: FactorCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_prime_factor_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "prime-factor"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `$${c.n}$ を素因数分解した結果として正しいものを選べ。`,
        answerKind: "choice",
        choices: c.choices,
        params: { n: c.n },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `
### この問題の解説
$${c.n} = ${c.correct}$ です。
`;
    },
  };
}

function buildPrimeTemplate(c: PrimeCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_prime_factor_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "prime-check"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `$${c.n}$ は素数か合成数か。`,
        answerKind: "choice",
        choices: ["素数", "合成数"],
        params: { n: c.n },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.correct, correctAnswer: c.correct };
    },
    explain() {
      return `
### この問題の解説
$${c.n}$ は ${c.correct} です。
`;
    },
  };
}

function buildDivisorCountTemplate(c: DivisorCountCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "int_prime_factor_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "divisor-count"],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `$${c.n}$ の正の約数の個数を求めよ。`,
        answerKind: "numeric",
        params: { n: c.n },
      };
    },
    grade(_params, userAnswer) {
      return gradeNumeric(userAnswer, c.count);
    },
    explain() {
      return `
### この問題の解説
$${c.n}$ の正の約数の個数は $${c.count}$ 個です。
`;
    },
  };
}

const FACTOR_CASES: FactorCase[] = [
  { id: "int_pf_1", title: "素因数分解 12", n: 12, correct: "2^2 \\cdot 3", choices: ["2^2 \\cdot 3", "2 \\cdot 3^2", "3 \\cdot 4", "2^3"] },
  { id: "int_pf_2", title: "素因数分解 18", n: 18, correct: "2 \\cdot 3^2", choices: ["2 \\cdot 3^2", "2^2 \\cdot 3", "3 \\cdot 6", "2 \\cdot 9"] },
  { id: "int_pf_3", title: "素因数分解 20", n: 20, correct: "2^2 \\cdot 5", choices: ["2^2 \\cdot 5", "2 \\cdot 3^2", "4 \\cdot 5", "2^4"] },
  { id: "int_pf_4", title: "素因数分解 45", n: 45, correct: "3^2 \\cdot 5", choices: ["3^2 \\cdot 5", "3 \\cdot 5^2", "5 \\cdot 9", "3 \\cdot 15"] },
  { id: "int_pf_5", title: "素因数分解 60", n: 60, correct: "2^2 \\cdot 3 \\cdot 5", choices: ["2^2 \\cdot 3 \\cdot 5", "2^2 \\cdot 5^2", "3 \\cdot 4 \\cdot 5", "2 \\cdot 30"] },
  { id: "int_pf_6", title: "素因数分解 72", n: 72, correct: "2^3 \\cdot 3^2", choices: ["2^3 \\cdot 3^2", "2^2 \\cdot 3 \\cdot 6", "3^2 \\cdot 8", "2 \\cdot 36"] },
  { id: "int_pf_7", title: "素因数分解 84", n: 84, correct: "2^2 \\cdot 3 \\cdot 7", choices: ["2^2 \\cdot 3 \\cdot 7", "2 \\cdot 3 \\cdot 14", "4 \\cdot 21", "3 \\cdot 7^2"] },
  { id: "int_pf_8", title: "素因数分解 90", n: 90, correct: "2 \\cdot 3^2 \\cdot 5", choices: ["2 \\cdot 3^2 \\cdot 5", "2^2 \\cdot 3 \\cdot 5", "3 \\cdot 5 \\cdot 6", "9 \\cdot 10"] },
  { id: "int_pf_9", title: "素因数分解 96", n: 96, correct: "2^5 \\cdot 3", choices: ["2^5 \\cdot 3", "2^3 \\cdot 3 \\cdot 4", "3 \\cdot 32", "6 \\cdot 16"] },
  { id: "int_pf_10", title: "素因数分解 105", n: 105, correct: "3 \\cdot 5 \\cdot 7", choices: ["3 \\cdot 5 \\cdot 7", "3 \\cdot 7^2", "5 \\cdot 21", "7 \\cdot 15"] },
  { id: "int_pf_11", title: "素因数分解 108", n: 108, correct: "2^2 \\cdot 3^3", choices: ["2^2 \\cdot 3^3", "2^3 \\cdot 3^2", "3^3 \\cdot 4", "2 \\cdot 54"] },
  { id: "int_pf_12", title: "素因数分解 120", n: 120, correct: "2^3 \\cdot 3 \\cdot 5", choices: ["2^3 \\cdot 3 \\cdot 5", "2^4 \\cdot 3 \\cdot 5", "3 \\cdot 40", "2^3 \\cdot 15"] },
  { id: "int_pf_13", title: "素因数分解 126", n: 126, correct: "2 \\cdot 3^2 \\cdot 7", choices: ["2 \\cdot 3^2 \\cdot 7", "2^2 \\cdot 3 \\cdot 7", "3^2 \\cdot 14", "7 \\cdot 18"] },
  { id: "int_pf_14", title: "素因数分解 140", n: 140, correct: "2^2 \\cdot 5 \\cdot 7", choices: ["2^2 \\cdot 5 \\cdot 7", "2^3 \\cdot 5 \\cdot 7", "4 \\cdot 35", "2 \\cdot 70"] },
  { id: "int_pf_15", title: "素因数分解 150", n: 150, correct: "2 \\cdot 3 \\cdot 5^2", choices: ["2 \\cdot 3 \\cdot 5^2", "2^2 \\cdot 3 \\cdot 5", "3 \\cdot 50", "5^2 \\cdot 6"] },
  { id: "int_pf_16", title: "素因数分解 168", n: 168, correct: "2^3 \\cdot 3 \\cdot 7", choices: ["2^3 \\cdot 3 \\cdot 7", "2^4 \\cdot 3 \\cdot 7", "3 \\cdot 56", "2^3 \\cdot 21"] },
  { id: "int_pf_17", title: "素因数分解 180", n: 180, correct: "2^2 \\cdot 3^2 \\cdot 5", choices: ["2^2 \\cdot 3^2 \\cdot 5", "2^3 \\cdot 3 \\cdot 5", "3^2 \\cdot 20", "2^2 \\cdot 45"] },
  { id: "int_pf_18", title: "素因数分解 196", n: 196, correct: "2^2 \\cdot 7^2", choices: ["2^2 \\cdot 7^2", "2^3 \\cdot 7", "4 \\cdot 49", "14^2"] },
  { id: "int_pf_19", title: "素因数分解 210", n: 210, correct: "2 \\cdot 3 \\cdot 5 \\cdot 7", choices: ["2 \\cdot 3 \\cdot 5 \\cdot 7", "2^2 \\cdot 3 \\cdot 5", "3 \\cdot 70", "5 \\cdot 42"] },
  { id: "int_pf_20", title: "素因数分解 225", n: 225, correct: "3^2 \\cdot 5^2", choices: ["3^2 \\cdot 5^2", "3^3 \\cdot 5", "9 \\cdot 25", "15^2"] },
];

const PRIME_CASES: PrimeCase[] = [
  { id: "int_prime_1", title: "素数判定 17", n: 17, correct: "素数" },
  { id: "int_prime_2", title: "素数判定 19", n: 19, correct: "素数" },
  { id: "int_prime_3", title: "素数判定 21", n: 21, correct: "合成数" },
  { id: "int_prime_4", title: "素数判定 29", n: 29, correct: "素数" },
  { id: "int_prime_5", title: "素数判定 33", n: 33, correct: "合成数" },
  { id: "int_prime_6", title: "素数判定 37", n: 37, correct: "素数" },
  { id: "int_prime_7", title: "素数判定 49", n: 49, correct: "合成数" },
  { id: "int_prime_8", title: "素数判定 55", n: 55, correct: "合成数" },
  { id: "int_prime_9", title: "素数判定 41", n: 41, correct: "素数" },
  { id: "int_prime_10", title: "素数判定 51", n: 51, correct: "合成数" },
  { id: "int_prime_11", title: "素数判定 57", n: 57, correct: "合成数" },
  { id: "int_prime_12", title: "素数判定 61", n: 61, correct: "素数" },
  { id: "int_prime_13", title: "素数判定 71", n: 71, correct: "素数" },
  { id: "int_prime_14", title: "素数判定 73", n: 73, correct: "素数" },
  { id: "int_prime_15", title: "素数判定 77", n: 77, correct: "合成数" },
  { id: "int_prime_16", title: "素数判定 91", n: 91, correct: "合成数" },
];

const DIV_COUNT_CASES: DivisorCountCase[] = [
  { id: "int_divcount_1", title: "約数の個数 12", n: 12, count: 6 },
  { id: "int_divcount_2", title: "約数の個数 18", n: 18, count: 6 },
  { id: "int_divcount_3", title: "約数の個数 20", n: 20, count: 6 },
  { id: "int_divcount_4", title: "約数の個数 24", n: 24, count: 8 },
  { id: "int_divcount_5", title: "約数の個数 30", n: 30, count: 8 },
  { id: "int_divcount_6", title: "約数の個数 36", n: 36, count: 9 },
  { id: "int_divcount_7", title: "約数の個数 48", n: 48, count: 10 },
  { id: "int_divcount_8", title: "約数の個数 54", n: 54, count: 12 },
  { id: "int_divcount_9", title: "約数の個数 60", n: 60, count: 12 },
  { id: "int_divcount_10", title: "約数の個数 72", n: 72, count: 12 },
  { id: "int_divcount_11", title: "約数の個数 100", n: 100, count: 9 },
  { id: "int_divcount_12", title: "約数の個数 120", n: 120, count: 16 },
  { id: "int_divcount_13", title: "約数の個数 84", n: 84, count: 12 },
  { id: "int_divcount_14", title: "約数の個数 144", n: 144, count: 15 },
];

export const intPrimeFactorTemplates: QuestionTemplate[] = [
  ...FACTOR_CASES.map(buildFactorTemplate),
  ...PRIME_CASES.map(buildPrimeTemplate),
  ...DIV_COUNT_CASES.map(buildDivisorCountTemplate),
];
