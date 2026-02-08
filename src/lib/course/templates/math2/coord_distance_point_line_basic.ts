// src/lib/course/templates/math2/coord_distance_point_line_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { normalizeSigns, texLinear } from "@/lib/format/tex";

const COEFFS = [
  { a: 3, b: 4, p: 5 },
  { a: 4, b: 3, p: 5 },
  { a: 5, b: 12, p: 13 },
  { a: 12, b: 5, p: 13 },
];

type Params = {
  a: number;
  b: number;
  c: number;
  x0: number;
  y0: number;
  d: number;
};

function buildParams(): Params {
  const coeff = pick(COEFFS);
  const x0 = randInt(-3, 3);
  const y0 = randInt(-3, 3);
  const d = randInt(1, 4);
  const c = d * coeff.p - (coeff.a * x0 + coeff.b * y0);
  return { a: coeff.a, b: coeff.b, c, x0, y0, d };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "coord_distance_point_line_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const ax = texLinear(params.a, 0, "x");
      const by = texLinear(params.b, 0, "y");
      let expr = normalizeSigns(`${ax} + ${by}`);
      if (params.c !== 0) {
        const sign = params.c > 0 ? "+" : "-";
        expr = normalizeSigns(`${expr} ${sign} ${Math.abs(params.c)}`);
      }
      const statement =
        `壁を直線 $${expr}=0$ とみなす。` +
        `点 $(${params.x0},${params.y0})$ から壁までの距離を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).d);
    },
    explain(params) {
      const p = params as Params;
      const denom = Math.round(Math.sqrt(p.a ** 2 + p.b ** 2));
      return `
### この問題の解説
距離は
$$
\\frac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}
$$
ここでは $\\sqrt{a^2+b^2}=${denom}$ なので
距離は **${p.d}** です。
`;
    },
  };
}

export const coordDistancePointLineTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`coord_distance_point_line_basic_${i + 1}`, `点と直線の距離 ${i + 1}`)
);
