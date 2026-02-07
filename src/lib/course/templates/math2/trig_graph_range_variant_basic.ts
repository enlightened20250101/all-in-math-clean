// src/lib/course/templates/math2/trig_graph_range_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst, texTerm } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  a: number;
  d: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  const max = c.d + Math.abs(c.a);
  return {
    meta: {
      id: c.id,
      topicId: "trig_graph_range_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const aTerm = texTerm(c.a, "\\sin x", true);
      const shift = texConst(c.d);
      return {
        templateId: c.id,
        statement: `関数 $y=${aTerm}${shift ? ` ${shift}` : ""}$ の最大値を求めよ。`,
        answerKind: "numeric",
        params: { max },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { max: number }).max);
    },
    explain(params) {
      const m = (params as { max: number }).max;
      return `### この問題の解説\n最大値は **${m}** です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_range_v1", title: "最大値（sin）1", a: 2, d: 1 },
  { id: "trig_range_v2", title: "最大値（sin）2", a: -3, d: 0 },
  { id: "trig_range_v3", title: "最大値（sin）3", a: 4, d: -1 },
  { id: "trig_range_v4", title: "最大値（sin）4", a: -2, d: 3 },
];

export const trigGraphRangeVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
