// src/lib/course/templates/mathC/conic_circle_tangent_slope_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { m: 1, ans: -1 },
  { m: -1, ans: 1 },
  { m: 2, ans: -0.5 },
  { m: -2, ans: 0.5 },
];

type Params = {
  m: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_circle_tangent_slope_basic",
      title,
      difficulty: 1,
      tags: ["conic", "circle"],
    },
    generate() {
      const params = buildParams();
      const statement = `円 $x^2+y^2=r^2$ の点 $P(1,1)$ における接線の傾きが $${params.m}$ のとき、半径の傾きを求めよ。`;
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
半径と接線は直交するので、傾きは負の逆数。
よって **${p.ans}**。
`;
    },
  };
}

export const conicCircleTangentSlopeTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_slope_basic_${i + 1}`, `接線の傾き ${i + 1}`)
);

const extraCircleTangentSlopeTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_circle_tangent_slope_basic_${i + 7}`, `接線の傾き 追加${i + 1}`)
);

conicCircleTangentSlopeTemplates.push(...extraCircleTangentSlopeTemplates);
