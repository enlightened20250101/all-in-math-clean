// src/lib/course/templates/math2/exp_log_growth_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  p: number;
  n: number;
  value: number;
};

function buildParams(): Params {
  const p = pick([5, 10, 20]);
  const n = randInt(2, 4);
  const value = Math.pow(1 + p / 100, n);
  return { p, n, value };
}

export const expLogGrowthVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_growth_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_growth_basic",
      title: `増減の計算（倍率）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `${params.p}% 増加を ${params.n} 回繰り返したときの倍率を求めよ。`;
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
倍率は $(1+${p.p}/100)^{${p.n}}=${p.value}$。
答えは **${p.value}** です。
`;
    },
  };
});
