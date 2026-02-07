// src/lib/course/templates/math2/trig_double_angle_variant_basic.ts
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
  { func: "sin", a: 15, answer: "\\frac{1}{2}", explain: "sin(30^\\circ)=\\frac{1}{2}" },
  { func: "cos", a: 15, answer: "\\frac{\\sqrt{3}}{2}", explain: "cos(30^\\circ)=\\frac{\\sqrt{3}}{2}" },
  { func: "sin", a: 75, answer: "\\frac{1}{2}", explain: "sin(150^\\circ)=\\frac{1}{2}" },
  { func: "cos", a: 75, answer: "-\\frac{\\sqrt{3}}{2}", explain: "cos(150^\\circ)=-\\frac{\\sqrt{3}}{2}" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_double_angle_basic",
      title,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `次を計算せよ。\\n\\n$$${texEq(`\\${c.func}(2\\times${c.a}^\\circ)`, "?")}$$`;
      const choices = [...CHOICES];
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices,
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

export const trigDoubleAngleVariantTemplates: QuestionTemplate[] = Array.from({ length: 20 }, (_, i) =>
  buildTemplate(`trig_double_angle_variant_${i + 1}`, `倍角（別）${i + 1}`)
);
