// src/lib/course/templates/math2/trig_phase_period_variant_basic.ts
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
  const period = 360 / Math.abs(c.b);
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_period_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const inside = texLinear(c.b, -c.b * c.shift);
      return {
        templateId: c.id,
        statement: `関数 $y=\\sin(${inside})$ の周期を求めよ。`,
        answerKind: "numeric",
        params: { period },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { period: number }).period);
    },
    explain(params) {
      const p = (params as { period: number }).period;
      return `### この問題の解説\n周期は $\\frac{360}{|${c.b}|}=${p}$。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_period_phase_1", title: "周期（位相あり）1", b: 2, shift: 30 },
  { id: "trig_period_phase_2", title: "周期（位相あり）2", b: 3, shift: 20 },
  { id: "trig_period_phase_3", title: "周期（位相あり）3", b: 4, shift: 15 },
  { id: "trig_period_phase_4", title: "周期（位相あり）4", b: -2, shift: 45 },
];

export const trigPhasePeriodVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
