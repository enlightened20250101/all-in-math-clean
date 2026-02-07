// src/lib/course/templates/mathC/conic_ellipse_c_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

const CASES = [
  { a: 5, b: 3, c: 4 },
  { a: 13, b: 5, c: 12 },
  { a: 10, b: 6, c: 8 },
  { a: 15, b: 9, c: 12 },
  { a: 25, b: 7, c: 24 },
  { a: 17, b: 15, c: 8 },
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
      topicId: "conic_ellipse_c_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a ** 2}}+\\frac{y^2}{${params.b ** 2}}=1$ の焦点距離 $c$ を求めよ。`;
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
$c^2=a^2-b^2$ より
$$
${p.a}^2-${p.b}^2=${p.c}^2
$$
よって **${p.c}**。
`;
    },
  };
}

export const conicEllipseCTemplates: QuestionTemplate[] = Array.from({ length: 6 }, (_, i) =>
  buildTemplate(`conic_ellipse_c_basic_${i + 1}`, `焦点距離 ${i + 1}`)
);

const extraEllipseCTemplates: QuestionTemplate[] = Array.from({ length: 38 }, (_, i) =>
  buildTemplate(`conic_ellipse_c_basic_${i + 7}`, `焦点距離 追加${i + 1}`)
);

conicEllipseCTemplates.push(...extraEllipseCTemplates);
