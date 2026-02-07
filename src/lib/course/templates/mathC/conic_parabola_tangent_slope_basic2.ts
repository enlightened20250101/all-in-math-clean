// src/lib/course/templates/mathC/conic_parabola_tangent_slope_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 1, t: 2, ans: 2 },
  { a: 2, t: 1, ans: 1 },
  { a: 3, t: -2, ans: -2 },
  { a: 4, t: -1, ans: -1 },
];

type Params = {
  a: number;
  t: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_parabola_tangent_slope_basic",
      title,
      difficulty: 1,
      tags: ["conic", "parabola", "tangent"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $y^2=4${params.a}x$ の点 $(at^2,2at)$ における接線の傾きを求めよ。（$t=${params.t}$）`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).ans);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
接線は $ty=x+at^2$、傾きは $t$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicParabolaTangentSlopeExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_slope_basic2_${i + 1}`, `接線の傾き ${i + 1}`)
);
