// src/lib/course/templates/mathC/complex_argument_axis_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["0^\\circ", "90^\\circ", "180^\\circ", "270^\\circ"];

type Case = {
  a: number;
  b: number;
  answer: string;
};

const CASES: Case[] = [
  { a: 1, b: 0, answer: "0^\\circ" },
  { a: 0, b: 1, answer: "90^\\circ" },
  { a: -1, b: 0, answer: "180^\\circ" },
  { a: 0, b: -1, answer: "270^\\circ" },
];

function texComplex(a: number, b: number) {
  const sign = b >= 0 ? "+" : "-";
  return `${a}${sign}${Math.abs(b)}i`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "complex_argument_axis_basic",
      title,
      difficulty: 1,
      tags: ["complex", "argument"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `観測点を表す複素数 $z=${texComplex(c.a, c.b)}$ の点の偏角を求めよ。`;
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
軸上の点なので点の偏角は **${c.answer}** です。
`;
    },
  };
}

export const complexArgumentAxisTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`complex_argument_axis_basic_${i + 1}`, `点の偏角（軸上） ${i + 1}`)
);

const extraArgumentAxisTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`complex_argument_axis_basic_${i + 7}`, `点の偏角（軸上） 追加${i + 1}`)
);

complexArgumentAxisTemplates.push(...extraArgumentAxisTemplates);
