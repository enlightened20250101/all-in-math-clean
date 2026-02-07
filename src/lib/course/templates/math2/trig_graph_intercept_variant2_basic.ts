// src/lib/course/templates/math2/trig_graph_intercept_variant2_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  b: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const firstZero = 90 / c.b;
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_intercept_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const kx = c.b === 1 ? "x" : `${c.b}x`;
      return {
        templateId: c.id,
        statement: `関数 $y=\\cos ${kx}$ の $0^\\circ<x<360^\\circ$ における最小の正の $x$ 切片を求めよ。`,
        answerKind: "numeric",
        params: { firstZero },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { firstZero: number }).firstZero);
    },
    explain(params) {
      const v = (params as { firstZero: number }).firstZero;
      return `### この問題の解説\n$\\cos ${c.b}x=0$ の最小の正の解は $x=\\frac{90}{${c.b}}=${v}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_int2_v1", title: "x切片（cos）1", b: 1 },
  { id: "trig_int2_v2", title: "x切片（cos）2", b: 2 },
  { id: "trig_int2_v3", title: "x切片（cos）3", b: 3 },
  { id: "trig_int2_v4", title: "x切片（cos）4", b: 5 },
];

export const trigGraphInterceptVariant2Templates: QuestionTemplate[] = CASES.map(buildTemplate);
