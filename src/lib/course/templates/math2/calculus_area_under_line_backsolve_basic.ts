// src/lib/course/templates/math2/calculus_area_under_line_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  m: number;
  b: number;
  area: number;
};

function buildParams(): Params {
  const m = pick([1, 2, 3, 4]);
  const b = randInt(2, 6);
  const area = (m * b * b) / 2;
  return { m, b, area };
}

export const calcAreaUnderLineBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_under_line_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_under_line_basic",
      title: `直線下の面積（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.m, 0);
      const statement = `関数 $y=${fx}$ と $x$ 軸で囲まれた面積が ${params.area} のとき、区間 $[0,b]$ の $b$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
面積は $\\frac{1}{2}mb^2$ なので
$$
\\frac{1}{2}\\cdot${p.m}\\cdot b^2=${p.area}
$$
より $b=${p.b}$。答えは **${p.b}** です。
`;
    },
  };
});
