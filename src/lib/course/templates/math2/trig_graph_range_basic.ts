// src/lib/course/templates/math2/trig_graph_range_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = ["[-1,1]", "[0,1]", "[-2,2]", "[-3,3]", "[-4,4]", "[-5,5]"];

type Case = {
  a: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { a: 1, answer: "[-1,1]", explain: "振幅1" },
  { a: 2, answer: "[-2,2]", explain: "振幅2" },
  { a: 3, answer: "[-3,3]", explain: "振幅3" },
  { a: 4, answer: "[-4,4]", explain: "振幅4" },
  { a: 5, answer: "[-5,5]", explain: "振幅5" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_graph_range_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const func = Math.random() < 0.5 ? "sin" : "cos";
      const aText = c.a === 1 ? "" : `${c.a}`;
      const statement = `波のモデル $y=${aText}\\${func} x$ の値域を求めよ。`;
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
${c.explain} なので値域は **${c.answer}** です。
`;
    },
  };
}

export const trigGraphRangeTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_graph_range_basic_${i + 1}`, `値域 ${i + 1}`)
);
