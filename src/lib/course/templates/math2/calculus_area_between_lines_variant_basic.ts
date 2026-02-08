// src/lib/course/templates/math2/calculus_area_between_lines_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texFrac, texLinear } from "@/lib/format/tex";

type Params = {
  m: number;
  b: number;
  a: number;
  area: number;
};

function buildParams(): Params {
  const m = randInt(1, 4);
  const b = randInt(1, 6);
  const a = randInt(1, 4);
  const area = (m * a * a) / 2 + b * a;
  return { m, b, a, area };
}

export const calcAreaBetweenLinesVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_between_lines_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_between_lines_basic",
      title: `直線とx軸の面積（区間指定）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const line = texLinear(params.m, params.b);
      const statement =
        `直線 $y=${line}$ と $x$ 軸で囲まれる部分のうち、` +
        `$0\\le x\\le ${params.a}$ の面積を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).area);
    },
    explain(params) {
      const p = params as Params;
      const term1 = texFrac(p.m * p.a * p.a, 2);
      return `
### この問題の解説
面積は
$$
\\int_0^{${p.a}} (${p.m}x+${p.b})\\,dx = \\frac{${p.m}x^2}{2}\\Big|_0^{${p.a}} + ${p.b}x\\Big|_0^{${p.a}}
$$
より $${term1}+${p.b}\\cdot${p.a}=${p.area}$$。
答えは **${p.area}** です。
`;
    },
  };
});
