// src/lib/course/templates/math2/binomial_value_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type Params = {
  a: number;
  n: number;
  value: number;
};

function buildParams(): Params {
  const a = pick([2, 3, 4, 5]);
  const n = pick([3, 4, 5]);
  const value = Math.pow(a + 1, n);
  return { a, n, value };
}

export const binomialValueVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `binomial_value_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "binomial_value_basic",
      title: `二項展開の値（変形）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `$(x+1)^{${params.n}}$ に $x=${params.a}$ を代入した値を求めよ。`;
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
      return `
### この問題の解説
代入すると $( ${p.a}+1 )^{${p.n}}=${p.value}$。
答えは **${p.value}** です。
`;
    },
  };
});
