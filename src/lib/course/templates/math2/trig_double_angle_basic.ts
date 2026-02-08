// src/lib/course/templates/math2/trig_double_angle_basic.ts
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
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", a: 30, answer: "\\frac{\\sqrt{3}}{2}", explain: "sin(2\u00d730^\\circ)=sin60^\\circ" },
  { func: "cos", a: 30, answer: "\\frac{1}{2}", explain: "cos(2\u00d730^\\circ)=cos60^\\circ" },
  { func: "sin", a: 45, answer: "1", explain: "sin(2\u00d745^\\circ)=sin90^\\circ" },
  { func: "cos", a: 45, answer: "0", explain: "cos(2\u00d745^\\circ)=cos90^\\circ" },
  { func: "sin", a: 60, answer: "\\frac{\\sqrt{3}}{2}", explain: "sin(2\u00d760^\\circ)=sin120^\\circ" },
  { func: "cos", a: 60, answer: "-\\frac{1}{2}", explain: "cos(2\u00d760^\\circ)=cos120^\\circ" },
  { func: "sin", a: 90, answer: "0", explain: "sin(2\u00d790^\\circ)=sin180^\\circ" },
  { func: "cos", a: 90, answer: "-1", explain: "cos(2\u00d790^\\circ)=cos180^\\circ" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_double_angle_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement =
        `倍角の計算として次を求めよ。\\n\\n$$${texEq(`\\${c.func}(2\\times${c.a}^\\circ)`, "?")}$$`;
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
$${texEq(`\\${c.func}(2\\times${c.a}^\\circ)`, c.answer)}$$
${c.explain}

答えは **${c.answer}** です。
`;
    },
  };
}

export const trigDoubleAngleTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`trig_double_angle_basic_${i + 1}`, `倍角 ${i + 1}`)
);
