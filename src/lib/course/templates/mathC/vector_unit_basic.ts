// src/lib/course/templates/mathC/vector_unit_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["(\\frac{3}{5},\\frac{4}{5})", "(\\frac{4}{5},\\frac{3}{5})", "(\\frac{5}{13},\\frac{12}{13})", "(\\frac{12}{13},\\frac{5}{13})"];

type Case = {
  ax: number;
  ay: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { ax: 3, ay: 4, answer: CHOICES[0], explain: "長さは5" },
  { ax: 4, ay: 3, answer: CHOICES[1], explain: "長さは5" },
  { ax: 5, ay: 12, answer: CHOICES[2], explain: "長さは13" },
  { ax: 12, ay: 5, answer: CHOICES[3], explain: "長さは13" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "vector_unit_basic",
      title,
      difficulty: 1,
      tags: ["vector", "unit", "ct"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `ベクトル $\\vec{a}=(${c.ax},${c.ay})$ の単位ベクトルを求めよ。`;
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
${c.explain} なので、各成分を長さで割ります。
答えは **${c.answer}** です。
`;
    },
  };
}

export const vectorUnitTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) =>
  buildTemplate(`vector_unit_basic_${i + 1}`, `単位ベクトル ${i + 1}`)
);

const extraVectorUnitTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`vector_unit_basic_${i + 21}`, `単位ベクトル 追加${i + 1}`)
);

vectorUnitTemplates.push(...extraVectorUnitTemplates);
