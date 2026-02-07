// src/lib/course/templates/math2/inequality_mean_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  a: number;
  b: number;
  value: number;
};

function buildParams(): Params {
  const a = randInt(1, 6);
  const b = randInt(1, 6);
  const value = (a + b) / 2;
  return { a, b, value };
}

export const inequalityMeanVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `inequality_mean_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "inequality_mean_basic",
      title: `平均（数値）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。\\n\\n$$\\frac{${params.a}+${params.b}}{2}$$`;
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
平均は $\\frac{${p.a}+${p.b}}{2}=${p.value}$。
答えは **${p.value}** です。
`;
    },
  };
});
