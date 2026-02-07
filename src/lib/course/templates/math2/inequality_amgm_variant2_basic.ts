// src/lib/course/templates/math2/inequality_amgm_variant2_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type Params = {
  k: number;
  answer: number;
};

function buildParams(): Params {
  const k = pick([1, 4, 9, 16, 25, 36]);
  const answer = 2 * Math.sqrt(k);
  return { k, answer };
}

export const inequalityAmgmVariant2Templates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `inequality_amgm_variant2_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "inequality_amgm_basic",
      title: `相加相乗（最小値）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `正の数 $a,b$ が $ab=${params.k}$ を満たすとき、$a+b$ の最小値を求めよ。`;
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
相加相乗平均より
$$
a+b\\ge 2\\sqrt{ab}=2\\sqrt{${p.k}}=${p.answer}
$$
等号は $a=b$ のとき。答えは **${p.answer}** です。
`;
    },
  };
});
