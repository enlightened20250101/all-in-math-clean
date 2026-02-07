// src/lib/course/templates/math2/calculus_tangent_value_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  x0: number;
  y0: number;
};

function buildParams(): Params {
  const a = randInt(1, 5);
  const b = randInt(-5, 5);
  const x0 = randInt(-2, 2);
  const y0 = a * x0 + b;
  return { a, b, x0, y0 };
}

export const tangentValueVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_tangent_value_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_tangent_value_basic",
      title: `接点の座標（一次）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `関数 $f(x)=${texLinear(params.a, params.b)}$ の $x=${params.x0}$ における接点の $y$ 座標を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).y0);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
接点の $y$ 座標は $f(${p.x0})=${p.y0}$。
答えは **${p.y0}** です。
`;
    },
  };
});
