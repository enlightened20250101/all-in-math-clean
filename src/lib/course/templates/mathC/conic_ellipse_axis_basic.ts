// src/lib/course/templates/mathC/conic_ellipse_axis_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["x軸", "y軸"];

type Case = {
  a2: number;
  b2: number;
  answer: string;
};

const CASES: Case[] = [
  { a2: 9, b2: 4, answer: "x軸" },
  { a2: 4, b2: 9, answer: "y軸" },
  { a2: 16, b2: 1, answer: "x軸" },
  { a2: 1, b2: 16, answer: "y軸" },
  { a2: 25, b2: 9, answer: "x軸" },
  { a2: 9, b2: 25, answer: "y軸" },
  { a2: 36, b2: 4, answer: "x軸" },
  { a2: 4, b2: 36, answer: "y軸" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_axis_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `楕円 $\\frac{x^2}{${c.a2}}+\\frac{y^2}{${c.b2}}=1$ の長軸はどの軸に平行か。`;
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
分母が大きい方が長軸なので **${c.answer}** です。
`;
    },
  };
}

export const conicEllipseAxisTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_axis_basic_${i + 1}`, `楕円の軸 ${i + 1}`)
);

const extraEllipseAxisTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`conic_ellipse_axis_basic_${i + 7}`, `楕円の軸 追加${i + 1}`)
);

conicEllipseAxisTemplates.push(...extraEllipseAxisTemplates);
