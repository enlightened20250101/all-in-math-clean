// src/lib/course/templates/math2/trig_equations_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";
import { texEq } from "@/lib/format/tex";

type TrigCase = {
  eq: string;
  answer: string;
  choices: string[];
  explain: string;
};

const CASES: TrigCase[] = [
  {
    eq: "\\sin x = 0",
    answer: "0°, 180°",
    choices: ["0°, 180°", "90°, 270°", "30°, 150°", "60°, 300°"],
    explain: "0° と 180° で sin x = 0 になります。",
  },
  {
    eq: "\\cos x = 0",
    answer: "90°, 270°",
    choices: ["0°, 180°", "90°, 270°", "30°, 150°", "60°, 300°"],
    explain: "90° と 270° で cos x = 0 になります。",
  },
  {
    eq: "\\tan x = 0",
    answer: "0°, 180°",
    choices: ["0°, 180°", "90°, 270°", "45°, 225°", "60°, 240°"],
    explain: "0° と 180° で tan x = 0 になります。",
  },
  {
    eq: "\\sin x = \\tfrac{1}{2}",
    answer: "30°, 150°",
    choices: ["30°, 150°", "60°, 300°", "90°, 270°", "0°, 180°"],
    explain: "第一・第二象限で sin x = 1/2 なので 30°, 150°。",
  },
  {
    eq: "\\cos x = \\tfrac{1}{2}",
    answer: "60°, 300°",
    choices: ["60°, 300°", "30°, 150°", "0°, 180°", "90°, 270°"],
    explain: "第一・第四象限で cos x = 1/2 なので 60°, 300°。",
  },
  {
    eq: "\\tan x = 1",
    answer: "45°, 225°",
    choices: ["45°, 225°", "135°, 315°", "30°, 210°", "60°, 240°"],
    explain: "tan x = 1 となるのは 45° と 225°。",
  },
  {
    eq: "\\sin x = -\\tfrac{1}{2}",
    answer: "210°, 330°",
    choices: ["210°, 330°", "30°, 150°", "120°, 240°", "300°, 60°"],
    explain: "第三・第四象限で sin x = -1/2 なので 210°, 330°。",
  },
  {
    eq: "\\cos x = -\\tfrac{1}{2}",
    answer: "120°, 240°",
    choices: ["120°, 240°", "60°, 300°", "30°, 150°", "210°, 330°"],
    explain: "第二・第三象限で cos x = -1/2 なので 120°, 240°。",
  },
  {
    eq: "\\tan x = -1",
    answer: "135°, 315°",
    choices: ["135°, 315°", "45°, 225°", "30°, 210°", "60°, 240°"],
    explain: "tan x = -1 となるのは 135° と 315°。",
  },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "trig_equations_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const idx = Math.floor(Math.random() * CASES.length);
      const c = CASES[idx];
      const eqText = c.eq.includes("=") ? c.eq : texEq(c.eq, "0");
      const statement = `次を解け。（$0^\\circ \\le x < 360^\\circ$）\\n\\n$$${eqText}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: c.choices,
        params: { caseId: idx },
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
${c.explain}
答えは **${c.answer}** です。
`;
    },
  };
}

export const trigEquationTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`trig_equations_basic_${i + 1}`, `三角方程式 ${i + 1}`)
);
