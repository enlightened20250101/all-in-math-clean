// src/lib/course/templates/math2/exp_log_change_base_variant2_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  base: number;
  value: number;
  answer: number;
};

function buildParams(): Params {
  const c = pick([2, 3, 5]);
  const p = pick([1, 2]);
  const k = randInt(1, 3);
  const base = Math.pow(c, p);
  const value = Math.pow(c, p * k);
  return { base, value, answer: k };
}

export const expLogChangeBaseVariant2Templates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_change_base_variant2_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_change_base_basic",
      title: `底の変換（構造2）${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を計算せよ。\\n\\n$$\\log_{${params.base}}(${params.value})$$`;
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
底の変換（または指数の比較）より
$$
\\log_{${p.base}}(${p.value})=${p.answer}
$$
答えは **${p.answer}** です。
`;
    },
  };
});
