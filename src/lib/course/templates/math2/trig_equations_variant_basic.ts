// src/lib/course/templates/math2/trig_equations_variant_basic.ts
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
      topicId: "trig_equations_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `回転角度として $0^\\circ \\le x < 360^\\circ$ の解をすべて答えよ。\\n\\n$$\\${c.func} x=${c.value}$$`,
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
    id: "trig_eq_v1",
    title: "三角方程式（sin）1",
    func: "sin",
    value: "\\frac{1}{2}",
    correct: "30°, 150°",
    choices: ["30°, 150°", "30°", "150°", "210°, 330°"],
  },
  {
    id: "trig_eq_v2",
    title: "三角方程式（sin）2",
    func: "sin",
    value: "0",
    correct: "0°, 180°",
    choices: ["0°, 180°", "0°", "180°", "90°, 270°"],
  },
  {
    id: "trig_eq_v3",
    title: "三角方程式（cos）1",
    func: "cos",
    value: "\\frac{1}{2}",
    correct: "60°, 300°",
    choices: ["60°, 300°", "60°", "300°", "120°, 240°"],
  },
  {
    id: "trig_eq_v4",
    title: "三角方程式（cos）2",
    func: "cos",
    value: "0",
    correct: "90°, 270°",
    choices: ["90°, 270°", "90°", "270°", "0°, 180°"],
  },
];

export const trigEquationsVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
