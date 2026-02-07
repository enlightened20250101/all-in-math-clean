// src/lib/course/templates/mathB/sequence_arithmetic_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type SeqParams = { a1: number; d: number; n: number; value: number };

function buildParams(): SeqParams {
  const a1 = randInt(-5, 8);
  const d = randInt(-4, 6);
  const n = randInt(3, 8);
  const value = a1 + (n - 1) * d;
  return { a1, d, n, value };
}

function explain(params: SeqParams) {
  const { a1, d, n, value } = params;
  return `
### この問題の解説
等差数列の一般項は
$$
a_n = a_1 + (n-1)d
$$
なので
$$
a_${n} = ${a1} + (${n}-1)\\cdot ${d} = ${value}
$$
答えは **${value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_arithmetic_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $d=${params.d}$ のとき、$a_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as SeqParams).value);
    },
    explain(params) {
      return explain(params as SeqParams);
    },
  };
}

export const sequenceArithmeticTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_arithmetic_basic_${i + 1}`, `等差数列一般項 ${i + 1}`)
);
