// src/lib/course/templates/math2/trig_identity_pythag_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["1", "0", "2", "\\frac{1}{2}"];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_identity_pythag_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const statement = `単位円の関係を用いて計算せよ。$\\sin^2\\theta+\\cos^2\\theta=?$`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { caseId: 0 },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === "1", correctAnswer: "1" };
    },
    explain() {
      return `
### この問題の解説
基本恒等式より $\\sin^2\\theta+\\cos^2\\theta=1$ です。
答えは **1** です。
`;
    },
  };
}

export const trigIdentityPythagTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_identity_pythag_basic_${i + 1}`, `三角恒等式 ${i + 1}`)
);
