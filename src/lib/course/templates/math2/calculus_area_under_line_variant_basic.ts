// src/lib/course/templates/math2/calculus_area_under_line_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  m: number;
  b: number;
  a: number;
  area: number;
};

function buildParams(): Params {
  const m = randInt(1, 4);
  const b = randInt(0, 5);
  const a = randInt(1, 5);
  const area = (m * a * a) / 2 + b * a;
  return { m, b, a, area };
}

export const calcAreaUnderLineVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_under_line_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_under_line_basic",
      title: `直線下の面積（区間指定）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const line = texLinear(params.m, params.b);
      const statement =
        `直線 $y=${line}$ と $x$ 軸に囲まれる部分のうち、` +
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
      return `
### この問題の解説
$$
\\int_0^{${p.a}} (${p.m}x+${p.b})\\,dx
$$
を計算して、面積は ${p.area} です。答えは **${p.area}** です。
`;
    },
  };
});
