// src/lib/course/templates/mathC/conic_hyperbola_transverse_axis_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 2, axis: 6 },
  { a: 4, b: 1, axis: 8 },
  { a: 5, b: 3, axis: 10 },
  { a: 6, b: 2, axis: 12 },
  { a: 7, b: 4, axis: 14 },
  { a: 8, b: 3, axis: 16 },
];

type Params = {
  a: number;
  b: number;
  axis: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_transverse_axis_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の実軸の長さを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).axis);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
実軸の長さは $2a$。
よって **${p.axis}** です。
`;
    },
  };
}

export const conicHyperbolaTransverseAxisTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_transverse_axis_basic_${i + 1}`, `実軸 ${i + 1}`)
);

const extraHyperbolaTransverseAxisTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_hyperbola_transverse_axis_basic_${i + 7}`, `実軸 追加${i + 1}`)
);

conicHyperbolaTransverseAxisTemplates.push(...extraHyperbolaTransverseAxisTemplates);
