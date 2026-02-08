// src/lib/course/templates/mathA/int_divisor_multiple_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  n: number;
  d: number;
  context?: string;
};

function buildTemplate(c: Case): QuestionTemplate {
  const k = c.n / c.d;
  return {
    meta: {
      id: c.id,
      topicId: "int_divisor_multiple_basic",
      title: c.title,
      difficulty: 1,
      tags: ["integer", "divisor"],
    },
    generate() {
      const lead = c.context ? `${c.context}\n` : "";
      return {
        templateId: c.id,
        statement: `${lead}${c.n} は ${c.d} の倍数である。$k$ を用いて ${c.n}=${c.d}k と表すとき、$k$ を求めよ。`,
        answerKind: "numeric",
        params: { k },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { k: number }).k);
    },
    explain(params) {
      const k = (params as { k: number }).k;
      return `### この問題の解説\n${c.n}=${c.d}k なので $k=${k}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "int_div_v1", title: "倍数 1", n: 84, d: 7, context: "84本の鉛筆を7本ずつ束ねるときの束数を考える。" },
  { id: "int_div_v2", title: "倍数 2", n: 96, d: 8, context: "96枚のプリントを8枚ずつ配るときの回数を考える。" },
  { id: "int_div_v3", title: "倍数 3", n: 132, d: 11, context: "132人を11人ずつの班に分けるときの班数を考える。" },
  { id: "int_div_v4", title: "倍数 4", n: 150, d: 6, context: "150個の部品を6個ずつ袋詰めするときの袋数を考える。" },
  { id: "int_div_v5", title: "倍数 5", n: 180, d: 9, context: "180ページを9ページずつ読むときの回数を考える。" },
];

export const intDivisorMultipleVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
