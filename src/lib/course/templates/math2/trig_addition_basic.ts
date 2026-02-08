// src/lib/course/templates/math2/trig_addition_basic.ts
import type { QuestionTemplate } from "../../types";
import { texEq } from "@/lib/format/tex";

const CHOICES = [
  "1",
  "0",
  "-1",
  "\\frac{1}{2}",
  "-\\frac{1}{2}",
  "\\frac{\\sqrt{2}}{2}",
  "-\\frac{\\sqrt{2}}{2}",
  "\\frac{\\sqrt{3}}{2}",
  "-\\frac{\\sqrt{3}}{2}",
];

type Case = {
  func: "sin" | "cos";
  a: number;
  b: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", a: 30, b: 60, answer: "1", explain: "sin(30^\\circ+60^\\circ)=sin90^\\circ=1" },
  { func: "cos", a: 30, b: 60, answer: "0", explain: "cos(30^\\circ+60^\\circ)=cos90^\\circ=0" },
  { func: "sin", a: 45, b: 45, answer: "1", explain: "sin(45^\\circ+45^\\circ)=sin90^\\circ=1" },
  { func: "cos", a: 45, b: 45, answer: "0", explain: "cos(45^\\circ+45^\\circ)=cos90^\\circ=0" },
  { func: "sin", a: 60, b: 60, answer: "\\frac{\\sqrt{3}}{2}", explain: "sin120^\\circ=\\frac{\\sqrt{3}}{2}" },
  { func: "cos", a: 60, b: 60, answer: "-\\frac{1}{2}", explain: "cos120^\\circ=-\\frac{1}{2}" },
  { func: "sin", a: 30, b: 30, answer: "\\frac{1}{2}", explain: "sin60^\\circ=\\frac{1}{2}" },
  { func: "cos", a: 30, b: 30, answer: "\\frac{1}{2}", explain: "cos60^\\circ=\\frac{1}{2}" },
  { func: "sin", a: 90, b: 30, answer: "\\frac{\\sqrt{3}}{2}", explain: "sin120^\\circ=\\frac{\\sqrt{3}}{2}" },
  { func: "cos", a: 90, b: 30, answer: "-\\frac{1}{2}", explain: "cos120^\\circ=-\\frac{1}{2}" },
  { func: "sin", a: 90, b: 60, answer: "\\frac{1}{2}", explain: "sin150^\\circ=\\frac{1}{2}" },
  { func: "cos", a: 90, b: 60, answer: "-\\frac{\\sqrt{3}}{2}", explain: "cos150^\\circ=-\\frac{\\sqrt{3}}{2}" },
  { func: "sin", a: 120, b: 60, answer: "0", explain: "sin180^\\circ=0" },
  { func: "cos", a: 120, b: 60, answer: "-1", explain: "cos180^\\circ=-1" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_addition_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement =
        `角度の合成として次を計算せよ。\\n\\n$$${texEq(`\\${c.func}(${c.a}^\\circ+${c.b}^\\circ)`, "?")}$$`;
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
加法定理を使って
$${texEq(`\\${c.func}(${c.a}^\\circ+${c.b}^\\circ)`, c.answer)}$$
となります。${c.explain}

答えは **${c.answer}** です。
`;
    },
  };
}

export const trigAdditionTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_addition_basic_${i + 1}`, `加法定理 ${i + 1}`)
);
