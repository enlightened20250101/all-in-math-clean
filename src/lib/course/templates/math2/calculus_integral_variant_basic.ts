// src/lib/course/templates/math2/calculus_integral_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type IntCase = {
  id: string;
  title: string;
  a: number;
  b: number;
  x1: number;
  x2: number;
};

function integralValue(c: IntCase): number {
  return (c.a / 2) * (c.x2 * c.x2 - c.x1 * c.x1) + c.b * (c.x2 - c.x1);
}

function buildTemplate(c: IntCase): QuestionTemplate {
  const value = integralValue(c);
  return {
    meta: {
      id: c.id,
      topicId: "calc_integral_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const fx = texLinear(c.a, c.b);
      return {
        templateId: c.id,
        statement: `次の定積分を求めよ。\\n\\n$$\\int_{${c.x1}}^{${c.x2}} (${fx})\\,dx$$`,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const value = (params as { value: number }).value;
      return `
### この問題の解説
一次式の定積分を計算すると **${value}** です。
`;
    },
  };
}

const CASES: IntCase[] = [
  { id: "calc_int_v1", title: "定積分（対称）1", a: 2, b: 0, x1: -2, x2: 2 },
  { id: "calc_int_v2", title: "定積分（対称）2", a: 4, b: 2, x1: -1, x2: 1 },
  { id: "calc_int_v3", title: "定積分（基本）1", a: 2, b: -2, x1: 0, x2: 3 },
  { id: "calc_int_v4", title: "定積分（基本）2", a: 6, b: 1, x1: -1, x2: 2 },
];

export const integralVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
