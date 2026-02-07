// src/lib/course/templates/math2/calculus_area_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texTerm, normalizeSigns } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  x2: number;
  value: number;
};

function buildParams(): Params {
  const a = randInt(0, 4);
  const b = randInt(0, 6);
  const x2 = randInt(1, 4);
  const value = (a / 2) * (x2 * x2) + b * x2;
  return { a, b, x2, value };
}

export const areaBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_area_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_area_basic",
      title: `面積（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const ax = texTerm(params.a, "x", true);
      const fx = normalizeSigns(ax && ax !== "0" ? `${ax} + b` : "b");
      const statement = `次を満たす $b$ を求めよ。\\n\\n$$\\int_{0}^{${params.x2}} (${fx})\\,dx=${params.value}$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).b);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$$
\\int_0^{${p.x2}} (${p.a}x+b)\\,dx=\\frac{${p.a}}{2}${p.x2}^2+b${p.x2}
$$
より $b=${p.b}$。答えは **${p.b}** です。
`;
    },
  };
});
