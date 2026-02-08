// src/lib/course/templates/math2/calculus_tangent_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2, texEq } from "@/lib/format/tex";

type TangentParams = {
  a: number;
  b: number;
  c: number;
  x0: number;
  slope: number;
  intercept: number;
};

function buildParams(): TangentParams {
  const a = pick([-2, -1, 1, 2]);
  const b = randInt(-3, 3);
  const c = randInt(-3, 3);
  const x0 = randInt(-2, 2);
  const slope = 2 * a * x0 + b;
  const fx0 = a * x0 * x0 + b * x0 + c;
  const intercept = fx0 - slope * x0;
  return { a, b, c, x0, slope, intercept };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_tangent_line_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const poly = texPoly2(params.a, params.b, params.c);
      const statement =
        `放物線 $f(x)=${poly}$ 上の点 $x=${params.x0}$ における接線を $y=mx+k$ とする。` +
        `切片 $k$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as TangentParams).intercept);
    },
    explain(params) {
      const p = params as TangentParams;
      return `
### この問題の解説
導関数は $f'(x)=2ax+b$ なので、
$$
${texEq("m", String(p.slope))}
$$
となります。接点は $x=${p.x0}$ なので
$$
${texEq("k", String(p.intercept))}
$$
です。答えは **${p.intercept}** です。
`;
    },
  };
}

export const tangentLineTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_tangent_line_basic_${i + 1}`, `接線の式 ${i + 1}`)
);
