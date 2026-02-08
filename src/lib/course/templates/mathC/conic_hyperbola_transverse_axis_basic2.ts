// src/lib/course/templates/mathC/conic_hyperbola_transverse_axis_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 2, ans: 4 },
  { a: 3, ans: 6 },
  { a: 5, ans: 10 },
  { a: 7, ans: 14 },
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
      const statement = `反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{9}=1$ の実軸の長さを求めよ。`;
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

export const conicHyperbolaTransverseAxisExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_transverse_axis_basic2_${i + 1}`, `実軸 ${i + 1}`)
);
