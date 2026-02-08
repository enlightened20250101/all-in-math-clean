// src/lib/course/templates/math2/trig_equation_radian_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["\\frac{\\pi}{6}", "\\frac{\\pi}{4}", "\\frac{\\pi}{3}", "\\frac{\\pi}{2}"];

type Case = {
  func: "sin" | "cos";
  answer: string;
  rhs: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", answer: "\\frac{\\pi}{6}", rhs: "\\frac{1}{2}", explain: "sin(\u03c0/6)=1/2" },
  { func: "sin", answer: "\\frac{\\pi}{4}", rhs: "\\frac{\\sqrt{2}}{2}", explain: "sin(\u03c0/4)=\u221a2/2" },
  { func: "sin", answer: "\\frac{\\pi}{3}", rhs: "\\frac{\\sqrt{3}}{2}", explain: "sin(\u03c0/3)=\u221a3/2" },
  { func: "sin", answer: "\\frac{\\pi}{2}", rhs: "1", explain: "sin(\u03c0/2)=1" },
  { func: "cos", answer: "\\frac{\\pi}{6}", rhs: "\\frac{\\sqrt{3}}{2}", explain: "cos(\u03c0/6)=\u221a3/2" },
  { func: "cos", answer: "\\frac{\\pi}{4}", rhs: "\\frac{\\sqrt{2}}{2}", explain: "cos(\u03c0/4)=\u221a2/2" },
  { func: "cos", answer: "\\frac{\\pi}{3}", rhs: "\\frac{1}{2}", explain: "cos(\u03c0/3)=1/2" },
  { func: "cos", answer: "\\frac{\\pi}{2}", rhs: "0", explain: "cos(\u03c0/2)=0" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_equation_radian_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `振動モデルとして、方程式 $\\${c.func} x=${c.rhs}$ の解のうち $0\\le x < \\pi$ を求めよ。`;
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
${c.explain} なので答えは **${c.answer}** です。
`;
    },
  };
}

export const trigEquationRadianTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_equation_radian_basic_${i + 1}`, `三角方程式（弧度） ${i + 1}`)
);
