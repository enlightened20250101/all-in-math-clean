// src/lib/course/templates/math2/exp_log_unknown_exponent_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texPow } from "@/lib/format/tex";

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

export const expLogUnknownExponentTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `exp_log_unknown_exponent_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "exp_log_basic",
      title: `指数を求める ${i + 1}`,
      difficulty: 2,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const statement = `次を満たす $n$ を求めよ。\\n\\n$$${texPow(String(params.a), "n")}=${params.value}$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).n);
    },
    explain(params) {
      const p = params as Params;
      return `
### この問題の解説
対数を使うと
$$
n=\\log_{${p.a}}(${p.value})=${p.n}
$$
答えは **${p.n}** です。
`;
    },
  };
});
