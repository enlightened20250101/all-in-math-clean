// src/lib/course/templates/mathB/sequence_common_difference_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";

type DiffParams = { a1: number; a2: number; value: number };

function buildParams(): DiffParams {
  const a1 = randInt(-5, 8);
  const d = randInt(-4, 6);
  const a2 = a1 + d;
  return { a1, a2, value: d };
}

function explain(params: DiffParams) {
  return `
### この問題の解説
等差数列の公差は
$$
d=a_2-a_1
$$
なので
$$
${params.a2}-${params.a1}=${params.value}
$$
答えは **${params.value}** です。
`;
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "seq_common_difference_basic",
      title,
      difficulty: 1,
      tags: ["sequence", "difference", "ct"],
    },
    generate() {
      const params = buildParams();
      const statement =
        `毎回同じ増減がある記録を等差数列とみなす。` +
        `$a_1=${params.a1}$, $a_2=${params.a2}$ のとき、公差 $d$ を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as DiffParams).value);
    },
    explain(params) {
      return explain(params as DiffParams);
    },
  };
}

export const sequenceCommonDifferenceTemplates: QuestionTemplate[] = Array.from(
  { length: 50 },
  (_, i) => buildTemplate(`seq_common_difference_basic_${i + 1}`, `公差 ${i + 1}`)
);
