// src/lib/course/templates/math2/calculus_area_under_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type AreaParams = {
  m: number;
  b: number;
  area: number;
};

const CASES: AreaParams[] = [
  { m: 2, b: 2, area: 4 },
  { m: 1, b: 4, area: 8 },
  { m: 3, b: 2, area: 6 },
  { m: 4, b: 1, area: 2 },
];

function buildParams(): AreaParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_area_under_line_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.m, 0);
      const statement = `関数 $y=${fx}$ と $x$ 軸で囲まれた面積（区間 $[0,${params.b}]$）を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as AreaParams).area);
    },
    explain(params) {
      const p = params as AreaParams;
      return `
### この問題の解説
三角形の面積なので
$$
\\frac{1}{2}\times${p.b}\times${p.m}=${p.area}
$$
です。答えは **${p.area}** です。
`;
    },
  };
}

export const calcAreaUnderLineTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_area_under_line_basic_${i + 1}`, `直線下の面積 ${i + 1}`)
);
