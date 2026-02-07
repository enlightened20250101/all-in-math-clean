// src/lib/course/templates/math2/exp_log_log_product_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a: number;
  m: number;
  n: number;
  value: number;
  answer: number;
};

function buildParams(): Params {
  const a = pick([2, 3, 5]);
  const m = randInt(1, 3);
  const n = randInt(1, 3);
  const value = Math.pow(a, m) * Math.pow(a, n);
  const answer = m + n;
  return { a, m, n, value, answer };
}

export const expLogLogProductVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_log_product_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_log_product_basic",
      title: `対数の積（構造）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。$\\log_{${params.a}}(${params.value})$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).answer);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
${p.value}=${p.a}^{${p.m}}\\times${p.a}^{${p.n}}=${p.a}^{${p.answer}} なので
$$
\\log_{${p.a}}(${p.value})=${p.answer}
$$
答えは **${p.answer}** です。
`;
    },
  };
});
