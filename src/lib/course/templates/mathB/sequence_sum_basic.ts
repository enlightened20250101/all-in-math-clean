// src/lib/course/templates/mathB/sequence_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type SumParams = {
  kind: number; // 0: arithmetic, 1: geometric
  a1: number;
  d?: number;
  r?: number;
  n: number;
  value: number;
};

function buildArithmetic(): SumParams {
  const a1 = randInt(-4, 6);
  const d = randInt(-3, 5);
  const n = randInt(3, 8);
  const value = (n * (2 * a1 + (n - 1) * d)) / 2;
  return { kind: 0, a1, d, n, value };
}

function buildGeometric(): SumParams {
  const a1 = randInt(-3, 5);
  const r = pick([2, 3, -2]);
  const n = randInt(2, 5);
  const value = r === 1 ? a1 * n : a1 * (1 - Math.pow(r, n)) / (1 - r);
  return { kind: 1, a1, r, n, value };
}

function explain(params: SumParams) {
  if (params.kind === 0) {
    return `
### この問題の解説
等差数列の和は
$$
S_n = \\frac{n}{2}(2a_1+(n-1)d)
$$
なので
$$
S_${params.n} = ${params.value}
$$
答えは **${params.value}** です。
`;
  }
  return `
### この問題の解説
等比数列の和は
$$
S_n = a_1\\frac{1-r^n}{1-r}
$$
なので
$$
S_${params.n} = ${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_sum_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "sum", "ct"],
    },
    generate() {
      const params = Math.random() < 0.5 ? buildArithmetic() : buildGeometric();
      const statement =
        params.kind === 0
          ? `等差数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $d=${params.d}$ のとき、$S_${params.n}$ を求めよ。`
          : `等比数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $r=${params.r}$ のとき、$S_${params.n}$ を求めよ。`;
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

export const sequenceSumTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_sum_basic_${i + 1}`, `数列の和 ${i + 1}`)
);
