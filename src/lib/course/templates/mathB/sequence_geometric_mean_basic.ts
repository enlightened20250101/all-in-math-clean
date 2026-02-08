// src/lib/course/templates/mathB/sequence_geometric_mean_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick } from "../_shared/utils";

type MeanParams = {
  a1: number;
  a3: number;
  a2: number;
};

const CASES: MeanParams[] = [
  { a1: 2, a3: 8, a2: 4 },
  { a1: 3, a3: 12, a2: 6 },
  { a1: 4, a3: 36, a2: 12 },
  { a1: 5, a3: 20, a2: 10 },
];

function buildParams(): MeanParams {
  return pick(CASES);
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_geometric_mean_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "geometric", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `一定倍率で変化する量を考える。` +
        `$a_1=${params.a1}$, $a_3=${params.a3}$ のとき、$a_2$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as MeanParams).a2);
    },
    explain(params) {
      const p = params as MeanParams;
      return `
### この問題の解説
等比数列では $a_2^2=a_1 a_3$ なので
$$
${p.a2}^2=${p.a1}\times${p.a3}
$$
より $a_2=${p.a2}$ です。答えは **${p.a2}** です。
`;
    },
  };
}

export const sequenceGeometricMeanTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`seq_geometric_mean_basic_${i + 1}`, `等比数列の平均 ${i + 1}`)
);
