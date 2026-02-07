// src/lib/course/templates/math2/calculus_derivative_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPoly2 } from "@/lib/format/tex";

type DerivParams = {
  a: number;
  b: number;
  c: number;
  x0: number;
  value: number;
};

function buildParams(): DerivParams {
  const a = pick([1, 2, 3]);
  const b = randInt(-5, 5);
  const c = randInt(-5, 5);
  const x0 = randInt(-3, 3);
  const value = 2 * a * x0 + b;
  return { a, b, c, x0, value };
}

function explain(params: DerivParams) {
  const { a, b, c, x0, value } = params;
  const f = texPoly2(a, b, c);
  return `
### この問題の解説
$$
f(x) = ${f}
$$
より
$$
f'(x) = ${2 * a}x + ${b}
$$
したがって
$$
f'(${x0}) = ${value}
$$
答えは **${value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_derivative_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次の関数について $f'(${params.x0})$ を求めよ。\\n\\n$$f(x) = ${texPoly2(params.a, params.b, params.c)}$$`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DerivParams).value);
    },
    explain(params) {
      return explain(params as DerivParams);
    },
  };
}

export const derivativeBasicTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`calc_derivative_basic_${i + 1}`, `微分計算 ${i + 1}`)
);
