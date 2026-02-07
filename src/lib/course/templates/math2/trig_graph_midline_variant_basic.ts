// src/lib/course/templates/math2/trig_graph_midline_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  d: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_midline_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const aTerm = texTerm(2, "\\sin x", true);
      const shift = texConst(c.d);
      return {
        templateId: c.id,
        statement: `関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ の中線（平均値）を求めよ。`,
        answerKind: "numeric",
        params: { d: c.d },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { d: number }).d);
    },
    explain(params) {
      const d = (params as { d: number }).d;
      return `### この問題の解説\n中線は $y=${d}$ です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_mid_v1", title: "中線 1", d: 1 },
  { id: "trig_mid_v2", title: "中線 2", d: -2 },
  { id: "trig_mid_v3", title: "中線 3", d: 3 },
  { id: "trig_mid_v4", title: "中線 4", d: 0 },
];

export const trigGraphMidlineVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
