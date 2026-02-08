// src/lib/course/templates/mathC/complex_argument_quadrant_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["45^\\circ", "135^\\circ", "225^\\circ", "315^\\circ"];

type Case = {
  a: number;
  b: number;
  answer: string;
};

const CASES: Case[] = [
  { a: 1, b: 1, answer: "45^\\circ" },
  { a: -1, b: 1, answer: "135^\\circ" },
  { a: -1, b: -1, answer: "225^\\circ" },
  { a: 1, b: -1, answer: "315^\\circ" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_quadrant_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `複素数 $z=${c.a}${c.b >= 0 ? "+" : ""}${c.b}i$ の点の偏角を求めよ。`;
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
第${c.answer === "45^\\circ" ? "1" : c.answer === "135^\\circ" ? "2" : c.answer === "225^\\circ" ? "3" : "4"}象限なので点の偏角は **${c.answer}** です。
`;
    },
  };
}

export const complexArgumentQuadrantTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_quadrant_basic_${i + 1}`, `点の偏角（象限） ${i + 1}`)
);

const extraArgumentQuadrantTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_argument_quadrant_basic_${i + 7}`, `点の偏角（象限） 追加${i + 1}`)
);

complexArgumentQuadrantTemplates.push(...extraArgumentQuadrantTemplates);
