// src/lib/course/templates/math2/exp_log_log_diff_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a: number;
  m: number;
  n: number;
  x: number;
  y: number;
  answer: number;
};

function buildParams(): Params {
  const a = pick([2, 3, 5]);
  const m = randInt(2, 4);
  const n = randInt(1, m - 1);
  const x = Math.pow(a, m);
  const y = Math.pow(a, n);
  const answer = m - n;
  return { a, m, n, x, y, answer };
}

export const expLogLogDiffVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_log_diff_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_log_diff_basic",
      title: `対数の減法（構造）${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `$\\log_{${params.a}}${params.x}-\\log_{${params.a}}${params.y}$ を計算せよ。`;
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
$\\log_a x-\\log_a y=\\log_a(x/y)$ より
$$
\\log_{${p.a}}(${p.x / p.y})=${p.answer}
$$
答えは **${p.answer}** です。
`;
    },
  };
});
