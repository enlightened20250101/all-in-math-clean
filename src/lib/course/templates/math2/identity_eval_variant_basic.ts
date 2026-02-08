// src/lib/course/templates/math2/identity_eval_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  x: number;
  y: number;
  val: number;
};

function buildParams(): Params {
  const x = randInt(-4, 4);
  const y = randInt(-4, 4);
  const val = 2 * (x * x + y * y);
  return { x, y, val };
}

export const identityEvalVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `identity_eval_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "identity_eval_basic",
      title: `恒等式の値（式変形）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const yText = params.y < 0 ? `(${params.y})` : `${params.y}`;
      const statement = `面積の式として、次を計算せよ。\\n\\n$(${params.x}+${yText})^2+(${params.x}-${yText})^2$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).val);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
恒等式 $(x+y)^2+(x-y)^2=2(x^2+y^2)$ を使うと
$$
2(${p.x}^2+${p.y}^2)=${p.val}
$$
答えは **${p.val}** です。
`;
    },
  };
});
