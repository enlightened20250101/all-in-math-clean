// src/lib/course/templates/math2/trig_phase_shift_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texLinear } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  b: number;
  shift: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "trig_phase_shift_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const inside = texLinear(c.b, -c.b * c.shift);
      return {
        templateId: c.id,
        statement: `関数 $y=\\sin(${inside})$ の位相のずれを求めよ。`,
        answerKind: "numeric",
        params: { shift: c.shift },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { shift: number }).shift);
    },
    explain(params) {
      const s = (params as { shift: number }).shift;
      return `### この問題の解説\n$\\sin(bx-b\\alpha)$ の位相のずれは $\\alpha$ なので答えは **${s}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_phase_v1", title: "位相 1", b: 2, shift: 30 },
  { id: "trig_phase_v2", title: "位相 2", b: 3, shift: 20 },
  { id: "trig_phase_v3", title: "位相 3", b: 4, shift: 15 },
  { id: "trig_phase_v4", title: "位相 4", b: 1, shift: 45 },
];

export const trigPhaseShiftVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
