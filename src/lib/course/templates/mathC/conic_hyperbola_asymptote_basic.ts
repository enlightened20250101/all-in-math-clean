// src/lib/course/templates/mathC/conic_hyperbola_asymptote_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = [
  "\\frac{1}{3}",
  "\\frac{1}{2}",
  "1",
  "\\frac{2}{3}",
  "\\frac{3}{2}",
  "\\frac{2}{1}",
  "3",
];

type Case = {
  a2: number;
  b2: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { a2: 4, b2: 1, answer: "\\frac{1}{2}", explain: "b/a=1/2" },
  { a2: 1, b2: 1, answer: "1", explain: "b/a=1" },
  { a2: 1, b2: 4, answer: "\\frac{2}{1}", explain: "b/a=2" },
  { a2: 4, b2: 9, answer: "\\frac{3}{2}", explain: "b/a=3/2" },
  { a2: 9, b2: 1, answer: "\\frac{1}{3}", explain: "b/a=1/3" },
  { a2: 1, b2: 9, answer: "3", explain: "b/a=3" },
  { a2: 9, b2: 4, answer: "\\frac{2}{3}", explain: "b/a=2/3" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_asymptote_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `双曲線 $\\frac{x^2}{${c.a2}}-\\frac{y^2}{${c.b2}}=1$ の漸近線 $y=mx$ のうち、$m>0$ を求めよ。`;
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
漸近線は $y=\\pm\\frac{b}{a}x$ なので ${c.explain} です。
答えは **${c.answer}** です。
`;
    },
  };
}

export const conicHyperbolaAsymptoteTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_basic_${i + 1}`, `双曲線の漸近線 ${i + 1}`)
);

const extraHyperbolaAsymptoteTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`conic_hyperbola_asymptote_basic_${i + 7}`, `双曲線の漸近線 追加${i + 1}`)
);

conicHyperbolaAsymptoteTemplates.push(...extraHyperbolaAsymptoteTemplates);
