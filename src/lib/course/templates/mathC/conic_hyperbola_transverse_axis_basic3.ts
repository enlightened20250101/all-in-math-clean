// src/lib/course/templates/mathC/conic_hyperbola_transverse_axis_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 4, ans: 8 },
  { a: 6, ans: 12 },
  { a: 8, ans: 16 },
  { a: 9, ans: 18 },
];

type Params = {
  a: number;
  ans: number;
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
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{25}=1$ の実軸の長さを求めよ。`;
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
実軸の長さは $2a$。
ここでは **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaTransverseAxisExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_transverse_axis_basic3_${i + 1}`, `実軸 ${i + 1}`)
);
