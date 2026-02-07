// src/lib/course/templates/mathC/conic_parabola_directrix_basic.ts
import type { QuestionTemplate } from "../../types";

const CHOICES = [
  "x=-4",
  "x=-3",
  "x=-2",
  "x=-1",
  "x=1",
  "x=2",
  "y=-4",
  "y=-3",
  "y=-2",
  "y=-1",
  "y=1",
  "y=2",
];

type Case = {
  axis: "x" | "y";
  p: number;
  answer: string;
  explain: string;
};

const CASES: Case[] = [
  { axis: "x", p: 1, answer: "x=-1", explain: "y^2=4px なので準線は x=-p" },
  { axis: "x", p: 2, answer: "x=-2", explain: "y^2=4px なので準線は x=-p" },
  { axis: "y", p: 1, answer: "y=-1", explain: "x^2=4py なので準線は y=-p" },
  { axis: "y", p: 2, answer: "y=-2", explain: "x^2=4py なので準線は y=-p" },
  { axis: "x", p: 3, answer: "x=-3", explain: "y^2=4px なので準線は x=-p" },
  { axis: "x", p: 4, answer: "x=-4", explain: "y^2=4px なので準線は x=-p" },
  { axis: "y", p: 3, answer: "y=-3", explain: "x^2=4py なので準線は y=-p" },
  { axis: "y", p: 4, answer: "y=-4", explain: "x^2=4py なので準線は y=-p" },
];

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_directrix_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const caseId = Math.floor(Math.random() * CASES.length);
      const c = CASES[caseId];
      const equation = c.axis === "x" ? `y^2=${4 * c.p}x` : `x^2=${4 * c.p}y`;
      const statement = `放物線 $${equation}$ の準線を求めよ。`;
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
${c.explain}
答えは **${c.answer}** です。
`;
    },
  };
}

export const conicParabolaDirectrixTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_basic_${i + 1}`, `放物線の準線 ${i + 1}`)
);

const extraParabolaDirectrixTemplates: QuestionTemplate[] = Array.from({ length: 44 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_basic_${i + 7}`, `放物線の準線 追加${i + 1}`)
);

conicParabolaDirectrixTemplates.push(...extraParabolaDirectrixTemplates);
