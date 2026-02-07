// src/lib/course/templates/mathC/conic_hyperbola_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type HyperParams = { a: number; b: number; value: number };

function buildParams(): HyperParams {
  const a = randInt(1, 4);
  const b = randInt(1, 4);
  const value = a * a + b * b; // c^2
  return { a, b, value };
}

function explain(params: HyperParams) {
  return `
### この問題の解説
双曲線
$$
\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1
$$
では $c^2=a^2+b^2$。答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "conic_hyperbola_basic",
      title,
      difficulty: 1,
      tags: ["conic", "hyperbola"],
    },
    generate() {
      const params = buildParams();
      const statement = `双曲線 $\\frac{x^2}{${params.a * params.a}}-\\frac{y^2}{${params.b * params.b}}=1$ について、$c^2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as HyperParams).value);
    },
    explain(params) {
      return explain(params as HyperParams);
    },
  };
}

export const conicHyperbolaTemplates: QuestionTemplate[] = Array.from(
  { length: 20 },
  (_, i) => buildTemplate(`conic_hyperbola_basic_${i + 1}`, `双曲線 ${i + 1}`)
);

const extraConicHyperbolaTemplates: QuestionTemplate[] = Array.from(
  { length: 30 },
  (_, i) => buildTemplate(`conic_hyperbola_basic_${i + 21}`, `双曲線 追加${i + 1}`)
);

conicHyperbolaTemplates.push(...extraConicHyperbolaTemplates);
