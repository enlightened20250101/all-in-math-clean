// src/lib/course/templates/mathC/conic_parabola_tangent_slope_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { p: 1, t: 1, m: 1 },
  { p: 1, t: 2, m: 2 },
  { p: 2, t: 1, m: 1 / 2 },
  { p: 3, t: 1, m: 1 / 3 },
  { p: 1, t: 3, m: 3 },
  { p: 2, t: 2, m: 1 },
  { p: 3, t: 3, m: 1 },
  { p: 4, t: 4, m: 1 },
];

type Params = {
  p: number;
  t: number;
  m: number;
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
      tags: ["conic", "parabola"],
    },
    generate() {
      const params = buildParams();
      const statement = `放物線 $y^2=4${params.p}x$ の点 $(t,\\frac{2p}{t})$ における接線の傾きを求めよ。ただし $t=${params.t}$。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).m);
    },
    explain(params) {
      const p = params as Params;
      const mTex = p.m === 1 / 3 ? "\\frac{1}{3}" : p.m === 1 / 2 ? "\\frac{1}{2}" : String(p.m);
      return `
### この問題の解説
$y^2=4px$ の接線の傾きは $y' = 2p/y$。
点 $(t,\\frac{2p}{t})$ では傾きは $t/p$。
よって **${mTex}**。
`;
    },
  };
}

export const conicParabolaTangentSlopeTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_slope_basic_${i + 1}`, `接線の傾き ${i + 1}`)
);

const extraParabolaTangentSlopeTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_parabola_tangent_slope_basic_${i + 7}`, `接線の傾き 追加${i + 1}`)
);

conicParabolaTangentSlopeTemplates.push(...extraParabolaTangentSlopeTemplates);
