// src/lib/course/templates/math2/trig_identity_tan_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["1", "0", "-1", "\\frac{1}{2}", "\\frac{\\sqrt{3}}{3}"];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_identity_tan_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const statement = `斜面の傾きを表す値として次を計算せよ。$\\tan 30^\\circ$`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { caseId: 0 },
      };
    },
    grade(_params, userAnswer) {
      const correct = "\\frac{\\sqrt{3}}{3}";
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain() {
      return `
### この問題の解説
$\\tan 30^\\circ=\\frac{\\sqrt{3}}{3}$ です。
答えは **\\frac{\\sqrt{3}}{3}** です。
`;
    },
  };
}

export const trigIdentityTanTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_identity_tan_basic_${i + 1}`, `tanの値 ${i + 1}`)
);
