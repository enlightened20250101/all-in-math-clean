// src/lib/course/templates/mathC/conic_hyperbola_foci_distance_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, dist: 10 },
  { a: 5, b: 12, dist: 26 },
  { a: 8, b: 15, dist: 34 },
  { a: 7, b: 24, dist: 50 },
  { a: 9, b: 12, dist: 30 },
  { a: 12, b: 5, dist: 26 },
];

type Params = {
  a: number;
  b: number;
  dist: number;
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
      const statement = `反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の2焦点間の距離を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).dist);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
焦点距離は $c^2=a^2+b^2$、よって $2c$。
ここでは **${p.dist}**。
`;
    },
  };
}

export const conicHyperbolaFociDistanceTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_foci_distance_basic_${i + 1}`, `焦点間距離 ${i + 1}`)
);

const extraHyperbolaFociDistanceTemplates: QuestionTemplate[] = Array.from({ length: 32 }, (_, i) =>
  buildTemplate(`conic_hyperbola_foci_distance_basic_${i + 7}`, `焦点間距離 追加${i + 1}`)
);

conicHyperbolaFociDistanceTemplates.push(...extraHyperbolaFociDistanceTemplates);
