// src/lib/course/templates/math2/trig_identity_tan_relation_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["1", "2", "3", "4", "5"];

type Case = {
  cos: string;
  answer: string;
};

const CASES: Case[] = [
  { cos: "\\frac{1}{2}", answer: "4" },
  { cos: "\\frac{\\sqrt{2}}{2}", answer: "2" },
  { cos: "\\frac{\\sqrt{3}}{2}", answer: "1" },
  { cos: "1", answer: "1" },
  { cos: "-1", answer: "1" },
  { cos: "-\\frac{1}{2}", answer: "4" },
  { cos: "-\\frac{\\sqrt{2}}{2}", answer: "2" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_identity_tan_relation_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `\\(\\cos\\theta=${c.cos}\\) のとき、$1+\\tan^2\\theta$ を求めよ。`;
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
$1+\\tan^2\\theta=\\frac{1}{\\cos^2\\theta}$ より答えは **${c.answer}** です。
`;
    },
  };
}

export const trigIdentityTanRelationTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_identity_tan_relation_basic_${i + 1}`, `tanの恒等式 ${i + 1}`)
);
