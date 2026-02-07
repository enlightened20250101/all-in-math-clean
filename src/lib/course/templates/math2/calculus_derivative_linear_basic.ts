// src/lib/course/templates/math2/calculus_derivative_linear_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type DerivParams = {
  a: number;
  b: number;
  value: number;
};

function buildParams(): DerivParams {
  const a = pick([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-4, 4);
  return { a, b, value: a };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "calc_derivative_linear_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement = `関数 $f(x)=${fx}$ の導関数 $f'(x)$ を求めよ。`;
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
      const p = params as DerivParams;
      return `
### この問題の解説
一次関数 $ax+b$ の導関数は $a$ なので答えは **${p.value}** です。
`;
    },
  };
}

export const derivativeLinearTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`calc_derivative_linear_basic_${i + 1}`, `一次関数の微分 ${i + 1}`)
);
