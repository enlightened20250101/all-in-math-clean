// src/lib/course/templates/math2/trig_graph_vertical_shift_variant_basic.ts
import type { QuestionTemplate } from "../../types";
import { gradeNumeric } from "../_shared/utils";
import { texConst } from "@/lib/format/tex";

type Case = {
  id: string;
  title: string;
  d: number;
};

function buildTemplate(c: Case): QuestionTemplate {
  return {
    meta: {
      id: c.id,
      topicId: "trig_vertical_shift_basic",
      title: c.title,
      difficulty: 1,
      tags: [],
    },
    generate() {
      const shift = texConst(c.d);
      return {
        templateId: c.id,
        statement: `関数 $y=\\sin x${shift ? ` ${shift}` : ""}$ のグラフは $y=\\sin x$ を上下に平行移動したもの。移動量を求めよ。`,
        answerKind: "numeric",
        params: { d: c.d },
      };
    },
    grade(params, userAnswer) {
      return gradeNumeric(userAnswer, (params as { d: number }).d);
    },
    explain(params) {
      const d = (params as { d: number }).d;
      return `### この問題の解説\n上方向に ${d} だけ平行移動です。`;
    },
  };
}

const CASES: Case[] = [
  { id: "trig_vshift_v1", title: "縦シフト 1", d: 2 },
  { id: "trig_vshift_v2", title: "縦シフト 2", d: -1 },
  { id: "trig_vshift_v3", title: "縦シフト 3", d: 3 },
  { id: "trig_vshift_v4", title: "縦シフト 4", d: 0 },
];

export const trigGraphVerticalShiftVariantTemplates: QuestionTemplate[] = CASES.map(buildTemplate);
