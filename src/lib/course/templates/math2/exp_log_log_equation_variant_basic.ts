// src/lib/course/templates/math2/exp_log_log_equation_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a: number;
  n: number;
  value: number;
};

function buildParams(): Params {
  const a = pick([2, 3, 5]);
  const n = randInt(2, 5);
  const value = Math.pow(a, n);
  return { a, n, value };
}

export const expLogLogEquationVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_log_equation_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_log_equation_basic",
      title: `対数方程式（構造）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を満たす $x$ を求めよ。\\n\\n$$\\log_{${params.a}}(x)=${params.n}$$`;
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
定義より $x=${p.a}^{${p.n}}=${p.value}$。答えは **${p.value}** です。
`;
    },
  };
});
