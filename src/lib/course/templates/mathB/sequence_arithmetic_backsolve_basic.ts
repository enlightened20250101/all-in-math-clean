// src/lib/course/templates/mathB/sequence_arithmetic_backsolve_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type Params = {
  a1: number;
  d: number;
  n: number;
  m: number;
  an: number;
  am: number;
};

function buildParams(): Params {
  const a1 = randInt(-5, 5);
  const d = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const n = randInt(2, 5);
  const m = randInt(n + 1, n + 4);
  const an = a1 + (n - 1) * d;
  const am = a1 + (m - 1) * d;
  return { a1, d, n, m, an, am };
}

export const sequenceArithmeticBacksolveTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `sequence_arithmetic_backsolve_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "seq_arithmetic_basic",
      title: `等差数列の逆算 ${i + 1}`,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列 $\\{a_n\\}$ において、$a_${params.n}=${params.an}$, $a_${params.m}=${params.am}$ のとき、公差 $d$ を求めよ。`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).d);
    },
    explain(params) {
      const { n, m, an, am, d } = params as Params;
      return `
### この問題の解説
等差数列より $a_m-a_n=(m-n)d$。
$$
${am} - ${an} = (${m}-${n})d
$$
したがって $d=${d}$。答えは **${d}** です。
`;
    },
  };
});
