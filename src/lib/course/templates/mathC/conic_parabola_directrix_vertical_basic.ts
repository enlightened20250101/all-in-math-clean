// src/lib/course/templates/mathC/conic_parabola_directrix_vertical_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { p: 1, directrix: -1 },
  { p: 2, directrix: -2 },
  { p: 3, directrix: -3 },
  { p: 4, directrix: -4 },
  { p: 5, directrix: -5 },
  { p: 6, directrix: -6 },
];

type Params = {
  p: number;
  directrix: number;
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
      const statement = `測定で得た放物線 $x^2=4${params.p}y$ の準線の方程式の定数項を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).directrix);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$x^2=4py$ の準線は $y=-p$。
よって定数項は **${p.directrix}**。
`;
    },
  };
}

export const conicParabolaDirectrixVerticalTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_vertical_basic_${i + 1}`, `準線 ${i + 1}`)
);

const extraParabolaDirectrixVerticalTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_parabola_directrix_vertical_basic_${i + 7}`, `準線 追加${i + 1}`)
);

conicParabolaDirectrixVerticalTemplates.push(...extraParabolaDirectrixVerticalTemplates);
