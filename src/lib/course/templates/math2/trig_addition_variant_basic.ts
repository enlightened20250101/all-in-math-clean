// src/lib/course/templates/math2/trig_addition_variant_basic.ts
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
  "\\frac{\\sqrt{6}+\\sqrt{2}}{4}",
  "\\frac{\\sqrt{6}-\\sqrt{2}}{4}",
];

type Case = {
  func: "sin" | "cos";
  a: number;
  b: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { func: "sin", a: 45, b: 30, answer: "\\frac{\\sqrt{6}+\\sqrt{2}}{4}", explain: "sin(45+30)=sin75" },
  { func: "cos", a: 45, b: 30, answer: "\\frac{\\sqrt{6}-\\sqrt{2}}{4}", explain: "cos(45+30)=cos75" },
  { func: "sin", a: 60, b: 30, answer: "1", explain: "sin90=1" },
  { func: "cos", a: 60, b: 30, answer: "0", explain: "cos90=0" },
  { func: "sin", a: 30, b: 45, answer: "\\frac{\\sqrt{6}+\\sqrt{2}}{4}", explain: "sin75" },
  { func: "cos", a: 30, b: 45, answer: "\\frac{\\sqrt{6}-\\sqrt{2}}{4}", explain: "cos75" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_addition_basic",
      title,
      difficulty: 2,
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

export const trigAdditionVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) =>
  buildTemplate(`trig_addition_variant_${i + 1}`, `加法定理（別）${i + 1}`)
);
