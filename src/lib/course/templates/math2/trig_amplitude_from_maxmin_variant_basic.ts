// src/lib/course/templates/math2/trig_amplitude_from_maxmin_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  max: number;
  min: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const amp = (c.max - c.min) / 2;
  return {
    meta: {
      id: c.id,
      topicId: "trig_amplitude_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `三角関数のグラフの最大値が ${c.max}、最小値が ${c.min} のとき、振幅を求めよ。`,
        answerKind: "numeric",
        params: { amp },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { amp: number }).amp);
    },
    explain(params) {
      const a = (params as { amp: number }).amp;
      return `### この問題の解説\n振幅は $\\frac{\\text{最大値}-\\text{最小値}}{2}$ なので **${a}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_amp_mm_1", title: "振幅（最大最小）1", max: 5, min: -1 },
  { id: "trig_amp_mm_2", title: "振幅（最大最小）2", max: 4, min: -2 },
  { id: "trig_amp_mm_3", title: "振幅（最大最小）3", max: 7, min: 1 },
  { id: "trig_amp_mm_4", title: "振幅（最大最小）4", max: 3, min: -5 },
];

export const trigAmplitudeFromMaxMinVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
