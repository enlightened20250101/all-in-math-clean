// src/lib/course/templates/math2/trig_graph_intercept_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  b: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const firstZero = 180 / c.b;
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_intercept_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `関数 $y=\\sin ${c.b}x$ の $0^\\circ<x<360^\\circ$ における最小の正の $x$ 切片を求めよ。`,
        answerKind: "numeric",
        params: { firstZero },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { firstZero: number }).firstZero);
    },
    explain(params) {
      const v = (params as { firstZero: number }).firstZero;
      return `### この問題の解説\n$\\sin ${c.b}x=0$ の最小の正の解は $x=\\frac{180}{${c.b}}=${v}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_int_v1", title: "x切片 1", b: 2 },
  { id: "trig_int_v2", title: "x切片 2", b: 3 },
  { id: "trig_int_v3", title: "x切片 3", b: 4 },
  { id: "trig_int_v4", title: "x切片 4", b: 6 },
];

export const trigGraphInterceptVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
