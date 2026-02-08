// src/lib/course/templates/math2/trig_identity_tan_variant_basic.ts
import type { QuestionTemplate } from "../../types";

type Case = {
  id: string;
  angle: number;
  answer: string;
  difficulty: 1 | 2 | 3;
};

const CASES: Case[] = [
  { id: "trig_tan_30", angle: 30, answer: "\\frac{\\sqrt{3}}{3}", difficulty: 1 },
  { id: "trig_tan_45", angle: 45, answer: "1", difficulty: 1 },
  { id: "trig_tan_60", angle: 60, answer: "\\sqrt{3}", difficulty: 1 },
];

const CHOICES = ["0", "1", "-1", "\\frac{\\sqrt{3}}{3}", "\\sqrt{3}"];

export const trigIdentityTanVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `trig_identity_tan_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "trig_identity_tan_basic",
      title: `tanの値（角度違い）${i + 1}`,
      difficulty: c.difficulty,
      tags: [],
    },
    generate() {
      const statement = `測量で用いる関係として、次を計算せよ。$\\tan ${c.angle}^\\circ$`;
      return {
        templateId,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { angleIndex: i % CASES.length },
      };
    },
    grade(_params, userAnswer) {
      return { isCorrect: userAnswer === c.answer, correctAnswer: c.answer };
    },
    explain() {
      return `
### この問題の解説
$\\tan ${c.angle}^\\circ=${c.answer}$ です。
答えは **${c.answer}** です。
`;
    },
  };
});
