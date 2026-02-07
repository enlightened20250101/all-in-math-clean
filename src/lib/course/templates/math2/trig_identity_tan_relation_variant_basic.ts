// src/lib/course/templates/math2/trig_identity_tan_relation_variant_basic.ts
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
    id: "trig_tan_rel_1",
    statement: "次を計算せよ。$\\frac{\\sin\\theta}{\\cos\\theta}$",
    choices: ["\\tan\\theta", "\\cot\\theta", "\\sin\\theta", "\\cos\\theta"],
    answer: "\\tan\\theta",
    difficulty: 1,
  },
  {
    id: "trig_tan_rel_2",
    statement: "次を計算せよ。$\\frac{1}{\\cos^2\\theta}-1$",
    choices: ["\\tan^2\\theta", "\\sin^2\\theta", "\\cos^2\\theta", "1"],
    answer: "\\tan^2\\theta",
    difficulty: 2,
  },
  {
    id: "trig_tan_rel_3",
    statement: "次を計算せよ。$1-\\frac{1}{\\cos^2\\theta}$",
    choices: ["-\\tan^2\\theta", "\\tan^2\\theta", "-\\sin^2\\theta", "0"],
    answer: "-\\tan^2\\theta",
    difficulty: 2,
  },
];

export const trigIdentityTanRelationVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const c = CASES[i % CASES.length];
  const templateId = `trig_identity_tan_relation_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "trig_identity_tan_relation_basic",
      title: `tan関係式（変形）${i + 1}`,
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
      return `
### この問題の解説
三角関数の基本関係式を用います。答えは **${c.answer}** です。
`;
    },
  };
});
