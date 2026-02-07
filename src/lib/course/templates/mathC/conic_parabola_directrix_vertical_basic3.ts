// src/lib/course/templates/mathC/conic_parabola_directrix_vertical_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, ans: -5 },
  { a: 6, ans: -6 },
  { a: 7, ans: -7 },
  { a: 8, ans: -8 },
];

type Params = {
  a: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_directrix_vertical_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $x^2=4${params.a}y$ の準線の $y$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
放物線 $x^2=4ay$ の準線は $y=-a$。
よって **${p.ans}**。
`;
    },
  };
}

export const conicParabolaDirectrixVerticalExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_vertical_basic3_${i + 1}`, `準線 ${i + 1}`)
);
