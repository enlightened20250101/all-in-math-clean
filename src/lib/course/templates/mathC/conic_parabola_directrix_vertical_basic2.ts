// src/lib/course/templates/mathC/conic_parabola_directrix_vertical_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 1, ans: -1 },
  { a: 2, ans: -2 },
  { a: 3, ans: -3 },
  { a: 4, ans: -4 },
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
      const statement = `測定で得た放物線 $x^2=4${params.a}y$ の準線の $y$ 座標を求めよ。`;
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
測定で得た放物線 $x^2=4ay$ の準線は $y=-a$。
よって **${p.ans}**。
`;
    },
  };
}

export const conicParabolaDirectrixVerticalExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_vertical_basic2_${i + 1}`, `準線 ${i + 1}`)
);
