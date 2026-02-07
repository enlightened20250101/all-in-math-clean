// src/lib/course/templates/math2/calculus_area_between_parabola_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { pick } from "../_shared/utils";
import { texFrac } from "@/lib/format/tex";

type Params = {
  m: number;
};

function buildParams(): Params {
  const m = pick([1, 2, 3, 4]);
  return { m };
}

function buildChoices(correct: string, m: number): string[] {
  const wrong1 = texFrac(2 * m ** 3, 3);
  const wrong2 = texFrac(4 * m ** 2, 3);
  const wrong3 = `${4 * m ** 3}`;
  return [correct, wrong1, wrong2, wrong3];
}

export const calcAreaBetweenParabolaVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_between_parabola_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_between_parabola_basic",
      title: `放物線と直線の面積（変形）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const c = params.m ** 2;
      const value = texFrac(4 * params.m ** 3, 3);
      const statement = `曲線 $y=x^2$ と直線 $y=${c}$ に囲まれた面積を求めよ。`;
      const choices = buildChoices(value, params.m);
      return {
        templateId,
        statement,
        answerKind: "choice",
        choices,
        params,
      };
    },
    grade(params, userAnswer) {
      const m = (params as Params).m;
      const correct = texFrac(4 * m ** 3, 3);
      return { isCorrect: userAnswer === correct, correctAnswer: correct };
    },
    explain(params) {
      const p = params as Params;
      const c = p.m ** 2;
      const value = texFrac(4 * p.m ** 3, 3);
      return `
### この問題の解説
交点は $x=\\pm${p.m}$。よって
$$
\\int_{-${p.m}}^{${p.m}} (${c}-x^2)\\,dx = ${value}
$$
答えは **${value}** です。
`;
    },
  };
});
