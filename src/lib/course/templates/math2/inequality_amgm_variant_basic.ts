// src/lib/course/templates/math2/inequality_amgm_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, randInt } from "../_shared/utils";
import { texTerm } from "@/lib/format/tex";

type Params = {
  p: number;
  q: number;
  a: number;
  b: number;
  value: number;
};

function buildParams(): Params {
  const p = randInt(1, 5);
  const q = randInt(1, 5);
  const a = p * p;
  const b = q * q;
  const value = 2 * p * q;
  return { p, q, a, b, value };
}

export const inequalityAmgmVariantTemplates: QuestionTemplate[] = Array.from({ length: 30 }, (_, i) => {
  const templateId = `inequality_amgm_variant_${i + 1}`;
  return {
    meta: {
      id: templateId,
      topicId: "inequality_amgm_basic",
      title: `相加相乗（最小値） ${i + 1}`,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const { a, b } = params;
      const ax = texTerm(a, "x", true);
      const statement = `正の数 $x$ に対し、次の最小値を求めよ。\\n\\n$$${ax} + \\frac{${b}}{x}$$`;
      return {
        templateId,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as Params).value);
    },
    explain(params) {
      const { a, b, value } = params as Params;
      const ax = texTerm(a, "x", true);
      return `
### この問題の解説
相加相乗平均より
$$
${ax} + \\frac{${b}}{x} \\ge 2\\sqrt{${a}\\cdot${b}} = ${value}
$$
最小値は **${value}** です。
`;
    },
  };
});
