// src/lib/course/templates/math1/trig_special_angles_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  id: string;
  expr: string;
  choices: string[];
  answer: string;
  difficulty: 1 | 2 | 3;
};

const CASES: Case[] = [
  {
    id: "trig_sa_1",
    expr: "\\sin 30^\\circ",
    choices: ["\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{2}", "0"],
    answer: "\\frac{1}{2}",
    difficulty: 1,
  },
  {
    id: "trig_sa_2",
    expr: "\\cos 45^\\circ",
    choices: ["\\frac{1}{2}", "\\frac{\\sqrt{2}}{2}", "\\frac{\\sqrt{3}}{2}", "1"],
    answer: "\\frac{\\sqrt{2}}{2}",
    difficulty: 1,
  },
  {
    id: "trig_sa_3",
    expr: "\\tan 60^\\circ",
    choices: ["\\sqrt{3}", "\\frac{\\sqrt{3}}{3}", "1", "0"],
    answer: "\\sqrt{3}",
    difficulty: 1,
  },
];

export const trigSpecialAnglesVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `trig_special_angles_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "trig_special_angles_basic",
      title: `三角比の値（角度違い）${i + 1}`,
      difficulty: c.difficulty,
      tags: ["trig", "special"],
    },
    generate() {
      return {
        templateId,
        statement: `次を計算せよ。$${c.expr}$`,
        answerKind: "choice",
        choices: c.choices,
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain() {
      return `
### この問題の解説
代表角の値より $${c.expr}=${c.answer}$。答えは **${c.answer}** です。
`;
    },
  };
});
