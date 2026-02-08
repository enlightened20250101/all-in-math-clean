// src/lib/course/templates/math2/calculus_tangent_slope_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type TangentParams = { a: number; b: number; c: number; x0: number; value: number };

function buildParams(): TangentParams {
  const a = pick([1, 2, 3]);
  const b = randInt(-5, 5);
  const c = randInt(-5, 5);
  const x0 = randInt(-2, 3);
  const value = 2 * a * x0 + b;
  return { a, b, c, x0, value };
}

function explain(params: TangentParams) {
  return `
### この問題の解説
接線の傾きは $f'(x_0)$ です。
$$
f'(x)=${2 * params.a}x+${params.b}
$$
よって
$$
f'(${params.x0})=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_tangent_slope_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement =
        `位置の変化率（速度）を求める。関数 $f(x)=${texPoly2(params.a, params.b, params.c)}$ の $x=${params.x0}$ における接線の傾きを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as TangentParams).value);
    },
    explain(params) {
      return explain(params as TangentParams);
    },
  };
}

export const tangentSlopeTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_tangent_slope_basic_${i + 1}`, `接線の傾き ${i + 1}`)
);
