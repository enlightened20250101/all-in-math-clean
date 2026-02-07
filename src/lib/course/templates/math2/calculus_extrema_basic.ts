// src/lib/course/templates/math2/calculus_extrema_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type ExtremaParams = { a: number; b: number; c: number; x0: number; value: number };

function buildParams(): ExtremaParams {
  const a = pick([1, 2, -1, -2]);
  const b = randInt(-4, 4);
  const c = randInt(-4, 4);
  const x0 = -b / (2 * a);
  const value = a * x0 * x0 + b * x0 + c;
  return { a, b, c, x0, value };
}

function explain(params: ExtremaParams) {
  return `
### この問題の解説
$$
f(x)=${texPoly2(params.a, params.b, params.c)}
$$
頂点の $x$ 座標は $x=-\\frac{b}{2a}=${params.x0}$。
極値は
$$
f(${params.x0})=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_extrema_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `関数 $f(x)=${texPoly2(params.a, params.b, params.c)}$ の極値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as ExtremaParams).value);
    },
    explain(params) {
      return explain(params as ExtremaParams);
    },
  };
}

export const extremaTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_extrema_basic_${i + 1}`, `極値 ${i + 1}`)
);
