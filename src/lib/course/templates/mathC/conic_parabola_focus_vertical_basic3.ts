// src/lib/course/templates/mathC/conic_parabola_focus_vertical_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, ans: 5 },
  { a: 6, ans: 6 },
  { a: 7, ans: 7 },
  { a: 8, ans: 8 },
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
      topicId: "conic_parabola_focus_vertical_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $x^2=4${params.a}y$ の焦点の $y$ 座標を求めよ。`;
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
放物線 $x^2=4ay$ の焦点は $(0,a)$。
よって **${p.ans}**。
`;
    },
  };
}

export const conicParabolaFocusVerticalExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_focus_vertical_basic3_${i + 1}`, `焦点 ${i + 1}`)
);
