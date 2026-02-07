// src/lib/course/templates/math2/calculus_area_between_parabola_basic.ts
import type { QuestionTemplate } from "../../types";
const CHOICES = ["\\frac{32}{3}", "\\frac{16}{3}", "16", "8"];
const ANSWER = "\\frac{32}{3}";

type AreaParams = { caseId: number };

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_area_between_parabola_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const statement = `曲線 $y=x^2$ と直線 $y=4$ に囲まれた面積を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "choice",
        choices: CHOICES,
        params: { caseId: 0 },
      };
    },
    grade(params, userAnswer) {
      return { isCorrect: userAnswer === ANSWER, correctAnswer: ANSWER };
    },
    explain() {
      return `
### この問題の解説
交点は $x=\pm2$ なので、
$$
\int_{-2}^2 (4-x^2)\,dx=\left[4x-\\frac{x^3}{3}\right]_{-2}^{2}=\\frac{32}{3}
$$
です。答えは **${ANSWER}** です。
`;
    },
  };
}

export const calcAreaBetweenParabolaTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_area_between_parabola_basic_${i + 1}`, `放物線と直線の面積 ${i + 1}`)
);
