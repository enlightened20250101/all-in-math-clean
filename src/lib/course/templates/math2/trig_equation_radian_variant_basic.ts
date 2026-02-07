// src/lib/course/templates/math2/trig_equation_radian_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type EqCase = {
  id: string;
  title: string;
  func: "sin" | "cos";
  value: string;
  correct: string;
  choices: string[];
};

function buildTemplate(c: EqCase): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "trig_equation_radian_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `次の方程式を満たす $0 \\le x < 2\\pi$ の解をすべて答えよ。\\n\\n$$\\${c.func} x=${c.value}$$`,
        answerKind: "choice",
        choices: c.choices,
        params: {},
      };
    },
    grade(_params, userAnswer) {
      const normalized = (userAnswer ?? "").replace(/\s+/g, "");
      const correct = c.correct.replace(/\s+/g, "");
      return { isCorrect: normalized === correct, correctAnswer: c.correct };
    },
    explain() {
      return `### この問題の解説\n単位円の値を用いて解を求めます。答えは **${c.correct}** です。`;
    },
  };
}

const CASES: EqCase[] = [
  {
    id: "trig_rad_v1",
    title: "三角方程式（sin）1",
    func: "sin",
    value: "\\frac{1}{2}",
    correct: "\\frac{\\pi}{6}, \\frac{5\\pi}{6}",
    choices: ["\\frac{\\pi}{6}, \\frac{5\\pi}{6}", "\\frac{\\pi}{6}", "\\frac{5\\pi}{6}", "\\frac{7\\pi}{6}, \\frac{11\\pi}{6}"],
  },
  {
    id: "trig_rad_v2",
    title: "三角方程式（cos）1",
    func: "cos",
    value: "\\frac{1}{2}",
    correct: "\\frac{\\pi}{3}, \\frac{5\\pi}{3}",
    choices: ["\\frac{\\pi}{3}, \\frac{5\\pi}{3}", "\\frac{\\pi}{3}", "\\frac{5\\pi}{3}", "\\frac{2\\pi}{3}, \\frac{4\\pi}{3}"],
  },
  {
    id: "trig_rad_v3",
    title: "三角方程式（sin）2",
    func: "sin",
    value: "0",
    correct: "0, \\pi",
    choices: ["0, \\pi", "0", "\\pi", "\\frac{\\pi}{2}, \\frac{3\\pi}{2}"],
  },
  {
    id: "trig_rad_v4",
    title: "三角方程式（cos）2",
    func: "cos",
    value: "0",
    correct: "\\frac{\\pi}{2}, \\frac{3\\pi}{2}",
    choices: ["\\frac{\\pi}{2}, \\frac{3\\pi}{2}", "\\frac{\\pi}{2}", "\\frac{3\\pi}{2}", "0, \\pi"],
  },
];

export const trigEquationRadianVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
