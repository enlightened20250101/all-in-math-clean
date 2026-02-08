// src/lib/course/templates/math2/trig_phase_shift_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["0", "\\frac{\\pi}{6}", "\\frac{\\pi}{4}", "\\frac{\\pi}{3}", "\\frac{\\pi}{2}"];

type Case = {
  shift: string;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { shift: "\\frac{\\pi}{6}", answer: "\\frac{\\pi}{6}", explain: "x-\u03c6 の形なので位相は \u03c6" },
  { shift: "\\frac{\\pi}{4}", answer: "\\frac{\\pi}{4}", explain: "x-\u03c6 の形なので位相は \u03c6" },
  { shift: "\\frac{\\pi}{3}", answer: "\\frac{\\pi}{3}", explain: "x-\u03c6 の形なので位相は \u03c6" },
  { shift: "\\frac{\\pi}{2}", answer: "\\frac{\\pi}{2}", explain: "x-\u03c6 の形なので位相は \u03c6" },
  { shift: "0", answer: "0", explain: "ずらしがない" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_phase_shift_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `波形 $y=\\sin(x-${c.shift})$ の位相のずれを求めよ。`;
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
${c.explain}。
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigPhaseShiftTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_phase_shift_basic_${i + 1}`, `位相のずれ ${i + 1}`)
);
