// src/lib/course/templates/math2/trig_radian_basic.ts
import type { QuestionTemplate } from "../../types";
import { texEq } from "@/lib/format/tex";

const CHOICES = [
  "1",
  "0",
  "-1",
  "\\frac{1}{2}",
  "-\\frac{1}{2}",
  "\\frac{\\sqrt{2}}{2}",
  "-\\frac{\\sqrt{2}}{2}",
  "\\frac{\\sqrt{3}}{2}",
  "-\\frac{\\sqrt{3}}{2}",
];

type Case = {
  func: "sin" | "cos";
  angle: string;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", angle: "\\frac{\\pi}{6}", answer: "\\frac{1}{2}", explain: "sin(\u03c0/6)=1/2" },
  { func: "cos", angle: "\\frac{\\pi}{6}", answer: "\\frac{\\sqrt{3}}{2}", explain: "cos(\u03c0/6)=\u221a3/2" },
  { func: "sin", angle: "\\frac{\\pi}{4}", answer: "\\frac{\\sqrt{2}}{2}", explain: "sin(\u03c0/4)=\u221a2/2" },
  { func: "cos", angle: "\\frac{\\pi}{4}", answer: "\\frac{\\sqrt{2}}{2}", explain: "cos(\u03c0/4)=\u221a2/2" },
  { func: "sin", angle: "\\frac{\\pi}{3}", answer: "\\frac{\\sqrt{3}}{2}", explain: "sin(\u03c0/3)=\u221a3/2" },
  { func: "cos", angle: "\\frac{\\pi}{3}", answer: "\\frac{1}{2}", explain: "cos(\u03c0/3)=1/2" },
  { func: "sin", angle: "\\pi", answer: "0", explain: "sin(\u03c0)=0" },
  { func: "cos", angle: "\\pi", answer: "-1", explain: "cos(\u03c0)=-1" },
  { func: "sin", angle: "\\frac{3\\pi}{2}", answer: "-1", explain: "sin(3\u03c0/2)=-1" },
  { func: "cos", angle: "\\frac{3\\pi}{2}", answer: "0", explain: "cos(3\u03c0/2)=0" },
  { func: "sin", angle: "2\\pi", answer: "0", explain: "sin(2\u03c0)=0" },
  { func: "cos", angle: "2\\pi", answer: "1", explain: "cos(2\u03c0)=1" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_radian_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement =
        `回転角（弧度法）として次を計算せよ。\\n\\n$$${texEq(`\\${c.func}(${c.angle})`, "?")}$$`;
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
${c.explain}
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigRadianTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_radian_basic_${i + 1}`, `弧度法 ${i + 1}`)
);
