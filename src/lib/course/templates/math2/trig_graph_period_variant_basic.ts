// src/lib/course/templates/math2/trig_graph_period_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  b: number;
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
      const kx = c.b < 0 ? `(${c.b}x)` : `${c.b}x`;
      return {
        templateId: c.id,
        statement: `関数 $y=\\sin(${kx})$ の周期を求めよ。`,
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
  { id: "trig_period_v1", title: "周期 1", b: 2 },
  { id: "trig_period_v2", title: "周期 2", b: 3 },
  { id: "trig_period_v3", title: "周期 3", b: 4 },
  { id: "trig_period_v4", title: "周期 4", b: -2 },
];

export const trigGraphPeriodVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
