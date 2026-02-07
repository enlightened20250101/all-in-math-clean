// src/lib/course/templates/mathC/conic_ellipse_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type EllipseParams = { a: number; b: number; value: number };

function buildParams(): EllipseParams {
  const a = randInt(2, 5);
  const b = randInt(1, a - 1);
  const value = 2 * a;
  return { a, b, value };
}

function explain(params: EllipseParams) {
  return `
### この問題の解説
楕円
$$
\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1
$$
の長軸の長さは $2a$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_ellipse_basic",
      title,
      difficulty: 1,
      tags: ["conic", "ellipse"],
    },
    generate() {
      const params = buildParams();
      const statement = `楕円 $\\frac{x^2}{${params.a * params.a}}+\\frac{y^2}{${params.b * params.b}}=1$ の長軸の長さを求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as EllipseParams).value);
    },
    explain(params) {
      return explain(params as EllipseParams);
    },
  };
}

export const conicEllipseTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_ellipse_basic_${i + 1}`, `楕円 ${i + 1}`)
);

const extraConicEllipseTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_ellipse_basic_${i + 21}`, `楕円 追加${i + 1}`)
);

conicEllipseTemplates.push(...extraConicEllipseTemplates);
