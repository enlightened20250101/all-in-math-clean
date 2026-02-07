// src/lib/course/templates/mathC/prob_binomial_probability_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = [
  "\\frac{1}{8}",
  "\\frac{1}{4}",
  "\\frac{3}{8}",
  "\\frac{1}{2}",
  "\\frac{1}{16}",
  "\\frac{5}{16}",
  "\\frac{3}{16}",
  "\\frac{1}{32}",
];

type Case = {
  n: number;
  k: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { n: 3, k: 0, answer: "\\frac{1}{8}", explain: "(1/2)^3" },
  { n: 2, k: 1, answer: "\\frac{1}{2}", explain: "2\\cdot(1/2)^2" },
  { n: 3, k: 2, answer: "\\frac{3}{8}", explain: "3\\cdot(1/2)^3" },
  { n: 4, k: 1, answer: "\\frac{1}{4}", explain: "4\\cdot(1/2)^4" },
  { n: 4, k: 0, answer: "\\frac{1}{16}", explain: "(1/2)^4" },
  { n: 4, k: 2, answer: "\\frac{3}{8}", explain: "6\\cdot(1/2)^4" },
  { n: 4, k: 3, answer: "\\frac{1}{4}", explain: "4\\cdot(1/2)^4" },
  { n: 5, k: 1, answer: "\\frac{5}{16}", explain: "5\\cdot(1/2)^5" },
  { n: 5, k: 2, answer: "\\frac{5}{16}", explain: "10\\cdot(1/2)^5" },
  { n: 5, k: 4, answer: "\\frac{5}{16}", explain: "5\\cdot(1/2)^5" },
  { n: 5, k: 5, answer: "\\frac{1}{32}", explain: "(1/2)^5" },
  { n: 4, k: 4, answer: "\\frac{1}{16}", explain: "(1/2)^4" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "prob_binomial_probability_basic",
      title,
      difficulty: 1,
      tags: ["probability", "binomial"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `コインを ${c.n} 回投げたとき、表がちょうど ${c.k} 回出る確率を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { caseId },
      };
    },
    grade(params, userAnswer) {
      const c = CASES[params.caseId] ?? CASES[0];
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain(params) {
      const c = CASES[params.caseId] ?? CASES[0];
      return `
### この問題の解説
二項分布の確率は $\\binom{n}{k}(1/2)^n$ です。
${c.explain} より、答えは **${c.answer}** です。
`;
    },
  };
}

export const binomialProbabilityTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`prob_binomial_probability_basic_${i + 1}`, `二項分布の確率 ${i + 1}`)
);
