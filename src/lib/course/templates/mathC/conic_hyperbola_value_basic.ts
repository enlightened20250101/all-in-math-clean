// src/lib/course/templates/mathC/conic_hyperbola_value_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 2, x: 3, y: 0, val: 1 },
  { a: 4, b: 1, x: 4, y: 0, val: 1 },
  { a: 5, b: 3, x: 0, y: 0, val: 0 },
  { a: 6, b: 2, x: 6, y: 0, val: 1 },
  { a: 7, b: 4, x: 0, y: 0, val: 0 },
  { a: 8, b: 3, x: 8, y: 0, val: 1 },
];

type Params = {
  a: number;
  b: number;
  x: number;
  y: number;
  val: number;
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
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ に点 $(${params.x},${params.y})$ を代入した値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).val);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$$
\\frac{${p.x}^2}{${p.a ** 2}}-\\frac{${p.y}^2}{${p.b ** 2}}=${p.val}
$$
`;
    },
  };
}

export const conicHyperbolaValueTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_value_basic_${i + 1}`, `代入値 ${i + 1}`)
);

const extraHyperbolaValueTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_hyperbola_value_basic_${i + 7}`, `代入値 追加${i + 1}`)
);

conicHyperbolaValueTemplates.push(...extraHyperbolaValueTemplates);
