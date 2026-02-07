// src/lib/course/templates/mathB/sequence_arithmetic_mean_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type MeanParams = {
  a1: number;
  a3: number;
  a2: number;
};

function buildParams(): MeanParams {
  const a1 = randInt(-5, 5);
  const d = randInt(1, 4);
  const a3 = a1 + 2 * d;
  const a2 = a1 + d;
  return { a1, a3, a2 };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_arithmetic_mean_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "arithmetic", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement = `等差数列で $a_1=${params.a1}$, $a_3=${params.a3}$ のとき、$a_2$ を求めよ。`;
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
等差数列では $a_2$ は $a_1$ と $a_3$ の平均なので
$$
${p.a2}=\\frac{${p.a1}+${p.a3}}{2}
$$
です。答えは **${p.a2}** です。
`;
    },
  };
}

export const sequenceArithmeticMeanTemplates: QuestionTemplate[] = Array.from({ length: 60 }, (_, i) =>
  buildTemplate(`seq_arithmetic_mean_basic_${i + 1}`, `等差数列の平均 ${i + 1}`)
);
