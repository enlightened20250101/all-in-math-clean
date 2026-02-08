// src/lib/course/templates/mathC/conic_hyperbola_value_basic2.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, x: 5, ans: 4 },
  { a: 4, b: 3, x: 5, ans: 3 },
  { a: 5, b: 12, x: 13, ans: 12 },
  { a: 6, b: 8, x: 10, ans: 8 },
];

type Params = {
  a: number;
  b: number;
  x: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_value_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ 上で $x=${params.x}$ のときの $y$ の値を求めよ（正の値）。`;
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
式に $x$ を代入して $y^2$ を求めます。
正の値は **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaValueExtraTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_value_basic2_${i + 1}`, `反射鏡の断面を表す双曲線の値 ${i + 1}`)
);
