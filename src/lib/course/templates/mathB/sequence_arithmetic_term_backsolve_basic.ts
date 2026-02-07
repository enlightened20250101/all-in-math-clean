// src/lib/course/templates/mathB/sequence_arithmetic_term_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type Params = {
  a1: number;
  d: number;
  n: number;
  an: number;
};

function buildParams(): Params {
  const a1 = randInt(1, 8);
  const d = randInt(1, 5);
  const n = randInt(3, 8);
  const an = a1 + (n - 1) * d;
  return { a1, d, n, an };
}

export const sequenceArithmeticTermBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `seq_arithmetic_term_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_arithmetic_basic",
      title: `等差数列の項（逆算）${i + 1}`,
      difficulty: 2,
      tags: ["sequence", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列で $a_1=${params.a1}$, 公差 $d=${params.d}$ のとき、$a_n=${params.an}$ を満たす $n$ を求めよ。`;
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
等差数列の一般項 $a_n=a_1+(n-1)d$ を用いると
$$
${p.an}=${p.a1}+(n-1)${p.d}
$$
より $n=${p.n}$。答えは **${p.n}** です。
`;
    },
  };
});
