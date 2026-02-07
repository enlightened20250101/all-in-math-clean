// src/lib/course/templates/math2/trig_midline_from_maxmin_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  max: number;
  min: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const mid = (c.max + c.min) / 2;
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_midline_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `三角関数のグラフの最大値が ${c.max}、最小値が ${c.min} のとき、中線（平均値）を求めよ。`,
        answerKind: "numeric",
        params: { mid },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { mid: number }).mid);
    },
    explain(params) {
      const m = (params as { mid: number }).mid;
      return `### この問題の解説\n中線は $\\frac{\\text{最大値}+\\text{最小値}}{2}$ なので **${m}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_mid_mm_1", title: "中線（最大最小）1", max: 5, min: -1 },
  { id: "trig_mid_mm_2", title: "中線（最大最小）2", max: 4, min: -2 },
  { id: "trig_mid_mm_3", title: "中線（最大最小）3", max: 7, min: 1 },
  { id: "trig_mid_mm_4", title: "中線（最大最小）4", max: 3, min: -5 },
];

export const trigMidlineFromMaxMinVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
