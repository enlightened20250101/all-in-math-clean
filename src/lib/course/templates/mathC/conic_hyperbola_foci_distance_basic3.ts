// src/lib/course/templates/mathC/conic_hyperbola_foci_distance_basic3.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 4, b: 3, ans: 10 },
  { a: 8, b: 6, ans: 20 },
  { a: 7, b: 24, ans: 50 },
  { a: 9, b: 12, ans: 30 },
];

type Params = {
  a: number;
  b: number;
  ans: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_foci_distance_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の2つの焦点間の距離を求めよ。`;
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
$c^2=a^2+b^2$ より焦点間の距離は $2c$。
答えは **${p.ans}**。
`;
    },
  };
}

export const conicHyperbolaFociDistanceExtraTemplates2: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_foci_distance_basic3_${i + 1}`, `焦点間距離 ${i + 1}`)
);
