// src/lib/course/templates/mathB/sequence_geometric_sum_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";

type GeoSumParams = { a1: number; r: number; n: number; value: number };

function buildParams(): GeoSumParams {
  const a1 = randInt(-3, 5);
  const r = pick([2, 3, -2]);
  const n = randInt(2, 5);
  const value = a1 * (1 - Math.pow(r, n)) / (1 - r);
  return { a1, r, n, value };
}

function explain(params: GeoSumParams) {
  return `
### この問題の解説
等比数列の和は
$$
S_n = a_1\\frac{1-r^n}{1-r}
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
      topicId: "seq_geometric_sum_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "sum", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $r=${params.r}$ のとき、$S_${params.n}$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as GeoSumParams).value);
    },
    explain(params) {
      return explain(params as GeoSumParams);
    },
  };
}

export const sequenceGeometricSumTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_geometric_sum_basic_${i + 1}`, `等比数列の和 ${i + 1}`)
);
