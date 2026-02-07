// src/lib/course/templates/mathA/int_divisor_multiple_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  n: number;
  d: number;
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
      return {
        templateId: c.id,
        statement: `${c.n} は ${c.d} の倍数である。$k$ を用いて ${c.n}=${c.d}k と表すとき、$k$ を求めよ。`,
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
  { id: "int_div_v1", title: "倍数 1", n: 84, d: 7 },
  { id: "int_div_v2", title: "倍数 2", n: 96, d: 8 },
  { id: "int_div_v3", title: "倍数 3", n: 132, d: 11 },
  { id: "int_div_v4", title: "倍数 4", n: 150, d: 6 },
];

export const intDivisorMultipleVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
