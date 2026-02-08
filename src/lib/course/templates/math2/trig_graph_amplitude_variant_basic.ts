// src/lib/course/templates/math2/trig_graph_amplitude_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const amp = Math.abs(c.a);
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
        statement: `波形 $y=${c.a}\\sin x$ の振幅を求めよ。`,
        answerKind: "numeric",
        params: { amp },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { amp: number }).amp);
    },
    explain(params) {
      const a = (params as { amp: number }).amp;
      return `### この問題の解説\n振幅は係数の絶対値で **${a}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_amp_v1", title: "振幅 1", a: 2 },
  { id: "trig_amp_v2", title: "振幅 2", a: -3 },
  { id: "trig_amp_v3", title: "振幅 3", a: 4 },
  { id: "trig_amp_v4", title: "振幅 4", a: -1 },
];

export const trigAmplitudeVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
