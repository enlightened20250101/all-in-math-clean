// src/lib/course/templates/mathC/conic_hyperbola_c_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 3, b: 4, c: 5 },
  { a: 5, b: 12, c: 13 },
  { a: 8, b: 15, c: 17 },
  { a: 7, b: 24, c: 25 },
  { a: 9, b: 12, c: 15 },
  { a: 12, b: 5, c: 13 },
];

type Params = {
  a: number;
  b: number;
  c: number;
};

function buildParams(): Params {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_c_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `測定で得た反射鏡の断面を表す双曲線 $\\frac{x^2}{${params.a ** 2}}-\\frac{y^2}{${params.b ** 2}}=1$ の焦点距離 $c$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).c);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
$c^2=a^2+b^2$ より
$$
${p.a}^2+${p.b}^2=${p.c}^2
$$
よって **${p.c}**。
`;
    },
  };
}

export const conicHyperbolaCTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_hyperbola_c_basic_${i + 1}`, `焦点距離 ${i + 1}`)
);

const extraHyperbolaCTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_hyperbola_c_basic_${i + 7}`, `焦点距離 追加${i + 1}`)
);

conicHyperbolaCTemplates.push(...extraHyperbolaCTemplates);
