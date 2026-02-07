// src/lib/course/templates/mathB/sequence_arithmetic_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type SumParams = { a1: number; d: number; n: number; value: number };

function buildParams(): SumParams {
  const a1 = randInt(-4, 6);
  const d = randInt(-3, 5);
  const n = randInt(3, 8);
  const value = (n * (2 * a1 + (n - 1) * d)) / 2;
  return { a1, d, n, value };
}

function explain(params: SumParams) {
  return `
### この問題の解説
等差数列の和は
$$
S_n=\\frac{n}{2}(2a_1+(n-1)d)
$$
なので
$$
S_${params.n}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_arithmetic_sum_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "sum", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $d=${params.d}$ のとき、$S_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SumParams).value);
    },
    explain(params) {
      return explain(params as SumParams);
    },
  };
}

export const sequenceArithmeticSumTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_arithmetic_sum_basic_${i + 1}`, `等差数列の和 ${i + 1}`)
);
