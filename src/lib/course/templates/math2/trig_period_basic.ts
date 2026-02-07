// src/lib/course/templates/math2/trig_period_basic.ts
import type { QuestionTemplate } from "../../types";
import { texFrac } from "@/lib/format/tex";

const CHOICES = ["2\\pi", "\\pi", "\\frac{\\pi}{2}", "4\\pi"];

type Case = {
  func: "sin" | "cos";
  kNum: number;
  kDen: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", kNum: 1, kDen: 1, answer: "2\\pi", explain: "k=1" },
  { func: "cos", kNum: 2, kDen: 1, answer: "\\pi", explain: "k=2" },
  { func: "sin", kNum: 4, kDen: 1, answer: "\\frac{\\pi}{2}", explain: "k=4" },
  { func: "cos", kNum: 1, kDen: 2, answer: "4\\pi", explain: "k=1/2" },
];

function buildK(c: Case) {
  if (c.kDen === 1) return String(c.kNum);
  return texFrac(c.kNum, c.kDen);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_period_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const k = buildK(c);
      const kx = k === "1" ? "x" : `${k}x`;
      const statement = `関数 $y=\\${c.func}(${kx})$ の周期を求めよ。`;
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
周期は $\\frac{2\\pi}{|k|}$ で求められます。${c.explain}
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigPeriodTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_period_basic_${i + 1}`, `周期 ${i + 1}`)
);
