// src/lib/course/templates/math2/calculus_tangent_value_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type TangentValueParams = {
  a: number;
  b: number;
  c: number;
  x0: number;
  y0: number;
};

function buildParams(): TangentValueParams {
  const a = pick([-2, -1, 1, 2]);
  const b = randInt(-3, 3);
  const c = randInt(-3, 3);
  const x0 = randInt(-2, 2);
  const y0 = a * x0 * x0 + b * x0 + c;
  return { a, b, c, x0, y0 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_tangent_value_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.a, params.b, params.c);
      const statement = `関数 $f(x)=${poly}$ の $x=${params.x0}$ における接点の $y$ 座標を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as TangentValueParams).y0);
    },
    explain(params) {
      const p = params as TangentValueParams;
      return `
### この問題の解説
接点の $y$ 座標は $f(${p.x0})$ なので ${p.y0} です。
答えは **${p.y0}** です。
`;
    },
  };
}

export const tangentValueTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_tangent_value_basic_${i + 1}`, `接点の座標 ${i + 1}`)
);
