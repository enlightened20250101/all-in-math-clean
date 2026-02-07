// src/lib/course/templates/mathC/conic_ellipse_focus_basic.ts
import type { QuestionTemplate } from "../../types";
import { texEq } from "@/lib/format/tex";

const CHOICES = ["1", "2", "3", "4", "\\sqrt{5}", "\\sqrt{13}"];

type Case = {
  a2: number;
  b2: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { a2: 9, b2: 4, answer: "\\sqrt{5}", explain: "c^2=9-4=5" },
  { a2: 25, b2: 9, answer: "4", explain: "c^2=25-9=16" },
  { a2: 13, b2: 4, answer: "3", explain: "c^2=13-4=9" },
  { a2: 20, b2: 7, answer: "\\sqrt{13}", explain: "c^2=20-7=13" },
  { a2: 10, b2: 9, answer: "1", explain: "c^2=10-9=1" },
  { a2: 16, b2: 12, answer: "2", explain: "c^2=16-12=4" },
  { a2: 21, b2: 12, answer: "3", explain: "c^2=21-12=9" },
  { a2: 20, b2: 16, answer: "2", explain: "c^2=20-16=4" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_focus_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const statement = `楕円 $\\frac{x^2}{${c.a2}}+\\frac{y^2}{${c.b2}}=1$ の焦点距離 $c$ を求めよ。`;
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
      const c2 = c.a2 - c.b2;
      return `
### この問題の解説
楕円では $c^2=a^2-b^2$ なので
$$
${texEq("c^2", `${c.a2}-${c.b2}=${c2}`)}
$$
となり、答えは **${c.answer}** です。
`;
    },
  };
}

export const conicEllipseFocusTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_focus_basic_${i + 1}`, `楕円の焦点 ${i + 1}`)
);

const extraEllipseFocusTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_ellipse_focus_basic_${i + 7}`, `楕円の焦点 追加${i + 1}`)
);

conicEllipseFocusTemplates.push(...extraEllipseFocusTemplates);
