// src/lib/course/templates/math2/trig_identity_pythag_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  id: string;
  statement: string;
  choices: string[];
  answer: string;
  difficulty: 1 | 2 | 3;
};

const CASES: Case[] = [
  {
    id: "trig_pythag_1",
    statement: "次を計算せよ。$1+\\tan^2\\theta$",
    choices: ["1", "\\cos^2\\theta", "\\frac{1}{\\cos^2\\theta}", "\\sin^2\\theta"],
    answer: "\\frac{1}{\\cos^2\\theta}",
    difficulty: 1,
  },
  {
    id: "trig_pythag_2",
    statement: "次を計算せよ。$1-\\sin^2\\theta$",
    choices: ["\\cos^2\\theta", "1", "\\sin^2\\theta", "\\tan^2\\theta"],
    answer: "\\cos^2\\theta",
    difficulty: 1,
  },
  {
    id: "trig_pythag_3",
    statement: "次を計算せよ。$1-\\cos^2\\theta$",
    choices: ["\\sin^2\\theta", "1", "\\cos^2\\theta", "\\tan^2\\theta"],
    answer: "\\sin^2\\theta",
    difficulty: 1,
  },
];

export const trigIdentityPythagVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `trig_identity_pythag_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "trig_identity_pythag_basic",
      title: `三角恒等式（変形）${i + 1}`,
      difficulty: c.difficulty,
      tags: [],
    },
    generate() {
      return {
        templateId,
        statement: c.statement,
        answerKind: "choice",
        choices: c.choices,
        params: { caseId: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain() {
      return `測量で用いる関係として、
### この問題の解説
基本恒等式 $\\sin^2\\theta+\\cos^2\\theta=1$ を使います。
答えは **${c.answer}** です。
`;
    },
  };
});
