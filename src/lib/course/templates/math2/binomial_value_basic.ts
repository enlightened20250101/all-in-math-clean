// src/lib/course/templates/math2/binomial_value_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric, pick, randInt } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

function buildParams() {
  const a = pick([-2, -1, 1, 2, 3]);
  const n = randInt(2, 5);
  const val = Math.pow(1 + a, n);
  return { a, n, val };
}

function buildTemplate(id: string, title: string): QuestionTemplate {
  return {
    meta: {
      id,
      topicId: "binomial_value_basic",
      title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const params = buildParams();
      const base = texLinear(1, params.a);
      const statement = `個数の確認のため、展開前の式 $(${base})^{${params.n}}$ の値を求めよ。`;
      return {
        templateId: id,
        statement,
        answerKind: "numeric",
        params,
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, params.val);
    },
    explain(params) {
      const base = texLinear(1, params.a);
      return `
### この問題の解説
計算すると
$$
(${base})^{${params.n}}=${params.val}
$$
答えは **${params.val}** です。
`;
    },
  };
}

export const binomialValueTemplates: QuestionTemplate[] = Array.from({ length: 50 }, (_, i) =>
  buildTemplate(`binomial_value_basic_${i + 1}`, `値 ${i + 1}`)
);
