// src/lib/course/templates/math2/calculus_tangent_line_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  x0: number;
  intercept: number;
};

function buildParams(): Params {
  const a = randInt(1, 5);
  const b = randInt(-5, 5);
  const x0 = randInt(-2, 2);
  const intercept = b; // same line for linear function
  return { a, b, x0, intercept };
}

export const tangentLineVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_tangent_line_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_tangent_line_basic",
      title: `接線の式（一次）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement =
        `一次関数 $f(x)=${fx}$ の接線を $y=mx+k$ とする。` +
        `$x=${params.x0}$ における $k$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).intercept);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
一次関数の接線は元の直線そのものなので、切片は $k=${p.b}$。
答えは **${p.intercept}** です。
`;
    },
  };
});
