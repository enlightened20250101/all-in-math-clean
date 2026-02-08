// src/lib/course/templates/math2/calculus_tangent_slope_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = { a: number; b: number; x0: number; value: number };

function buildParams(): Params {
  const a = randInt(1, 5);
  const b = randInt(-5, 5);
  const x0 = randInt(-2, 3);
  const value = a;
  return { a, b, x0, value };
}

export const tangentSlopeVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_tangent_slope_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_tangent_slope_basic",
      title: `接線の傾き（一次）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement =
        `速度の変化率を考える。関数 $f(x)=${texLinear(params.a, params.b)}$ の $x=${params.x0}$ における接線の傾きを求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
一次関数の傾きは常に $${p.a}$ です。答えは **${p.a}** です。
`;
    },
  };
});
