// src/lib/course/templates/math2/calculus_derivative_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Params = {
  a: number;
  b: number;
  value: number;
};

function buildParams(): Params {
  const a = randInt(1, 5);
  const b = randInt(-5, 5);
  const value = a;
  return { a, b, value };
}

export const derivativeVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `calc_derivative_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "calc_derivative_basic",
      title: `微分計算（一次関数）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const fx = texLinear(params.a, params.b);
      const statement = `次の関数の導関数 $f'(x)$ を求めよ。\\n\\n$$f(x)=${fx}$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const p = params as Params;
      const bText = p.b < 0 ? `${p.b}` : `+${p.b}`;
      return `
### この問題の解説
一次関数 $f(x)=${p.a}x${bText}$ の導関数は定数で
$$
f'(x)=${p.a}
$$
答えは **${p.a}** です。
`;
    },
  };
});
