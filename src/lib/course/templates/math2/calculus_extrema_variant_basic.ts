// src/lib/course/templates/math2/calculus_extrema_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type Params = { a: number; b: number; c: number; x0: number };

function buildParams(): Params {
  const a = randInt(1, 3);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const x0 = -b / (2 * a);
  return { a, b, c, x0 };
}

export const extremaVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_extrema_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_extrema_basic",
      title: `極値（x座標）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `関数 $f(x)=${texPoly2(params.a, params.b, params.c)}$ の極値をとる $x$ 座標を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).x0);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
頂点の $x$ 座標は $x=-\\frac{b}{2a}$。
よって $x=${p.x0}$。答えは **${p.x0}** です。
`;
    },
  };
});
