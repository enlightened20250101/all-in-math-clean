// src/lib/course/templates/math2/trig_graph_period_basic.ts
import type { QuestionTemplate } from "../../types";
import { texFrac } from "@/lib/format/tex";

const CHOICES = [
  "2\\pi",
  "\\pi",
  "\\frac{\\pi}{2}",
  "4\\pi",
  "\\frac{2\\pi}{3}",
  "\\frac{\\pi}{3}",
  "6\\pi",
  "8\\pi",
];

type Case = {
  kNum: number;
  kDen: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { kNum: 1, kDen: 1, answer: "2\\pi", explain: "k=1" },
  { kNum: 2, kDen: 1, answer: "\\pi", explain: "k=2" },
  { kNum: 4, kDen: 1, answer: "\\frac{\\pi}{2}", explain: "k=4" },
  { kNum: 1, kDen: 2, answer: "4\\pi", explain: "k=1/2" },
  { kNum: 3, kDen: 1, answer: "\\frac{2\\pi}{3}", explain: "k=3" },
  { kNum: 6, kDen: 1, answer: "\\frac{\\pi}{3}", explain: "k=6" },
  { kNum: 1, kDen: 3, answer: "6\\pi", explain: "k=1/3" },
  { kNum: 1, kDen: 4, answer: "8\\pi", explain: "k=1/4" },
];

function buildK(c: Case) {
  if (c.kDen === 1) return String(c.kNum);
  return texFrac(c.kNum, c.kDen);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_period_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const k = buildK(c);
      const kx = k === "1" ? "x" : `${k}x`;
      const statement = `関数 $y=\\sin(${kx})$ の周期を求めよ。`;
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
周期は $\\frac{2\\pi}{|k|}$ なので ${c.explain}。
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigGraphPeriodTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_period_basic_${i + 1}`, `周期（グラフ） ${i + 1}`)
);
