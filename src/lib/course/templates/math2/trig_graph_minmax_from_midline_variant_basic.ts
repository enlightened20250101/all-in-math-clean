// src/lib/course/templates/math2/trig_graph_minmax_from_midline_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";

type Case = {
  id: string;
  title: string;
  mid: number;
  amp: number;
  kind: "max" | "min";
};

function buildTemplate(c: Case): QuestionTemplate {
  const value = c.kind === "max" ? c.mid + c.amp : c.mid - c.amp;
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
        statement: `中線が ${c.mid}、振幅が ${c.amp} の三角関数の${c.kind === "max" ? "最大値" : "最小値"}を求めよ。`,
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
  { id: "trig_mid_amp_max_1", title: "最大値（中線/振幅）1", mid: 1, amp: 2, kind: "max" },
  { id: "trig_mid_amp_max_2", title: "最大値（中線/振幅）2", mid: -2, amp: 3, kind: "max" },
  { id: "trig_mid_amp_min_1", title: "最小値（中線/振幅）1", mid: 1, amp: 2, kind: "min" },
  { id: "trig_mid_amp_min_2", title: "最小値（中線/振幅）2", mid: -2, amp: 3, kind: "min" },
];

export const trigGraphMinMaxFromMidlineVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
