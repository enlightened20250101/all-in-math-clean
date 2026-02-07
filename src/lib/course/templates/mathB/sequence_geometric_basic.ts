// src/lib/course/templates/mathB/sequence_geometric_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt, pick } from "../_shared/utils";

type SeqParams = { a1: number; r: number; n: number; value: number };

function buildParams(): SeqParams {
  const a1 = randInt(-3, 6);
  const r = pick([2, 3, -2]);
  const n = randInt(2, 6);
  const value = a1 * Math.pow(r, n - 1);
  return { a1, r, n, value };
}

function explain(params: SeqParams) {
  const { a1, r, n, value } = params;
  return `
### この問題の解説
等比数列の一般項は
$$
a_n = a_1 r^{n-1}
$$
なので
$$
a_${n} = ${a1} \\cdot (${r})^{${n - 1}} = ${value}
$$
答えは **${value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_geometric_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等比数列 $\\{a_n\\}$ において $a_1=${params.a1}$, $r=${params.r}$ のとき、$a_${params.n}$ を求めよ。`;
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

export const sequenceGeometricTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_geometric_basic_${i + 1}`, `等比数列一般項 ${i + 1}`)
);
