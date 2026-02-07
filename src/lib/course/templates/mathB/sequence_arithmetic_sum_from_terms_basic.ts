// src/lib/course/templates/mathB/sequence_arithmetic_sum_from_terms_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type SumParams = {
  a1: number;
  an: number;
  n: number;
  sum: number;
};

function buildParams(): SumParams {
  const n = randInt(4, 8);
  const a1 = randInt(1, 5);
  const d = randInt(1, 4);
  const an = a1 + (n - 1) * d;
  const sum = (n * (a1 + an)) / 2;
  return { a1, an, n, sum };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_arithmetic_sum_from_terms_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "sum", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列で $a_1=${params.a1}$, $a_${params.n}=${params.an}$ のとき、$S_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SumParams).sum);
    },
    explain(params) {
      const p = params as SumParams;
      return `
### この問題の解説
等差数列の和は
$$
S_n=\\frac{n(a_1+a_n)}{2}
$$
なので
$$
S_${p.n}=\\frac{${p.n}(${p.a1}+${p.an})}{2}=${p.sum}
$$
です。答えは **${p.sum}** です。
`;
    },
  };
}

export const sequenceArithmeticSumFromTermsTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_arithmetic_sum_from_terms_basic_${i + 1}`, `等差数列の和 ${i + 1}`)
);
