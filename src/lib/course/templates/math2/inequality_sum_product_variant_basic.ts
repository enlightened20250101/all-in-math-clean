// src/lib/course/templates/math2/inequality_sum_product_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type Params = {
  s: number;
  max: number;
};

function buildParams(): Params {
  const s = pick([6, 8, 10, 12]);
  const max = (s / 2) * (s / 2);
  return { s, max };
}

export const inequalitySumProductVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `inequality_sum_product_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "inequality_sum_product_basic",
      title: `和と積（逆算）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `正の数 $x,y$ が $x+y=${params.s}$ を満たすとき、$xy$ の最大値を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).max);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
和一定のとき積は $x=y$ で最大。
よって $xy=(${p.s}/2)^2=${p.max}$。
`;
    },
  };
});
