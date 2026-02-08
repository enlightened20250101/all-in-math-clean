// src/lib/course/templates/math2/exp_log_unknown_base_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type Params = {
  a: number;
  n: number;
  value: number;
};

function buildParams(): Params {
  const a = pick([2, 3, 4, 5]);
  const n = randInt(2, 4);
  const value = Math.pow(a, n);
  return { a, n, value };
}

export const expLogUnknownBaseTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_unknown_base_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_basic",
      title: `底を求める ${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `成長モデルとして次を満たす $a$ を求めよ。\\n\\n$$a^{${params.n}}=${params.value}$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).a);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
両辺の ${p.n} 乗根をとれば
$$
a = \\sqrt[${p.n}]{${p.value}} = ${p.a}
$$
答えは **${p.a}** です。
`;
    },
  };
});
