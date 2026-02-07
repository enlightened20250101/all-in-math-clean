// src/lib/course/templates/math2/trig_graph_maxmin_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  a: number;
  d: number;
  kind: "max" | "min";
};

function buildTemplate(c: Case): QuestionTemplate {
  const max = c.d + Math.abs(c.a);
  const min = c.d - Math.abs(c.a);
  const value = c.kind === "max" ? max : min;
  return {
    meta: {
      id: c.id,
      topicId: c.kind === "max" ? "trig_graph_max_basic" : "trig_graph_min_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      return {
        templateId: c.id,
        statement: `関数 $y=${c.a}\\sin x+${c.d}$ の${c.kind === "max" ? "最大値" : "最小値"}を求めよ。`,
        answerKind: "numeric",
        params: { value },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { value: number }).value);
    },
    explain(params) {
      const v = (params as { value: number }).value;
      return `### この問題の解説\n答えは **${v}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_max_v1", title: "最大値 1", a: 2, d: 1, kind: "max" },
  { id: "trig_max_v2", title: "最大値 2", a: -3, d: 0, kind: "max" },
  { id: "trig_min_v1", title: "最小値 1", a: 2, d: 1, kind: "min" },
  { id: "trig_min_v2", title: "最小値 2", a: -3, d: 0, kind: "min" },
];

export const trigGraphMaxMinVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
