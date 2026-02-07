// src/lib/course/templates/mathC/complex_power_i_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["1", "-1", "i", "-i"];

type Case = {
  n: number;
  answer: string;
};

const CASES: Case[] = [
  { n: 0, answer: "1" },
  { n: 1, answer: "i" },
  { n: 2, answer: "-1" },
  { n: 3, answer: "-i" },
  { n: 4, answer: "1" },
  { n: 5, answer: "i" },
  { n: 6, answer: "-1" },
  { n: 7, answer: "-i" },
  { n: 8, answer: "1" },
  { n: 9, answer: "i" },
  { n: 10, answer: "-1" },
  { n: 11, answer: "-i" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_power_i_basic",
      title,
      difficulty: 1,
      tags: ["complex", "power"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `次を計算せよ。$i^{${c.n}}$`; 
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
$i^1=i,\ i^2=-1,\ i^3=-i,\ i^4=1$ で4周期です。
答えは **${c.answer}** です。
`;
    },
  };
}

export const complexPowerITemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_power_i_basic_${i + 1}`, `iの累乗 ${i + 1}`)
);

const extraPowerITemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_power_i_basic_${i + 7}`, `iの累乗 追加${i + 1}`)
);

complexPowerITemplates.push(...extraPowerITemplates);
